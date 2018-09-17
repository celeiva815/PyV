/**
* Shows the HTML form in a dialog shape.
*/
function openInvoiceWaybillDialog() {
  var html = HtmlService.createTemplateFromFile('invoice_waybill')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1300)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Nueva Boleta, Factura o Guía de Devolución');
}

/**
* Gets the products of a waybill, based on its id.
*/
function getProductsStore(selectedStoreName) {
  
    // get the data in the active sheet 
    var sheet = getOutputSheet(1); 
  
    var cell = getOutputFirstCell(1);
  
    cell.setFormula("=QUERY('Base de Datos'!A:M;\"select F, G, H, K, sum(I) where J='No Vendido' and K='"+selectedStoreName+"' group by G, F, H, K\")");
  
	// create a 2 dim area of the data in the carrier names column and codes 
	var products = sheet.getRange(2, 1, sheet.getLastRow() -1, 5).getValues().reduce( 
		function(p, c) { 
          
          // add the product to the list
			p.push(c); 
			return p; 
		}, []); 
  
    return JSON.stringify(products);
}


function invoiceWaybill(bill) {
  
   var waybillIds = [];
  
  // Iterate each waybill product and set its attributes in each column.
  for (var i=0; i<bill.length; i++) {
   
    var product = bill[i];
    waybillIds[i] = changeStoreProductInventory(product);
  }
  
  return waybillIds;
}
  
function changeStoreProductInventory(product) {
    
  var sheet = SpreadsheetApp.getActive().getSheetByName("Base de Datos");
  var data = sheet.getRange("A:K").getValues();
  var amount = parseInt(product.amount);
  var store = product.store;
  var waybillIds = [];
  var j = 0;
  
  // iterate each row
  for (var i = 0; i < data.length; i++) {
    
    // check if it is a product-store-notselled row
    if (data[i][10] == store && data[i][5] == product.id && data[i][9] == "No Vendido") {
      
      // get the waybillId
      var waybillId = data[i][0];
      var waybillInventory = parseInt(data[i][8]);
      
      waybillIds[j] = waybillId;
      j++;
      
      //if the amount invoiced is less than the store inventory, we create a new row with the invoice and 
      if (amount < waybillInventory) {
       
        // insert a new row
        sheet.insertRows(i+2, 1);
        
        //clone the waybill products in the new row
        cloneInvoiceWaybillProduct(sheet, data, i+2, i);
        
        //set the invoiced products in the new row
        setInvoiceWaybillProduct(sheet, product, i+2);
        
        //set the values of the amount left in the original Not Sold waybill
        sheet.getRange(i+1,9).setValue(waybillInventory - amount);
        sheet.getRange(i+2,9).setValue(amount);

        // if it's a chargeback, increase the inventory        
        if (product.billType == "chargeback") {
         
          increaseProductStock(product.id, amount); 
          
        }
        
        break;
        
      } else if (amount == waybillInventory) {
         
        //set the sold products
        setInvoiceWaybillProduct(sheet, product, i+1);
        
        // if it's a chargeback, increase the inventory        
        if (product.billType == "chargeback") {
         
          increaseProductStock(product.id, amount); 
          
        }
        
        break;
       
      } else {
       
        //set the sold products
        setInvoiceWaybillProduct(sheet, product, i+1);
        
        // if it's a chargeback, increase the inventory        
        if (product.billType == "chargeback") {
         
          increaseProductStock(product.id, waybillInventory); 
          
        }
        
        // reduce the amount in
        amount = amount - waybillInventory;
      }
    }
    
    SpreadsheetApp.flush();
    
  } 
  
  return waybillIds;
}

  
  function cloneInvoiceWaybillProduct(sheet, data, row, i) {
   
    var start = new Date().getTime();
    
    var values = []    
    values[0] = data[i];
    
    sheet.getRange(row, 1, 1, 11).setValues(values);
    SpreadsheetApp.flush();
    
    Logger.log("cloneInvoice:" + new Date().getTime()-start);
  }
  
    function setInvoiceWaybillProduct(sheet, product, row) {
      
      var start = new Date().getTime();
  
        var billType = getSpanishBillType(product.billType);
        var status = getSpanishStatus(product.billType);
        
        var values = [];
        values[0] = new Array(billType, product.billId, product.billDate);
      
        sheet.getRange(row,3,1,3).setValues(values);
        sheet.getRange(row,10).setValue(status);
      
      if (product.billType == "chargeback") {
       
        sheet.getRange(row,12).setValue(product.chargeback);
      }
      
      SpreadsheetApp.flush();
      
      Logger.log("setInvoice:" + new Date().getTime()-start);
  }
  
  function getSpanishBillType(billType) {
   
    if (billType == "receipt") {
      return "Boleta";
    } else if (billType == "invoice") {
      return "Factura";
      
    } else if (billType == "chargeback") {
      return "Guía de Devolución";
    }  
  }
  
  function getSpanishStatus(billType) {
   
    if (billType == "receipt" || billType == "invoice") {
      return "Vendido";
   
    } else if (billType == "chargeback") {
      return "Devuelto";
    }  
  }

