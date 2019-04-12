function openUndoInvoiceDialog() {
  var html = HtmlService.createTemplateFromFile('reverse_waybill')
  .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(150).setWidth(400)
  .setTitle('Dialog');
  SpreadsheetApp.getUi().showModalDialog(html, 'Deshacer Facturación o Devolución');
}

function undoinvoice(invoiceId, invoiceBill, invoiceDate) {
  
  //sort the table preparing to do the multiple searches in order to update the inventory
	SpreadsheetApp.getActive().getSheetByName("Productos").sort(1, true);
	var productsSheet = MemsheetApp.getSheet("Productos");
	var sheet = MemsheetApp.getSheet("Base de Datos");
    var billType = getSpanishBillType(invoiceBill);
    var date = new Date(Date.parse(invoiceDate));
    var month = date.getMonth();  
    var year = date.getFullYear();
   

	for (var i = sheet.rows.length - 1; i >= 0; i--) {
    
    	console.log(sheet.rows[i][2]);
	    if (sheet.rows[i][2] == billType && sheet.rows[i][3] == invoiceId && sheet.rows[i][4] == invoiceDate) {
	      
	        sheet.getCell(i+1,3).setValue("");
	        sheet.getCell(i+1,4).setValue("");
	        sheet.getCell(i+1,5).setValue("");
	        sheet.getCell(i+1,10).setValue("No Vendido");
	        sheet.getCell(i+1,14).setValue("");
      
			// If the billtype is a chargeback, we have to reset the product inventory for a while.
			if (invoiceBill == "Guía de Devolución") {

				var productId = sheet.getCell(i+1,6).getValue();
				var amount = sheet.getCell(i+1,9).getValue();
				amount = parseInt(amount);
				decreaseProductStock(productId, amount, productsSheet.getColumn(1));
	      	}
    	}
	}
  
  MemsheetApp.flush();
}