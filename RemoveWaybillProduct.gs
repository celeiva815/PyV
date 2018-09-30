/**
* Shows the HTML form in a dialog shape.
*/
function openRemoveWaybillProductsDialog() {
  var html = HtmlService.createTemplateFromFile('remove_waybill_product')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1000)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Eliminar productos de Guía de Despacho');
}


function removeWaybillProduct(waybill) {
  
  //sort the table preparing to do the multiple searches in order to update the inventory
  SpreadsheetApp.getActive().getSheetByName("Productos").sort(1, true);
  var productsSheet = MemsheetApp.getSheet("Productos");
  var sheet = MemsheetApp.getSheet("Base de Datos");
  var deletedRows = [];
  var index = 0;
    
  console.log("waybill", waybill);
  
  console.time("count deleted");
  // Iterate each waybill product and set its attributes in each column.
  for (var row = sheet.getLastRow(); row>=2; row--) {
   
    for (var i = 0; i < waybill.length; i++) {
      
      var product = waybill[i];
      
      if (sheet.getCell(row, 1).getValue() == product.waybillNumber && sheet.getCell(row,6).getValue() == product.id && sheet.getCell(row,10).getValue() == "No Vendido") {
        
         // increase stock of the product
         increaseProductStock(product.id, product.waybillStock, productsSheet.getColumn(1));
        
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
  
  sheet = SpreadsheetApp.getActive().getSheetByName("Base de Datos");

  console.log("deleted rows: ", deletedRows);
  
  console.time("delete rows");
  for (var j = 0; j < deletedRows.length; j++) {
   
    var row = parseInt(deletedRows[j]);
    
    sheet.deleteRow(row);
  }
  console.timeEnd("delete rows");
 
  
}
 
  
   

