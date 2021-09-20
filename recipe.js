
//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB || 
window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction || 
window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || 
window.msIDBKeyRange

var recipeName = ""

document.addEventListener('DOMContentLoaded', function() {
   recipeName = document.getElementById("name");
   //console.log(recipeName.value);
}, false);

if (!window.indexedDB) {
   window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

const recipeData = [
//   { name: "first", ingredients: "meet", description: "this", lastCook: "", rating: 0, favorite: 0, tags: "" },
//   { name: "second", ingredients: "meet2", description: "that", lastCook: "", rating: 0, favorite: 0, tags: "" }
];

var db;
var request = window.indexedDB.open("newDatabase", 4);

request.onerror = function(event) {
   console.log("error: ");
};

request.onsuccess = function(event) {
   db = request.result;
   console.log("success: "+ db);
};

request.onupgradeneeded = function(event) {
   var db = event.target.result;
   var objectStore = db.createObjectStore("recipe", {keyPath: "name"});
   
   console.log("onupgradeneeded");
   for (var i in recipeData) {
      objectStore.add(recipeData[i]);
   }
}

function init() {
   document.getElementById("export").value = "";
   readAll();
   //highlight_row();
}
/*
function highlight_row() {
   var cells = table.getElementsByTagName('td');
   var input, filter, table, tr, td, i, txtValue;
	table = document.getElementById("main_table");

   for (var i = 0; i < cells.length; i++) {
       // Take each cell
       var cell = cells[i];
       // do something on onclick event for cell
       cell.onclick = function () {
           // Get the row id where the cell exists
           var rowId = this.parentNode.rowIndex;

           var rowsNotSelected = table.getElementsByTagName('tr');
           for (var row = 0; row < rowsNotSelected.length; row++) {
               rowsNotSelected[row].style.backgroundColor = "";
               rowsNotSelected[row].classList.remove('selected');
           }
           var rowSelected = table.getElementsByTagName('tr')[rowId];
           rowSelected.style.backgroundColor = "yellow";
           rowSelected.className += " selected";

           msg = 'The ID of the company is: ' + rowSelected.cells[0].innerHTML;
           msg += '\nThe cell value is: ' + this.innerHTML;
           alert(msg);
       }
   }
}
*/
function read() {
   var transaction = db.transaction(["recipe"]);
   var objectStore = transaction.objectStore("recipe");
   console.log(recipeName.value);
   var request = objectStore.get(recipeName.value);
   
   request.onerror = function(event) {
      console.log("Unable to retrieve data from database!");
   };
   
   request.onsuccess = function(event) {
      // Do something with the request.result!
      if(request.result) {
         console.log("Name: " + request.result.name + ", lastCook: " + request.result.lastCook + ", rating: " + request.result.rating);
      } else {
         console.log(recipeName.value+" couldn't be found in your database!");
      }
   };
}

function readAll() {
   var objectStore = db.transaction("recipe").objectStore("recipe");
   
   objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      
      if (cursor) {
         console.log("Name for id " + cursor.key + " is " + cursor.value.ingredients + ", lastCook: " + cursor.value.lastCook + ", rating: " + cursor.value.rating);
         addRow(cursor.key,cursor.value.ingredients);
         cursor.continue();
      } else {
         console.log("No more entries!");
      }
   };
}

function addRow(col1, col2){
   var input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("table_input_recipes");
	filter = input.value.toUpperCase();
	table = document.getElementById("main_table");
	tr = table.getElementsByTagName("tr");
   
   // Create an empty <tr> element and add it to the 1st position of the table:
   var row = table.insertRow(1);

   // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
   var cell1 = row.insertCell(0);
   var cell2 = row.insertCell(1);

   // Add some text to the new cells:
   cell1.innerHTML = col1;
   cell2.innerHTML = col2; 
}

function deleteRow(r) {
   var table = document.getElementById("main_table");
	var i = r.parentNode.parentNode.rowIndex;
   table.deleteRow(i);
}

function add() {
   var now = new Date();
   var thisDate = new Date();
   thisDate.setDate(now.getDate());
   var request = db.transaction(["recipe"], "readwrite")
   .objectStore("recipe")
   .add({ name: recipeName.value, ingredients: "plenty", description: "bla bla", lastCook: thisDate.toLocaleDateString('en-CA'), rating: 5, favorite: 1, tags: "Midi, vegetarien" });
   
   request.onsuccess = function(event) {
      console.log(recipeName.value+" has been added to your database.");
      addRow(recipeName.value, "added row");
   };
   
   request.onerror = function(event) {
      console.log("Unable to add data\r\n"+recipeName.value+" already exists in your database! ");
   }
}

function remove() {
   var request = db.transaction(["recipe"], "readwrite")
   .objectStore("recipe")
   .delete(recipeName.value);
   
   request.onsuccess = function(event) {
      console.log("entry "+recipeName.value+" has been removed from your database.");
   };
}


function table_search_recipes() {
	var input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("table_input_recipes");
	filter = input.value.toUpperCase();
	table = document.getElementById("main_table");
	tr = table.getElementsByTagName("tr");

	// Loop through all table rows, and hide those who don't match the search query
	for (i = 0; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[0];
		if (td) {
			txtValue = td.textContent || td.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				tr[i].style.display = "";
			} else {
				tr[i].style.display = "none";
			}
		}
	}
}

function table_search_ingredients() {
	var input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("table_input_ingredients");
	filter = input.value.toUpperCase();
	table = document.getElementById("main_table");
	tr = table.getElementsByTagName("tr");

	// Loop through all table rows, and hide those who don't match the search query
	for (i = 0; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[1];
		if (td) {
			txtValue = td.textContent || td.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				tr[i].style.display = "";
			} else {
				tr[i].style.display = "none";
			}
		}
	}
}



function exportData() {
   var objectStore = db.transaction("recipe").objectStore("recipe");
   var txt_export = document.getElementById("export");
   txt_export.value = "[";
   let firstelement = 0;

   objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      
      if (cursor) {
         if(firstelement == 0){
            firstelement = 1;
         }
         else{
            txt_export.value += ",\n";
         }
         txt_export.value += JSON.stringify(cursor.value);
         cursor.continue();
      } else {
         console.log("No more entries!");
         txt_export.value += "]";
      }
   };  
}

function importData() {
   var objectStore = db.transaction("recipe").objectStore("recipe");
   var importstring = document.getElementById("export").value;
   console.log(importstring);

   var obj = JSON.parse(importstring);

   var request = db.transaction(["recipe"], "readwrite")
   .objectStore("recipe")
   .add(obj[0]);
   
   request.onsuccess = function(event) {
      console.log(recipeName.value+" has been added to your database.");
   };
   
   request.onerror = function(event) {
      console.log("Unable to add data\r\n"+recipeName.value+" already exists in your database! ");
   }
}