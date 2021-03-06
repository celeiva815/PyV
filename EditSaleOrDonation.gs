/**
* Shows the HTML form in a dialog shape.
*/
function openEditSaleOrDonationDialog() {
  var html = HtmlService.createTemplateFromFile('edit_sale_or_donation')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(1000).setWidth(1500)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Editar Venta o Donación');
}


/**
* Gets the products of a donation invoice, based on its id.
*/
function getDonatedProducts(selectedInvoiceId) {

    // get the output1 sheet
    var sheet = getOutputSheet(1);
  
    // get the first cell of the Output1 sheet
    var cell = getOutputFirstCell(1) 
    
    // set the formula to get the asked information
    cell.setFormula("=QUERY('BD Ventas y donaciones desde BG'!A:M;\"select D, E, F, I, B, A, J, sum(G), K where C=" + selectedInvoiceId + " group by D, F, E, I, B, A, J, K\")");
    
    // find the inventory of each product
    sheet.getRange(2,10,sheet.getLastRow(),1).setFormula("=IFERROR(INDEX(Productos!K:K;MATCH(A2;Productos!A:A;0);0))");
  
	// create a 2 dim area of the data in the carrier names column and codes 
	var products = sheet.getRange(2, 1, sheet.getLastRow(), 10).getValues().reduce( 
		function(p, c) { 

           // if the inventory is greater than zero, add it to the list
          var productId = c[0];
          
          if (productId > 0) {
			p.push(c); 
             
          }
          
			return p; 
          
		}, []); 
  
    return JSON.stringify(products);
}


/**
* Adds the supplier invoice to the spreadsheet 
*/
function editSaleOrDonation(invoice) {
  
  //sort the table preparing to do the multiple searches in order to update the inventory
  SpreadsheetApp.getActive().getSheetByName("Productos").sort(1, true);
  
  var sheet = MemsheetApp.getSheet("BD Ventas y donaciones desde BG");
  var productSheet = MemsheetApp.getSheet("Productos");
  var productIdColumn = productSheet.getColumn(1);
  
  // Iterate each waybill product and set its attributes in each column.
  for (var i=0; i<invoice.length; i++) {
   
    var product = invoice[i];
    var billType = getSpanishDonationType(product.billType);
    var billStatus = getSpanishDonationStatus(product.billType);
    var difference = product.amount - product.invoiceStock;
    
    var row = findSaleOrDonationProductCellRow(product.billId, product.id);
    
    // if there is no row, it means it's a new product, so add it at the final of the table.
    if (!row) {
      
      row = sheet.getLastRow() + 1;
    }
    
    sheet.getCell(row,1).setValue(product.billDate);
    sheet.getCell(row,2).setValue(billType);
    sheet.getCell(row,3).setValue(product.billId);
    sheet.getCell(row,4).setValue(product.id);
    sheet.getCell(row,5).setValue(product.name);
    sheet.getCell(row,6).setValue(product.size);
    sheet.getCell(row,7).setValue(product.amount);
    sheet.getCell(row,8).setValue(billStatus);
    sheet.getCell(row,9).setValue(product.store);
    sheet.getCell(row,10).setValue(product.price);
    sheet.getCell(row,11).setValue(product.total);
    
    // decrease stock of the product
    decreaseProductStock(product.id, difference, productIdColumn);
  }  
  
  MemsheetApp.flush();
  
  saveRecipient(product.store, product.email, product.phone);
}

function findSaleOrDonationProductCellRow(waybillId, productId) {
    
  var sheet = SpreadsheetApp.getActive().getSheetByName("BD Ventas y donaciones desde BG");
  var data = sheet.getRange("A:J").getValues();
  
  for (var i = data.length - 1; i >= 0; i--) {
    
    if (data[i][2] == waybillId && data[i][3] == productId) {
      
      var row = i+1;
      return row;
    }
  }
  
}