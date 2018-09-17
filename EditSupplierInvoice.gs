/**
* Shows the HTML form in a dialog shape.
*/
function openEditSupplierInvoiceDialog() {
  var html = HtmlService.createTemplateFromFile('edit_supplier_invoice')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1300)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Editar Factura de Compra');
}

/**
* Gets the products of an invoice, based on its id.
*/
function getSupplierInvoiceProducts(selectedInvoiceId) {
  
   // get the data in the active sheet 
	var sheet = SpreadsheetApp.getActive().getSheetByName('BD Compras a Proveedores'); 
	// create a 2 dim area of the data in the carrier names column and codes 
	var products = sheet.getRange(2, 1, sheet.getLastRow(), 12).getValues().reduce( 
		function(p, c) { 
          
          // get if the product belongs to the invoice or not
          var invoiceId = c[0];
          
          if (invoiceId == selectedInvoiceId) {
            
			p.push(c); 
          }
			return p; 
		}, []); 
  
    return JSON.stringify(products);
}

function editSupplierInvoice(invoice) {
    
  var sheet = SpreadsheetApp.getActive().getSheetByName('BD Compras a Proveedores');
  
  // Iterate each waybill product and set its attributes in each column.
  for (var i=0; i<invoice.length; i++) {
   
    var product = invoice[i];
    var amount = parseInt(product.amount);
    var cost = parseFloat(product.cost);
    var shipping = parseFloat(product.shipping);
    var invoiceStock = parseInt(product.invoiceStock);
    var difference = amount - invoiceStock;
    var totalCost = 0;
    var totalShipping = 0;
    var row = findInvoiceProductCellRow(product.invoiceNumber, product.id);
    var values = [];
    
    if (product.amount != "" && product.cost != "") {
          
      var totalCost = product.amount * product.cost;
      var totalShipping = totalCost * product.shipping /100
            
      sheet.getRange(row,8).setValue(product.amount);
      sheet.getRange(row,9).setValue(product.cost);
      sheet.getRange(row,10).setValue(totalCost);
      sheet.getRange(row,11).setValue(product.shipping);
      sheet.getRange(row,12).setValue(product.totalShipping);
      
          // decrease stock of the product
    increaseProductStock(product.id, difference);
      
    } else if (product.amount != "") {
      
        amount = product.amount;
        cost = sheet.getRange(row,9).getValue();
        totalCost = product.amount * cost;
        totalShipping = totalCost * product.shipping /100
        
      
        sheet.getRange(row,10).setValue(totalCost);
      
          // decrease stock of the product
    increaseProductStock(product.id, difference);
      
    } else if (product.cost != "") {
      
      var amount = sheet.getRange(row,8).getValue();
        sheet.getRange(row,9).setValue(product.cost);
        
      var totalCost = amount * product.cost;
        sheet.getRange(row,10).setValue(totalCost);
      
    }
    
    values[0] = new Array(amount, cost, totalCost, shipping, product.totalShipping);
    
    //set date and store
    sheet.getRange(row,2).setValue(product.invoiceDate);
    sheet.getRange(row,3).setValue(product.supplier);
    
  }
}
  
  
  
