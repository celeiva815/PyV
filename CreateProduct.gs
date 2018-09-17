/**
* Shows the HTML form in a dialog shape.
*/
function openCreateProductDialog() {
  var html = HtmlService.createTemplateFromFile('create_product')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(700).setWidth(400)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Crear Producto');
}


/**
* Creates a product to the database and updates the inventory.
*/
function createProduct(product) {
  
  if (existsProductCode(product.code)) {
    return -1; 
  }
  
  if (existsProductNameAndSize(product.name, product.size)) {
    return -2; 
  }
  
  var sheet = SpreadsheetApp.getActive().getSheetByName('Productos');
  var lastRow = sheet.getLastRow()
  
  var values = [];
  
  values[0] = new Array(product.id, product.code, product.name, product.size, product.type, product.space, product.workshop, product.material, product.termination, 1, product.inventory);

  sheet.getRange(lastRow + 1,1,1,11).setValues(values);
  SpreadsheetApp.flush();

  return true;  
}

function existsProductCode(code) {
  
    // get the data in the active sheet 
	var sheet = getOutputSheet(1);
   
   // get the first cell of the output sheet
    var cell = getOutputFirstCell(1);
  
    // get the amount of states that the waybill products have.
    cell.setFormula("=QUERY('Productos'!B:B;\"select count(B) where B='"+ code +"'\")");
  
    // get the amount of states that the waybill products have.
    var count = sheet.getRange("A2").getValue();
  
    // if there is only the Not sold state, then the condition is true.
    if (count >= 1) {
   
      return true;
    
    }
   
    return false;
  
}

function existsProductNameAndSize(name, size) {
  
    // get the data in the active sheet 
	var sheet = getOutputSheet(2);
   
   // get the first cell of the output sheet
    var cell = getOutputFirstCell(2);
  
    // get the amount of states that the waybill products have.
    cell.setFormula("=QUERY('Productos'!A:D;\"select count(A) where C='"+ name +"' and D='"+ size +"'\")");
  
    // get the amount of states that the waybill products have.
    var count = sheet.getRange("A2").getValue();
  
    // if there is one or more products, then the condition is true.
    if (count >= 1) {
   
      return true;
    
    }
   
    return false;
  
}