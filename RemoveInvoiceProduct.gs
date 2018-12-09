/**
* Shows the HTML form in a dialog shape.
*/
function openRemoveInvoiceProductsDialog() {
  var html = HtmlService.createTemplateFromFile('remove_invoice_product')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1500)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Eliminar productos de Factura de Compra');
}


function removeInvoiceProduct(invoice) {
  
  //sort the table preparing to do the multiple searches in order to update the inventory
  SpreadsheetApp.getActive().getSheetByName("Productos").sort(1, true);
  var productsSheet = MemsheetApp.getSheet("Productos");
  var sheet = MemsheetApp.getSheet("BD Compras a Proveedores");
  var deletedRows = [];
  var index = 0;
    
  console.log("invoice", invoice);
  
  console.time("count deleted");
  // Iterate each waybill product and set its attributes in each column.
  for (var row = sheet.getLastRow(); row>=2; row--) {
   
    for (var i = 0; i < invoice.length; i++) {
      
      var product = invoice[i];
      
      if (sheet.getCell(row, 1).getValue() == product.invoiceNumber && sheet.getCell(row,5).getValue() == product.id) {
        
         // decrease stock of the product
         decreaseProductStock(product.id, product.invoiceStock, productsSheet.getColumn(1));
        
         // add to deleted the rows
         deletedRows[index] = row;
        index++; 
      }
    } 
  }
  console.timeEnd("count deleted");
  
  console.time("remove flush");
  MemsheetApp.flush("Productos");
  console.timeEnd("remove flush");   
  
  sheet = SpreadsheetApp.getActive().getSheetByName("BD Compras a Proveedores");

  console.log("deleted rows: ", deletedRows);
  
  console.time("delete rows");
  for (var j = 0; j < deletedRows.length; j++) {
   
    var row = parseInt(deletedRows[j]);
    
    sheet.deleteRow(row);
  }
  console.timeEnd("delete rows");
 
  
}
 
  
   

