/**
* Shows the HTML form in a dialog shape.
*/
function openAddWaybillDialog() {
  var html = HtmlService.createTemplateFromFile('add_waybill')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1600)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Ingresar Guía de Despacho');
}


/**
* Adds a waybill to the database and updates the inventory.
*/
function addWaybill(waybill) {
  
  //sort the table preparing to do the multiple searches in order to update the inventory
  SpreadsheetApp.getActive().getSheetByName("Productos").sort(1, true);
  
  console.time("total process");
  
  var sheet = SpreadsheetApp.getActive().getSheetByName('Base de Datos');
  var lastRow = sheet.getLastRow()
  
  var productSheet = MemsheetApp.getSheet("Productos");
  var productIdColumn = productSheet.getColumn(1);
  
  if (waybill.length > 0) {
   
    var waybillId = waybill[0].waybillNumber;
    
    if (waybillExists(waybillId)) {
       return -1;  
    }
    
  }
  
  var values = []
  
  // Iterate each waybill product and set its attributes in each column.
  
  for (var i=0; i<waybill.length; i++) {
   
    var product = waybill[i];
    var row = new Array(product.waybillNumber, product.waybillDate, "", "", "", product.id, product.name, product.size, product.amount, "No Vendido", product.store, product.price, product.total);
    
    values[i] = row;
    
    // decrease stock of the product
    decreaseProductStock(product.id, product.amount, productIdColumn);   
    
  } 
  
    //Add all the new rows
    console.time("write invoice");
    sheet.getRange(lastRow + 1,1,waybill.length,13).setValues(values);
    console.timeEnd("write invoice");
    console.time("write inventory");
    productSheet = MemsheetApp.getSheet("Productos");
    var column = productSheet.getColumn(11);
    console.log(productSheet);
    productSheet.getActiveSheet().getRange(1, 11, column.length, 1).setValues(column);
    //MemsheetApp.flush();
    console.timeEnd("write inventory");
  
    console.timeEnd("total process");
    
}

/**
* Updates the Inventario sheet with the given waybill.
*/
function updateInventory(waybill) {
 
  var sheet = SpreadsheetApp.getActive().getSheetByName('AutoInventario');
  var lastRow = getLastRowIndex(sheet);
  
  // Iterate each waybill product and set its attributes in each column.
  for (var i=7; i<lastRow; i++) {
   
    var productName = sheet.getRange(i,1).getValue();
    var productSize = sheet.getRange(i,2).getValue();
    
    for (var j=0; j<waybill.length; j++) {
     
      var product = waybill[j];
      
      if (productName == product.name && productSize == product.size) {
          
         // decrease the available with the amount 
          var available = sheet.getRange(i,3).getValue() - product.amount;         
          sheet.getRange(i,3).setValue(available);
        
          // increase the store amount
          var storeColumn = getStoreInventoryColumn(product.store);
          var storeAmountCell = sheet.getRange(i,storeColumn);
          
         // check if the cell is blank to set the product amount immediately
         // otherwise, get the value and sum the product amount
          if (storeAmountCell.isBlank()) {
             storeAmountCell.setValue(product.amount);
           
          } else {
            
            var storeAmount = storeAmountCell.getValue();
            storeAmount = parseInt(storeAmount,10) + parseInt(product.amount,10);
            storeAmountCell.setValue(storeAmount);
          }
        
          break;
      }
    }
  }  
}

function getStoreInventoryColumn(store) {
  
  var sheet = SpreadsheetApp.getActive().getSheetByName('AutoInventario');
  var range = sheet.getRange("D5:X5");
  var numCols = range.getNumColumns();
  
  for (var i = 1; i < numCols; i++) {
   
    var storeCell = range.getCell(1,i).getValue();
    
    if (store == storeCell) {
     
      return i + 3;
    }
  }
}


/**
* Gets the number or ID of the last Waybill created. */
function getNextWaybill() {
  
  var nextWaybill = parseInt(getLastWaybillCreated()) + 1; 
  
  return nextWaybill;
}