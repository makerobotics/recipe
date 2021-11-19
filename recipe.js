var db;

// Start here as the document is ready
$(document).ready(function () {
   console.log("READY");

   init();

   //prefixes of implementation that we want to test
   window.indexedDB = window.indexedDB || window.mozIndexedDB ||
      window.webkitIndexedDB || window.msIndexedDB;

   //prefixes of window.IDB objects
   window.IDBTransaction = window.IDBTransaction ||
      window.webkitIDBTransaction || window.msIDBTransaction;
   window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange ||
      window.msIDBKeyRange

   if (!window.indexedDB) {
      window.alert("Your browser doesn't support a stable version of IndexedDB.")
   }

   var request = window.indexedDB.open("newDatabase", 4);
   request.onerror = function (event) {
      console.log("error: ");
   };

   request.onsuccess = function (event) {
      // This is called as the database was opened
      db = request.result;
      readDataset();
   };

   request.onupgradeneeded = function (event) {
      db = event.target.result;
      var objectStore = db.createObjectStore("recipe", { keyPath: "name" });

      console.log("onupgradeneeded");
      for (var i in recipeData) {
         objectStore.add(recipeData[i]);
      }
   }
});

function init() {
   console.log("INIT controls");
   document.getElementById("export").value = "";
   document.getElementById("name").value = "";
   document.getElementById("ingredients").value = "";
   document.getElementById("description").value = "";
   document.getElementById("lastcook").value = "";
}

function readDataset() {
   var objectStore = db.transaction("recipe").objectStore("recipe");
   let dataset = [];
   objectStore.openCursor().onsuccess = function (event) {
      // Called each time the cursor was reading a new entry
      var cursor = event.target.result;

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
         // Now as data is available, we can fill the table
         var t = $('#example').DataTable({
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
         });

         const name = document.getElementById("name");
         const ingredients = document.getElementById("ingredients");
         const description = document.getElementById("description");
         const lastcook = document.getElementById("lastcook");

         $('#addRow').on('click', function () {
            t.row.add([
               name.value,
               ingredients.value,
               description.value,
               lastcook.value,
               "",
               "",
               ""
            ]).draw(false);
            // Add data to database
            add();
         });
         $('#example tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
               $(this).removeClass('selected');
            }
            else {
               t.$('tr.selected').removeClass('selected');
               $(this).addClass('selected');
            }
         });

         $('#delRow').click(function () {
            // Remove selected row from DB
            deleteRow($('tr.selected').find("td:eq(0)").text());
            t.row('.selected').remove().draw(false);
         });
      }
   };
}

function deleteRow(item) {
   var request = db.transaction(["recipe"], "readwrite")
      .objectStore("recipe")
      .delete(item);

   request.onsuccess = function (event) {
      console.log("entry " + item + " has been removed from your database.");
   };
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
      .add({ name: name.value, ingredients: ingredients.value, description: description.value, lastCook: thisDate.toLocaleDateString('en-CA'), rating: 5, favorite: 1, tags: "Midi, vegetarien" });

   request.onsuccess = function (event) {
      console.log(name.value + " has been added to your database.");
   };

   request.onerror = function (event) {
      console.log("Unable to add data\r\n" + name.value + " already exists in your database! ");
   }
}

function exportData() {
   var objectStore = db.transaction("recipe").objectStore("recipe");
   var txt_export = document.getElementById("export");
   txt_export.value = "[";
   let firstelement = 0;

   objectStore.openCursor().onsuccess = function (event) {
      var cursor = event.target.result;

      if (cursor) {
         if (firstelement == 0) {
            firstelement = 1;
         }
         else {
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
   //console.log(importstring);

   var obj = JSON.parse(importstring);

   var request = db.transaction(["recipe"], "readwrite")
      .objectStore("recipe")
      .add(obj[0]);

   request.onsuccess = function (event) {
      console.log(obj[0] + " has been added to your database.");
   };

   request.onerror = function (event) {
      console.log("Unable to add data\r\n" + obj[0] + " already exists in your database! ");
   }
}