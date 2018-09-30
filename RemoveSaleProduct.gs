/**
* Shows the HTML form in a dialog shape.
*/
function openRemoveSaleProductsDialog() {
  var html = HtmlService.createTemplateFromFile('remove_sale_product')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1500)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Eliminar productos de Venta o Donación');
}


function removeSaleProduct(sale) {
  
  //sort the table preparing to do the multiple searches in order to update the inventory
  SpreadsheetApp.getActive().getSheetByName("Productos").sort(1, true);
  var productsSheet = MemsheetApp.getSheet("Productos");
  var sheet = MemsheetApp.getSheet("BD Ventas y donaciones desde BG");
  var deletedRows = [];
  var index = 0;
    
  console.log("sale", sale);
  
  console.time("count deleted");
  // Iterate each waybill product and set its attributes in each column.
  for (var row = sheet.getLastRow(); row>=2; row--) {
   
    for (var i = 0; i < sale.length; i++) {
      
      var product = sale[i];
      
      if (sheet.getCell(row, 3).getValue() == product.saleNumber && sheet.getCell(row,4).getValue() == product.id) {
        
         // increase stock of the product
         increaseProductStock(product.id, product.saleStock, productsSheet.getColumn(1));
        
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
  
  sheet = SpreadsheetApp.getActive().getSheetByName("BD Ventas y donaciones desde BG");

  console.log("deleted rows: ", deletedRows);
  
  console.time("delete rows");
  for (var j = 0; j < deletedRows.length; j++) {
   
    var row = parseInt(deletedRows[j]);
    
    sheet.deleteRow(row);
  }
  console.timeEnd("delete rows");
 
  
}
 
  
   

