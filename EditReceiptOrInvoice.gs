/**
* Shows the HTML form in a dialog shape.
*/
function openEditReceiptOrInvoiceDialog() {
  var html = HtmlService.createTemplateFromFile('edit_receipt_or_invoice')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1500)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Editar Boleta o Factura');
}

/**
* Gets the store of an invoice, based on its id.
*/
function getInvoiceProperties(selectedInvoiceId, selectedBill, selectedDate) {

    // get the output2 sheet
    var sheet = getOutputSheet(2);
  
    // get the first cell of the Output2 sheet
    var cell = getOutputFirstCell(2) 
    
    var properties = [];
  
    var date = new Date(Date.parse(selectedDate));
    var month = date.getMonth();  
    var year = date.getFullYear();

    // set the formula to get the asked information
    cell.setFormula("=QUERY('Base de Datos'!A:M;\"select K, L, C where D=" + selectedInvoiceId + " and C='" + selectedBill + "' and month(E)=" + month + " and year(E)=" + year + "\")");
    
	// create a 2 dim area of the data in the carrier names column and codes 
	var store = sheet.getRange("A2").getValue();
    var chargeback = sheet.getRange("B2").getValue();
    var bill = sheet.getRange("C2").getValue();
  
    // add the properties to the array
    properties.push(store);
    properties.push(chargeback);
    properties.push(bill);
  
    // return them as string
    return JSON.stringify(properties);
}

/**
* Gets the not sold products of an invoice, based on its id.
*/
function getNotSoldProducts(store) {
  
   // get the output1 sheet
	var sheet = getOutputSheet(1)
    
    // get the first cell of the Output1 sheet
    var cell = getOutputFirstCell(1);
  
     // set the formula to get the asked information
    cell.setFormula("=QUERY('Base de Datos'!A:M;\"select F, G, H, J, L, sum(I) where J='No Vendido' and K='"+store+"' group by G, F, H, J, L\")");
    
	// create a 2 dim area of the data in the carrier names column and codes 
	var products = sheet.getRange(2, 1, sheet.getLastRow()-1, 6).getValues();
  
  if (products.length > 0) {
   
    products.reduce( 
		function(p, c) { 
          
          // if the inventory is greater than zero, add it to the list
          var inventory = c[5];
          
          if (inventory > 0) {
            
			p.push(c); 
          }
			return p; 
		}, []); 
  }
 
  
    return JSON.stringify(products);
}


/**
* Gets the products of an invoice, based on its id.
*/
function getInvoiceProducts(selectedInvoiceId, selectedBill, selectedDate) {

    // get the output2 sheet
    var sheet = getOutputSheet(2);
  
    // get the first cell of the Output2 sheet
    var cell = getOutputFirstCell(2) 
    
    var date = new Date(Date.parse(selectedDate));
    var month = date.getMonth();  
    var year = date.getFullYear();
    
    // set the formula to get the asked information
    cell.setFormula("=QUERY('Base de Datos'!A:M;\"select F, G, H, J, L, sum(I) where D="+selectedInvoiceId+ " and C='" + selectedBill + "' and month(E)=" + month + " and year(E)=" + year + " group by G,F,H,J,L\")");
    
    // find the store inventory of each product
    sheet.getRange(2,7,sheet.getLastRow()-1,1).setFormula("=IFERROR(INDEX(Output1!F:F;MATCH(A2;Output1!A:A;0);0))");
  
	// create a 2 dim area of the data in the carrier names column and codes 
	var products = sheet.getRange(2, 1, sheet.getLastRow()-1, 7).getValues().reduce( 
		function(p, c) { 

          var status = c[3];
          
          if (status != "No Vendido") {
            
			p.push(c); 
          }
			return p; 
		}, []); 
  
    return JSON.stringify(products);
}


function editReceiptOrInvoice(bill) {
 
  var sheet = MemsheetApp.getSheet("Base de Datos");
    
  //sort the table preparing to do the multiple searches in order to update the inventory
  SpreadsheetApp.getActive().getSheetByName("Productos").sort(1, true);
  var productSheet = MemsheetApp.getSheet("Productos");
  var productIdColumn = productSheet.getColumn(1);
  
  
  // Iterate each waybill product and set its attributes in each column.
  for (var i=0; i<bill.length; i++) {
   
    var product = bill[i];
    
    resetNotSoldWaybillProduct(product, sheet, productIdColumn);
    
  }  
  
  return invoiceWaybill(bill);
}

function findReceiptOrInvoiceProductCellRow(product) {
    
  var sheet = SpreadsheetApp.getActive().getSheetByName("Base de Datos");
  var data = sheet.getRange("A:L").getValues();
  var billType = getSpanishBillType(product.billType);
  var productId = product.id;
  var waybillId = product.billId;
  
  for (var i = data.length - 1; i >= 0; i--) {
    
    if (data[i][3] == waybillId && data[i][5] == productId && data[i][2] == billType) {
      
      var row = i+1;
      return row;
    }
  }
  
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

/**
* Reset the waybills into 
*/
function resetNotSoldWaybillProduct(product, sheet, productIdColumn) {
 
  var billType = getSpanishBillType(product.billType);
  var productId = product.id;
  var waybillId = product.billId;
  
  for (var i = sheet.rows.length - 1; i >= 0; i--) {
    
    if (sheet.rows[i][3] == waybillId && sheet.rows[i][5] == productId && sheet.rows[i][2] == billType) {
      
        sheet.getCell(i+1,3).setValue("");
        sheet.getCell(i+1,4).setValue("");
        sheet.getCell(i+1,5).setValue("");
        sheet.getCell(i+1,10).setValue("No Vendido");
        sheet.getCell(i+1,14).setValue("");
      
      // If the billtype is a chargeback, we have to reset the product inventory for a while.
      if (product.billType == "chargeback") {
        
        var amount = sheet.getCell(i+1,9).getValue();
        amount = parseInt(amount);
        
        decreaseProductStock(productId, amount, productIdColumn);
        
      }
      
    }
  }
 
}
