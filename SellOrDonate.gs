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