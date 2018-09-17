/**
* Shows the HTML form in a dialog shape.
*/
function openReverseWaybillDialog() {
  var html = HtmlService.createTemplateFromFile('reverse_waybill')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(150).setWidth(400)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Anular Guía de Despacho');
}


/**
* Reverses the selected waybill
*/
function reverseWaybill(waybillId) {
  
  // validates the waybill existance
  
  console.time("waybill exists");
  if (waybillExists(waybillId)) {
   
    return 0;
  }
  console.timeEnd("waybill exists");
  
  console.time("reverse waybill");
  // get database values
  var sheet = SpreadsheetApp.getActive().getSheetByName('Base de Datos');
  var lastRow = sheet.getLastRow();
  var date = Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy")
      
  var values = [];
  values[0] = new Array(waybillId, date, "","","","","","",0,"nula","nula","");
  
  // erase the information of each column
  sheet.getRange(lastRow + 1, 1, 1,12).setValues(values);
      
   console.timeEnd("reverse waybill");
   return 1;
  
}

/**
* Returns true if all the waybill products are not sold.
*/
function isNotSoldProductsWaybill(waybillId) {
  
    // get the data in the active sheet 
	var sheet = getOutputSheet(1);
   
   // get the first cell of the output sheet
    var cell = getOutputFirstCell(1);
  
    // get the amount of states that the waybill products have.
    cell.setFormula("=QUERY('Base de Datos'!A:M;\"select A, J, count(J) where A="+ waybillId +" group by A, J\")");
  
    // get the amount of states that the waybill products have.
    var statuses = sheet.getRange(2, 1, sheet.getLastRow()-1, 3).getValues();
    var status = statuses[0];
  
    // get the statuses size
    var size = statuses.length;
  
    // if there is only the Not sold state, then the condition is true.
    if (size == 1 && status[1] == "No Vendido") {
   
      return true;
    
    }
   
    return false; 
}