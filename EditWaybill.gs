/**
* Shows the HTML form in a dialog shape.
*/
function openEditWaybillDialog() {
  var html = HtmlService.createTemplateFromFile('edit_waybill')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1300)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Editar Guía de Despacho');
}


/**
* Gets the not sold products of a waybill, based on its id.
*/
function getNotSoldWaybillProducts(selectedWaybillId) {
  
   // get the data in the active sheet 
	var sheet = getOutputSheet(1);
   
   // get the first cell of the output sheet
    var cell = getOutputFirstCell(1);
  
    // get the Not Sold products of a waybill
    cell.setFormula("=QUERY('Base de Datos'!A:M;\"select F, G, H, B, L, sum(I) where J='No Vendido' and A="+selectedWaybillId+" group by G, F, H, B, L\")");
  
    // find the inventory of each product
    sheet.getRange(2,7,sheet.getLastRow()-1,1).setFormula("=IFERROR(INDEX(Productos!K:K;MATCH(A2;Productos!A:A;0);0))");
  
	// create a 2 dim area of the data in the carrier names column and codes 
	var products = sheet.getRange(2, 1, sheet.getLastRow()-1, 7).getValues().reduce( 
		function(p, c) { 
            
            // add the product to the list;
			p.push(c); 
			return p; 
          
		}, []); 
  
    return JSON.stringify(products);
}

/**
* Gets the non-not sold products of a waybill, based on its id.
*/
function getOtherStatusWaybillProducts(selectedWaybillId) {
  
   // get the data in the active sheet 
	var sheet = getOutputSheet(2);
   
   // get the first cell of the output sheet
    var cell = getOutputFirstCell(2);
  
    // get the Not Sold products of a waybill
    cell.setFormula("=QUERY('Base de Datos'!A:M;\"select F, G, H, J, L, sum(I), B, K where J<>'No Vendido' and A="+selectedWaybillId+" group by G, F, H, J, L, B, K\")");
  
    // find the inventory of each product
    sheet.getRange(2,9,sheet.getLastRow(),1).setFormula("=IFERROR(INDEX(Productos!K:K;MATCH(A2;Productos!A:A;0);0))");
  
	// create a 2 dim area of the data in the carrier names column and codes 
	var products = sheet.getRange(2, 1, sheet.getLastRow(), 9).getValues().reduce( 
		function(p, c) { 
            
            // add the product to the list;
			p.push(c); 
			return p; 
          
		}, []); 
  
    return JSON.stringify(products);
}


function getWaybillProperties(waybillId) {

    // get the output3 sheet
    var sheet = getOutputSheet(3);
  
    // get the first cell of the Output3 sheet
    var cell = getOutputFirstCell(3) 
    
    var properties = [];
    
    // set the formula to get the asked information
    cell.setFormula("=QUERY('Base de Datos'!A:M;\"select K, B where A=" + waybillId + "\")");
    
	// create a 2 dim area of the data in the carrier names column and codes 
	var store = sheet.getRange("A2").getValue();
    var date = sheet.getRange("B2").getValue();
    
    // add the properties to the array
    properties.push(store);
    properties.push(date);
    
    // return them as string
    return JSON.stringify(properties);
  
}

function editWaybill(waybill) {
  
  //sort the table preparing to do the multiple searches in order to update the inventory
  SpreadsheetApp.getActive().getSheetByName("Productos").sort(1, true);
  var productsSheet = MemsheetApp.getSheet("Productos");
  var sheet = MemsheetApp.getSheet("Base de Datos");
  
  console.time("edit iteration");
  // Iterate each waybill product and set its attributes in each column.
  for (var i=0; i<waybill.length; i++) {
   
    var product = waybill[i];
    
    var row = findWaybillProductCellRow(product.waybillNumber, product.id, sheet);
    
    sheet.getCell(row,9).setValue(product.amount);
    
    // decrease stock of the product
    decreaseProductStock(product.id, product.amount - product.waybillStock, productsSheet.getColumn(1));
  }
  console.timeEnd("edit iteration");
  
  console.time("edit flush");
  MemsheetApp.flush();
  console.timeEnd("edit flush");
  
}
  
  function findWaybillProductCellRow(waybillId, productId, dataBaseSheet) {

  for (var i = 1; i <= dataBaseSheet.getLastRow(); i++) {
    
    if (dataBaseSheet.getCell(i,1).getValue() == waybillId && dataBaseSheet.getCell(i,6).getValue() == productId && dataBaseSheet.getCell(i,10).getValue() == "No Vendido") {
      
      var row = i;
      return row;
    }
  }
}
  
   

