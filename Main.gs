/**
* Sets the menu with all the options 
*/
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .createMenu('PyV')
      .addItem('Ingresar Guía', 'openAddWaybillDialog')
      .addItem('Editar Guía', 'openEditWaybillDialog')
      .addItem('Eliminar productos de Guía', 'openRemoveWaybillProductsDialog')
      .addItem('Anular Guía', 'openReverseWaybillDialog')
      .addSeparator()
      .addItem('Comprar a Proveedores', 'openBuyToSuppliersDialog')
      .addItem('Editar Factura de Compra', 'openEditSupplierInvoiceDialog')
      .addItem('Eliminar productos de Factura de Compra', 'openRemoveInvoiceProductsDialog')  
      .addSeparator()
      .addItem('Facturar a Tiendas', 'openInvoiceWaybillDialog')
      .addItem('Editar Factura o Boleta', 'openEditReceiptOrInvoiceDialog')  
      .addSeparator()
      .addItem('Vender o Donar', 'openSellOrDonateDialog')
      .addItem('Editar Venta o Donación ', 'openEditSaleOrDonationDialog')
      .addSeparator()
      .addItem('Crear Producto', 'openCreateProductDialog')  
      .addSeparator()
      .addItem('Test', 'LogTest')  
      .addToUi();

}

/** 
* Gets the products names */ 
function getActiveProducts() { 
	// get the data in the active sheet 
	var sheet = SpreadsheetApp.getActive().getSheetByName('Productos'); 
	// create a 2 dim area of the data in the carrier names column and codes 
	var products = sheet.getRange(2, 1, sheet.getLastRow(), 11).getValues().reduce( 
		function(p, c) { 
          
          // get if the product is active or not
          var active = c[9];
          
          if (active == 1) {
			p.push(c); 
          }
			return p; 
		}, []); 
  
  return products;
}

/** 
* Gets the active stores names */ 
function getActiveStores() { 
	// get the data in the active sheet 
	var sheet = SpreadsheetApp.getActive().getSheetByName('Tiendas'); 
  
	// create a 2 dim area of the data in the stores names column and codes 
	var stores = sheet.getRange(2, 1, sheet.getLastRow(), 3).getValues().reduce( 
		function(p, c) {
          
          // get if the store is active or not
          var active = c[2];
          
          if (active) {
			p.push(c); 
          }
			return p;
          
		}, []); 
  
  return stores;
}

/** 
* Gets the active suppliers names */ 
function getActiveSuppliers() { 
	// get the data in the active sheet 
	var sheet = SpreadsheetApp.getActive().getSheetByName('Proveedores'); 
  
	// create a 2 dim area of the data in the stores names column and codes 
	var stores = sheet.getRange(2, 1, sheet.getLastRow(), 3).getValues().reduce( 
		function(p, c) {
          
          // get if the store is active or not
          var active = c[2];
          
          if (active) {
			p.push(c); 
          }
			return p;
          
		}, []); 
  
  return stores;
}

/** 
* Gets the active recipients names */ 
function getActiveRecipients() { 
	// get the data in the active sheet 
	var sheet = SpreadsheetApp.getActive().getSheetByName('Donatarios'); 
  
	// create a 2 dim area of the data in the stores names column and codes 
	var recipients = sheet.getRange(2, 1, sheet.getLastRow(), 3).getValues().reduce( 
		function(p, c) {
          
          // get if the store is active or not
          var active = c[2];
          
          if (active) {
			p.push(c); 
          }
			return p;
          
		}, []); 
  
  return recipients;
}


/**
* Returns the last index with value, based on one. 
*/
function getLastRowIndex(sheet) {
  
  // get the entire column
  var column = sheet.getRange("A:A").getValues();
  
  // hack the array to get the last position with information
  var lastRow = column.filter(String).length;
  
  return lastRow;
  
}


/**
* Returns the first cell (A1) of the Output sheet.
*/
function getOutputFirstCell(number) {
 
    // get the Output sheet
  	var sheet = getOutputSheet(number);
 
    // clear the previous information of the sheet 
    sheet.clear();
    
    //  get the first cell 
    var cell = sheet.getRange("A1");
  
    return cell;
}

/**
* Returns the Output sheet.
*/
function getOutputSheet(number) {
 
    // get the Output sheet
  	var sheet = SpreadsheetApp.getActive().getSheetByName("Output" + number);

    return sheet;
}

/**
* Gets the number or ID of the last Waybill created in the Data Base. */
function getLastWaybillCreated() {
  
  // get the sheet
  var sheet = SpreadsheetApp.getActive().getSheetByName('Base de Datos');
  
  var colArray = sheet.getRange(2, 1, sheet.getLastRow()).getValues();

  var maxInColumn = colArray.sort(function(a,b){return b-a})[0][0];
  
  return maxInColumn;
}

/**
* Gets the number or ID of the last Waybill created in the Data Base. */
function getLastProductCreated() {
  
  // get the sheet
  var sheet = SpreadsheetApp.getActive().getSheetByName('Productos');
  
  var colArray = sheet.getRange(2, 1, sheet.getLastRow()).getValues();

  var maxInColumn = colArray.sort(function(a,b){return b-a})[0][0];
  
  return maxInColumn;
}

/**
* Gets the number or ID of the last Waybill created in the Data Base. */
function getMinimumInvoiceIdCreated() {
  
  // get the sheet
  var sheet = SpreadsheetApp.getActive().getSheetByName('BD Ventas y donaciones desde BG');
  
  // get the entire column
  var invoices = sheet.getRange("C2:C").getValues();
  
  // get the last cell with a value
  var minInColumn = invoices.sort(
    function(a,b) { 
      return a-b 
  })[0][0];
  
  return minInColumn;
}

/**
* Decrease the available product stock in an amount
*/
function decreaseProductStock(productId, amount, productIdColumn) {
  
   console.time("inventario " + productId);
   increaseProductStock(productId, -amount, productIdColumn);
   console.timeEnd("inventario " + productId);
}

/**
* Increase the available product stock in an amount
*/
function increaseProductStock(productId, amount, productIdColumn) {
 
    var inventorySheet = MemsheetApp.getSheet("Productos");
    var stockRowCell = columnBinarySearch(productIdColumn, productId) + 1;
    
    var stock = inventorySheet.getCell(stockRowCell, 11).getValue();
  
    // if the stock is null or empty, set a zero instead.
    if (!stock) {
       stock = 0;
    }
    
    var newStock = (parseInt(stock) + parseInt(amount));
    
    // set the new stock, substracting the amount
    inventorySheet.getCell(stockRowCell,11).setValue(newStock);
  
}

/**
* Returns the row number of a product Id in the Inventory.
*/
function findStockRowCell(productId) {
  
  console.time("columna ID");
  var sheet = SpreadsheetApp.getActive().getSheetByName("Productos");
  var data = sheet.getRange("A:A").getValues();
  console.timeEnd("columna ID");
  
  console.time("binary");
  var rowPosition = 
  console.timeEnd("binary");  
  
  return rowPosition;
}

function findInvoiceProductCellRow(invoiceId, productId) {
  
  var sheet = SpreadsheetApp.getActive().getSheetByName("BD Compras a Proveedores");
  var data = sheet.getRange("A:J").getValues();
  
  for (var i = data.length - 1; i >= 0; i--) {
    
    if (data[i][0] == invoiceId && data[i][4] == productId) {
      
      var row = parseInt(i+1);
      return row;
    }
  }
}

/**
* Returns true if the waybill exists in the database
*/
function waybillExists(waybillId) {
  
   // get the data in the active sheet 
	var sheet = getOutputSheet(1);
   
   // get the first cell of the output sheet
    var cell = getOutputFirstCell(1);
  
    // get the amount of states that the waybill products have.
    cell.setFormula("=QUERY('Base de Datos'!A:M;\"select count(A) where A="+ waybillId +"\")");
  
    // get the amount of states that the waybill products have.
    var count = sheet.getRange("A2").getValue();
  
    // if there is only the Not sold state, then the condition is true.
    if (count >= 1) {
   
      return true;
    
    }
   
    return false;
}

//Copyright 2009 Nicholas C. Zakas. All rights reserved.
//MIT-Licensed, see source file
function binarySearch(items, value){

    var startIndex  = 1;
    var stopIndex   = items.length - 1;
    var middle      = Math.floor((stopIndex + startIndex)/2);

    while(items[middle] != value && startIndex < stopIndex){

        //adjust search area
        if (value < items[middle]){
            stopIndex = middle - 1;
        } else if (value > items[middle]){
            startIndex = middle + 1;
        }

        //recalculate middle
        middle = Math.floor((stopIndex + startIndex)/2);
    }

    //make sure it's the right value
    return (items[middle] != value) ? -1 : middle;
}

//Copyright 2009 Nicholas C. Zakas. All rights reserved.
//MIT-Licensed, see source file
function columnBinarySearch(items, value){
  
    var startIndex  = 0;
    var stopIndex   = items.length - 1;
    var middle      = Math.floor((stopIndex + startIndex)/2);

    while(items[middle][0] != value && startIndex < stopIndex){

        //adjust search area
        if (value < items[middle][0]){
            stopIndex = middle - 1;
        } else if (value > items[middle][0]){
            startIndex = middle + 1;
        }

        //recalculate middle
        middle = Math.floor((stopIndex + startIndex)/2);
    }

    //make sure it's the right value
    return (items[middle][0] != value) ? -1 : middle;
}