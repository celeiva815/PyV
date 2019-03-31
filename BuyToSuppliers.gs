/**
* Shows the HTML form in a dialog shape.
*/
function openBuyToSuppliersDialog() {
  var html = HtmlService.createTemplateFromFile('buy_to_suppliers')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1500)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Comprar a Proveedores');
}

/** 
* Gets the products names */ 
function getSupplierProducts(supplier) { 
  
	// get the data in the active sheet 
	var sheet = SpreadsheetApp.getActive().getSheetByName('Productos'); 
	// create a 2 dim area of the data in the carrier names column and codes 
	var products = sheet.getRange(2, 1, sheet.getLastRow(), 11).getValues().reduce( 
		function(p, c) { 
          
          // get if the product is active or not
          var active = c[9];
          var shop = c[6];
          
           console.log("shop", shop);
          
          if (active == 1 && shop == supplier) {
            
			p.push(c); 
          }
			return p; 
		}, []); 
  
  return JSON.stringify(products);
}


/**
* Gets the number or ID of the last supplier invoice created. */
function getLastInvoiceCreated() {
  
  // get the sheet
  var sheet = SpreadsheetApp.getActive().getSheetByName('BD Compras a Proveedores');
  
  // get the entire column
  var invoices = sheet.getRange("A:A").getValues();
  
  // hack the array to get the last position with information
  var lastInvoiceRow = invoices.filter(String).length;
  
  // get the last cell with a value
  var lastInvoice = invoices[lastInvoiceRow-1];
  
  return lastInvoice;
}


/**
* Adds the supplier invoice to the spreadsheet 
*/
function addSupplierInvoice(invoice) {
  
  //sort the table preparing to do the multiple searches in order to update the inventory
  SpreadsheetApp.getActive().getSheetByName("Productos").sort(1, true);
  
  var sheet = SpreadsheetApp.getActive().getSheetByName('BD Compras a Proveedores');
  var productSheet = MemsheetApp.getSheet("Productos");
  var productIdColumn = productSheet.getColumn(1);
  var lastRow = sheet.getLastRow()
  
  var values = [];
  
  // Iterate each waybill product and set its attributes in each column.
  for (var i=0; i < invoice.length; i++) {
   
    var product = invoice[i];
    
    var totalCost = product.amount * product.cost;
    var totalShipping = (totalCost * product.shipping) / 100;
    
    
    values[i] = new Array(product.invoiceNumber, product.invoiceDate, product.store,"",product.id,product.name,product.size,product.amount,product.cost,totalCost,product.shipping, totalShipping);
    
    // decrease stock of the product
    increaseProductStock(product.id, product.amount, productIdColumn);
    
  }   
  
  sheet.getRange(lastRow + 1,1,invoice.length,12).setValues(values);
  
  MemsheetApp.flush();
}
