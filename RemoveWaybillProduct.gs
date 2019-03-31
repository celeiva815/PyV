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

/**
* Gets the not sold products of an invoice, based on its id.
*/
function getNotSoldWaybillProducts(waybillId) {
  
   // get the output1 sheet
	var sheet = getOutputSheet(1)
    
    // get the first cell of the Output1 sheet
    var cell = getOutputFirstCell(1);
  
     // set the formula to get the asked information
    cell.setFormula("=QUERY('Base de Datos'!A:M;\"select F, G, H, J, L, sum(I) where J='No Vendido' and A="+waybillId+" group by G, F, H, J, L\")");
  
     // find the inventory of each product
    sheet.getRange(2,7,sheet.getLastRow()-1,1).setFormula("=IFERROR(INDEX(Productos!K:K;MATCH(A2;Productos!A:A;0);0))");
    
	// create a 2 dim area of the data in the carrier names column and codes 
	var products = sheet.getRange(2, 1, sheet.getLastRow()-1, 7).getValues();
  
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

 
  
   

