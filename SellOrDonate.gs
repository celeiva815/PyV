/**
* Shows the HTML form in a dialog shape.
*/
function openSellOrDonateDialog() {
  var html = HtmlService.createTemplateFromFile('sell_or_donate')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1600)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Vender o Donar desde la Bodega General');
}

/**
* Adds the supplier invoice to the spreadsheet 
*/
function sellOrDonateProducts(invoice) {
  
  //sort the table preparing to do the multiple searches in order to update the inventory
  SpreadsheetApp.getActive().getSheetByName("Productos").sort(1, true);
  
  var sheet = SpreadsheetApp.getActive().getSheetByName('BD Ventas y donaciones desde BG');
  var productSheet = MemsheetApp.getSheet("Productos");
  var productIdColumn = productSheet.getColumn(1);
  var lastRow = sheet.getLastRow()
  
  var values = [];
  
  // Iterate each waybill product and set its attributes in each column.
  for (var i=0; i < invoice.length; i++) {
   
    var product = invoice[i];
    var billType = getSpanishDonationType(product.billType);
    var billStatus = getSpanishDonationStatus(product.billType);
    
    values[i] = new Array(product.billDate, billType, product.billId, product.id,product.name,product.size,product.amount, billStatus,product.store, product.price, product.total);
    
    // decrease stock of the product
    decreaseProductStock(product.id, product.amount, productIdColumn);
    
  }   
 
  sheet.getRange(lastRow + 1,1,invoice.length, 11).setValues(values);
  MemsheetApp.flush();
  
  saveRecipient(product.store);
  
}
  function getSpanishDonationType(billType) {
   
    if (billType == "receipt") {
      return "Boleta";
      
    } else if (billType == "invoice") {
      return "Factura";
      
    } else if (billType == "donation") {
      return "Donación";
    }  
  }
  
  function getSpanishDonationStatus(billType) {
   
    if (billType == "receipt" || billType == "invoice") {
      return "Vendido";
   
    } else if (billType == "donation") {
      return "Donado";
    }  
  }

 function saveRecipient(recipient) {
  
   var id = getRecipientId(recipient);
   
   if (!id) {
     
     var sheet = SpreadsheetApp.getActive().getSheetByName('Donatarios');
     var lastRow = sheet.getLastRow()
     var lastId = sheet.getRange(lastRow,1,1,1).getValue();
     var values = [];
     
     id = parseInt(lastId) + 1;              
     values[0] = new Array(id, recipient, 1);
     
     sheet.getRange(lastRow + 1,1,1,values[0].length).setValues(values);
     SpreadsheetApp.flush();
     
     return true;       
   } 
 }

function getRecipientId(recipient) {
  
    // get the data in the active sheet 
	var sheet = getOutputSheet(2);
   
   // get the first cell of the output sheet
    var cell = getOutputFirstCell(2);
  
    // get the amount of states that the waybill products have.
    cell.setFormula("=QUERY('Donatarios'!A:C;\"select A where B='"+ recipient +"'\")");
  
    // get the amount of states that the waybill products have.
    var id = sheet.getRange("A2").getValue();
  
    return id;
  
}

