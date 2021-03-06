var db;
var dt;
var myname, ingredients, description, lastcook, rating, favorite, tags;

// Start here as the document is ready
$(document).ready(function () {
   myname = document.getElementById("name");
   ingredients = document.getElementById("ingredients");
   description = document.getElementById("description");
   lastcook = document.getElementById("lastcook");
   rating = document.getElementById("rating");
   favorite = document.getElementById("favorite");
   tags = document.getElementById("tags");

   // Initialize controls
   init();

   // Control import/export items by checkbox
   $(".checkbutton").change(function () {
      if (this.checked) {
         //I am checked
         //$('.importexport').show(); // not working on mobile devices
         $('.importexport').css('display', 'block');
      } else {
         //I'm not checked
         //$('.importexport').hide(); // not working on mobile devices
         $('.importexport').css('display', 'none');
      }
   });

   // Control compact view by checkbox
   $(".checkcompact").change(function () {
      if (this.checked) {
         //I am checked
         //$('.compact').hide(); // not working on mobile devices
         $('.compact').css('display', 'none');
         //dt.column(2).visible(false);
         compactView(dt, false);
      } else {
         //I'm not checked
         //$('.compact').show(); // not working on mobile devices
         $('.compact').css('display', 'block');
         //dt.column(2).visible(true);
         compactView(dt, true);
      }
   });

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

   // Handle database (open and read all data)
   var request = window.indexedDB.open("newDatabase", 4);
   request.onerror = function (event) {
      console.log("error: ");
   };

   request.onsuccess = function (event) {
      // This is called as the database was opened
      db = request.result;
      // Read data from iDB and fill datatable
      readDataset();
   };

   request.onupgradeneeded = function (event) {
      db = event.target.result;
      var objectStore = db.createObjectStore("recipe", { keyPath: "name" });
      const recipeData = [
         { name: "Dummy", ingredients: "", description: "", lastcook: "", rating: 0, favorite: 0, tags: "" }
      ];

      console.log("onupgradeneeded");
      for (var i in recipeData) {
         objectStore.add(recipeData[i]);
      }
   }
});

function compactView(table, status){
   table.column('description:name').visible(status);
   table.column('lastcook:name').visible(status);
   table.column('rating:name').visible(status);
   table.column('favorite:name').visible(status);
}

// Initialize controls
function init() {
   const now = new Date();
   const thisDate = new Date();
   thisDate.setDate(now.getDate());

   myname.value = "";
   ingredients.value = "";
   description.value = "";
   lastcook.value = thisDate.toLocaleDateString('en-CA');
   rating.value = "";
   favorite.value = "";
   tags.value = "";

   document.getElementById("check").checked = false;
   document.getElementById("compact").checked = true;
   document.getElementById("export").value = "";
   $('.importexport').hide();
   $('.compact').hide();
}

// Read data from iDB and fill datatable
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
         line.push(cursor.value.lastcook);
         line.push(cursor.value.rating);
         line.push(cursor.value.favorite);
         line.push(cursor.value.tags);
         dataset.push(line);
         cursor.continue();
      } else {
         //console.log("No more entries!");
         // Now as data is available, we can fill the table
         dt = $('#example').DataTable({
            data: dataset,
            columns: [
               { title: "Name", name: "name" },
               { title: "Ingredients", name: "ingredients" },
               { title: "Description", name:"description" },
               { title: "Last Cook", name: "lastcook" },
               { title: "Rating", name: "rating" },
               { title: "Favorite", name: "favorite" },
               { title: "Tags", name: "tags" }
            ]
         });
         // Add table callbacks (button and click events) only as table was created
         tableCallbacks();
         compactView(dt, false);
      }
   };
}

// Add table callbacks (button and click events) only as table was created
function tableCallbacks() {

   $('#addRow').on('click', function () {
      dt.row.add([
         myname.value,
         ingredients.value,
         description.value,
         lastcook.value,
         rating.value,
         favorite.value,
         tags.value
      ]).draw(false);
      // Add data to database
      add();
   });

   $('#delRow').click(function () {
      // Remove selected row from DB
      deleteRow($('tr.selected').find("td:eq(0)").text());
      dt.row('.selected').remove().draw(false);
   });

   $('#cleanRow').click(function () {
      // Clear form
      init();
   });

   $('#saveRow').click(function () {
      // Update selected row from DB
      let r = dt.row('.selected').data();
      r[0] = myname.value;
      r[1] = ingredients.value;
      r[2] = description.value;
      r[3] = lastcook.value;
      r[4] = rating.value;
      r[5] = favorite.value;
      r[6] = tags.value;
      dt.row('.selected').data(r).draw(false);
      update();
   });

   $('#Today').click(function(){
      const now = new Date();
      const thisDate = new Date();
      thisDate.setDate(now.getDate());
      lastcook.value = thisDate.toLocaleDateString('en-CA');
   });

   $('#example tbody').on('click', 'tr', function () {
      if ($(this).hasClass('selected')) {
         $(this).removeClass('selected');
      }
      else {
         dt.$('tr.selected').removeClass('selected');
         $(this).addClass('selected');
         updateControls();
      }
   });
}

// Update controls (get table values if row is clicked)
function updateControls() {
   myname.value = $('tr.selected').find("td:eq(0)").text();
   ingredients.value = $('tr.selected').find("td:eq(1)").text();
   description.value = $('tr.selected').find("td:eq(2)").text();
   lastcook.value = $('tr.selected').find("td:eq(3)").text();
   rating.value = $('tr.selected').find("td:eq(4)").text();
   favorite.value = $('tr.selected').find("td:eq(5)").text();
   tags.value = $('tr.selected').find("td:eq(6)").text();
}

// Delete a table row
function deleteRow(item) {
   var request = db.transaction(["recipe"], "readwrite")
      .objectStore("recipe")
      .delete(item);

   request.onsuccess = function (event) {
      console.log("entry " + item + " has been removed from your database.");
   };
}

// Update a table row
function update() {
   const now = new Date();
   const thisDate = new Date();
   thisDate.setDate(now.getDate());
   var request = db.transaction(["recipe"], "readwrite")
      .objectStore("recipe")
      .put({
         name: myname.value,
         ingredients: ingredients.value,
         description: description.value,
         lastcook: lastcook.value,
         rating: rating.value,
         favorite: favorite.value,
         tags: tags.value
      });

   request.onsuccess = function (event) {
      console.log(myname.value + " has been updated in your database.");
   };

   request.onerror = function (event) {
      console.log("Unable to update data\r\n" + myname.value + " already exists in your database! ");
   }
}

// Add a table row
function add() {
   const now = new Date();
   const thisDate = new Date();
   thisDate.setDate(now.getDate());
   var request = db.transaction(["recipe"], "readwrite")
      .objectStore("recipe")
      .add({
         name: myname.value,
         ingredients: ingredients.value,
         description: description.value,
         lastcook: thisDate.toLocaleDateString('en-CA'),
         rating: rating.value,
         favorite: favorite.value,
         tags: tags.value
      });

   request.onsuccess = function (event) {
      console.log(myname.value + " has been added to your database.");
   };

   request.onerror = function (event) {
      console.log("Unable to add data\r\n" + myname.value + " already exists in your database! ");
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
   var obj = JSON.parse(importstring);

   var request = db.transaction(["recipe"], "readwrite").objectStore("recipe");
   // Clear all the database before importing new data
   request.clear();
   // Import each row from JSON file
   for (let key in obj) {
      console.log(obj[key].name);
      request.add({
         name: obj[key].name,
         ingredients: obj[key].ingredients,
         description: obj[key].description,
         lastcook: obj[key].lastcook,
         rating: obj[key].rating,
         favorite: obj[key].favorite,
         tags: obj[key].tags
      });
   };

   request.onsuccess = function (event) {
      console.log(obj[0] + " has been added to your database.");
   };

   request.onerror = function (event) {
      console.log("Unable to add data\r\n" + obj[0] + " already exists in your database! ");
   }
}