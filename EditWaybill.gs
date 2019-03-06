/**
* Shows the HTML form in a dialog shape.
*/
function openEditWaybillDialog() {
  var html = HtmlService.createTemplateFromFile('edit_waybill')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1700)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Editar Guía de Despacho');
}


/**
* Gets the products of a waybill, based on its id.
*/
function getWaybillProducts(selectedWaybillId) {
  
   // get the data in the active sheet 
	var sheet = getOutputSheet(1);
   
   // get the first cell of the output sheet
    var cell = getOutputFirstCell(1);
  
    // get the Not Sold products of a waybill
    cell.setFormula("=QUERY('Base de Datos'!A:M;\"select F, G, H, J, I, L where A="+selectedWaybillId+" order by J desc \")");
  
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
  
  // Iterate each waybill product and set its attributes in each column.
  for (var i=0; i<waybill.length; i++) {
   
    var product = waybill[i];
    
    var row = findWaybillProductCellRow(product.waybillNumber, product.id, sheet);
    
    // if there is no row, it means it's a new product, so add it at the final of the table.
    if (!row) {
      
      row = sheet.getLastRow() + 1;
    }
    
    sheet.getCell(row,1).setValue(product.waybillNumber);
    sheet.getCell(row,2).setValue(product.waybillDate);
    sheet.getCell(row,3).setValue('');
    sheet.getCell(row,4).setValue('');
    sheet.getCell(row,5).setValue('');
    sheet.getCell(row,6).setValue(product.id);
    sheet.getCell(row,7).setValue(product.name);
    sheet.getCell(row,8).setValue(product.size);
    sheet.getCell(row,9).setValue(product.amount);
    sheet.getCell(row,10).setValue(product.status);
    sheet.getCell(row,11).setValue(product.store);
    sheet.getCell(row,12).setValue(product.price);
    sheet.getCell(row,13).setValue(product.total);
    
    
    // decrease stock of the product
    decreaseProductStock(product.id, parseInt(product.amount) - parseInt(product.waybillAmount), productsSheet.getColumn(1));
  }
  
  MemsheetApp.flush();
  
}
  
  function findWaybillProductCellRow(waybillId, productId, dataBaseSheet) {

  for (var i = 1; i <= dataBaseSheet.getLastRow(); i++) {
    
    if (dataBaseSheet.getCell(i,1).getValue() == waybillId && dataBaseSheet.getCell(i,6).getValue() == productId && dataBaseSheet.getCell(i,10).getValue() == "No Vendido") {
      
      var row = i;
      return row;
    }
  }
}
  
   

