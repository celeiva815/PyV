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
  
  saveRecipient(product.store, product.email, product.phone);
  
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

 function saveRecipient(recipient, email, phone) {
  
   var row = findRecipientCellRow(recipient);
   var sheet = MemsheetApp.getSheet('Donatarios');
   var values = [];
   
   if (!row) {

     row = sheet.getLastRow()
     var lastId = sheet.getRange(lastRow,1,1,1).getValue(); 
     var id = parseInt(lastId) + 1;
     
     values[0] = new Array(id, recipient, 1, email, phone);
     
     sheet.getRange(row + 1,1,1,values[0].length).setValues(values);
     MemsheetApp.flush();
     
     return true;    
     
   } else {
     
     values[0] = new Array(recipient, 1, email, phone);
     sheet.getActiveSheet().getRange(row,2,1,values[0].length).setValues(values);
     MemsheetApp.flush();
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

function getContactInfo(recipient) {
  
    // get the data in the active sheet 
	var sheet = getOutputSheet(1);
   
   // get the first cell of the output sheet
    var cell = getOutputFirstCell(1);
  
    // get the amount of states that the waybill products have.
    cell.setFormula("=QUERY('Donatarios'!A:E;\"select D, E where B='"+ recipient +"'\")");
  
    var contactInfo = [];
    // get the amount of states that the waybill products have.
    var email = sheet.getRange("A2").getValue();
    var phone = sheet.getRange("B2").getValue();
  
    contactInfo.push(email);
    contactInfo.push(phone);
  
    return JSON.stringify(contactInfo);
}

function findRecipientCellRow(recipient) {
    
  var sheet = SpreadsheetApp.getActive().getSheetByName("Donatarios");
  var data = sheet.getRange("A:E").getValues();
  
  for (var i = data.length - 1; i >= 0; i--) {
    
    if (data[i][1] == recipient) {
      
      var row = i+1;
      return row;
    }
  }
  
  return 0;
}
