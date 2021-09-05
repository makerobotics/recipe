
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
         cursor.continue();
      } else {
         console.log("No more entries!");
      }
   };
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