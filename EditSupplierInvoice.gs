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
  
  console.log(invoice);
  
  //sort the table preparing to do the multiple searches in order to update the inventory
  SpreadsheetApp.getActive().getSheetByName("Productos").sort(1, true);
  
  var productSheet = MemsheetApp.getSheet("Productos");
  var productIdColumn = productSheet.getColumn(1);
  var sheet = MemsheetApp.getSheet('BD Compras a Proveedores');
  
  // Iterate each waybill product and set its attributes in each column.
  for (var i=0; i<invoice.length; i++) {
   
    var product = invoice[i];
    
    var amount = parseInt(product.amount);
    var cost = parseFloat(product.cost);
    var shipping = parseFloat(product.shipping);
    var invoiceStock = parseInt(product.invoiceStock);
    var invoiceCost = parseFloat(product.invoiceCost);
    var invoiceShipping = parseFloat(product.invoiceCost);
    
    var difference = amount - invoiceStock;
    
    var row = findInvoiceProductCellRow(product.invoiceNumber, product.id);
    var totalCost = amount * cost;
    var totalShipping = totalCost * shipping /100
    
    
    // if there is no row, it means it's a new product, so add it at the final of the table.
    if (!row) {
      
      row = sheet.getLastRow() + 1;
    }
    
      sheet.getCell(row,1).setValue(product.invoiceNumber);
      sheet.getCell(row,2).setValue(product.invoiceDate);
      sheet.getCell(row,3).setValue(product.supplier);
      sheet.getCell(row,4).setValue(""); // here is the supplier code
      sheet.getCell(row,5).setValue(product.id);
      sheet.getCell(row,6).setValue(product.name);
      sheet.getCell(row,7).setValue(product.size);
      sheet.getCell(row,8).setValue(amount);
      sheet.getCell(row,9).setValue(cost);
      sheet.getCell(row,10).setValue(totalCost);
      sheet.getCell(row,11).setValue(shipping);
      sheet.getCell(row,12).setValue(totalShipping);
      
          // decrease stock of the product
    increaseProductStock(product.id, difference, productIdColumn);
    
  }
  
  MemsheetApp.flush();
  
}
  
  
  
