//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB || 
window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction || 
window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || 
window.msIDBKeyRange

var recipeName = ""
var selectedRow = 0;

document.addEventListener('DOMContentLoaded', function() {
   recipeName = document.getElementById("name");
   //console.log( 'Content was loaded' );
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
   // This is called as the database was opened
   db = request.result;
   readDataset();   
};

request.onupgradeneeded = function(event) {
   db = event.target.result;
   var objectStore = db.createObjectStore("recipe", {keyPath: "name"});
   
   console.log("onupgradeneeded");
   for (var i in recipeData) {
      objectStore.add(recipeData[i]);
   }
}

$(document).ready(function() {
   console.log("READY");
} );


function init() {
   console.log("INIT (on load body)");
   document.getElementById("export").value = "";
   document.getElementById("name").value = "";
   document.getElementById("ingredients").value = "";
   document.getElementById("description").value = "";
   document.getElementById("lastcook").value = "";
}

function readDataset(){
   var objectStore = db.transaction("recipe").objectStore("recipe");
   let dataset = [];
   console.log("readDataset() - start");
   objectStore.openCursor().onsuccess = function(event) {
      // Called each time the cursor was reading a new entry
      var cursor = event.target.result;
      //console.log("readDataset() - onsuccess");
   
      if (cursor) {
         let line = [];
         line.push(cursor.value.name);
         line.push(cursor.value.ingredients);
         line.push(cursor.value.description);
         line.push(cursor.value.lastCook);
         line.push(cursor.value.rating);
         line.push(cursor.value.favorite);
         line.push(cursor.value.tags);
         dataset.push(line);
         cursor.continue();
      } else {
         console.log("No more entries!");
         $('#example').DataTable( {
            data: dataset,
            columns: [
                { title: "name" },
                { title: "ingredients" },
                { title: "description" },
                { title: "lastCook." },
                { title: "rating" },
                { title: "favorite" },
                { title: "tags" }
            ]
        } );
      }
   };
}

function addRow(col1, col2, col3, col4){
   var input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("table_input_recipes");
	filter = input.value.toUpperCase();
	table = document.getElementById("main_table");
	tr = table.getElementsByTagName("tr");
   const name = document.getElementById("name");
   const ingredients = document.getElementById("ingredients");
   const description = document.getElementById("description");
   const lastcook = document.getElementById("lastcook");
   
   // Create an empty <tr> element and add it to the 1st position of the table:
   var row = table.insertRow(1);

   // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
   var cell1 = row.insertCell(0);
   var cell2 = row.insertCell(1);
   var cell3 = row.insertCell(2);
   var cell4 = row.insertCell(3);

   // Add some text to the new cells:
   cell1.innerHTML = col1;
   cell2.innerHTML = col2;
   cell3.innerHTML = col3;
   cell4.innerHTML = col4;

   cell1.onclick = function () {
      // Get the row id where the cell exists
      var rowId = this.parentNode.rowIndex;
      //console.log(rowId);
      selectedRow = rowId;
      var rowsNotSelected = table.getElementsByTagName('tr');
      for (var row = 0; row < rowsNotSelected.length; row++) {
          rowsNotSelected[row].style.backgroundColor = "";
          rowsNotSelected[row].classList.remove('selected');
      }
      var rowSelected = table.getElementsByTagName('tr')[rowId];
      rowSelected.style.backgroundColor = "yellow";
      rowSelected.className += " selected";

      name.value = col1;
      ingredients.value = col2;
      description.value = col3;
      lastcook.value = col4;
   }
}

function deleteRow() {
   var table = document.getElementById("main_table");
	recipeName.value = document.getElementById("main_table").rows[selectedRow].cells[0].innerText;
   var request = db.transaction(["recipe"], "readwrite")
   .objectStore("recipe")
   .delete(recipeName.value);
   
   request.onsuccess = function(event) {
      console.log("entry "+recipeName.value+" has been removed from your database.");
   };
   table.deleteRow(selectedRow);
}

function add() {
   var now = new Date();
   var thisDate = new Date();
   thisDate.setDate(now.getDate());
   const name = document.getElementById("name");
   const ingredients = document.getElementById("ingredients");
   const description = document.getElementById("description");
   const lastcook = document.getElementById("lastcook");
   var request = db.transaction(["recipe"], "readwrite")
   .objectStore("recipe")
   .add({ name: recipeName.value, ingredients: ingredients.value, description: description.value, lastCook: thisDate.toLocaleDateString('en-CA'), rating: 5, favorite: 1, tags: "Midi, vegetarien" });
   
   request.onsuccess = function(event) {
      console.log(recipeName.value+" has been added to your database.");
      addRow(recipeName.value, ingredients.value, description.value, lastcook.value);
   };
   
   request.onerror = function(event) {
      console.log("Unable to add data\r\n"+recipeName.value+" already exists in your database! ");
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