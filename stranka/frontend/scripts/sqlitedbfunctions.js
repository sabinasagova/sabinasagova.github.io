// Declarations of variables
var sqlite3Global = null; // Global SQLite reference
var oo = null; // Instance of a DB class
var db = null; // Database instance
function initializeDatabase() {
  if (sqlite3Global === null) {
    return;
  }
  // If the database instance is not initialized, create a new instance
  if (!db) {
    // Create a new instance of the DB class with a path and a parameter
    db = new oo.DB("/mydb.sqlite3", "ct");
  }
}
// We replace various quotes with single quotes
// We do not need to search for specific quotes
function sanitizeQueryString(queryString) {
  return queryString.replace(/[`´‘’"“”]/g, "'");
}
// Start of functions related to the forum
// Function to execute a SQL query
// We use this function if the INSERT INTO query entered by user is executable
function tryExecuteQuery(queryString) {
  queryString = sanitizeQueryString(queryString);
  initializeDatabase();
  // Replace various characters in the query string with single quotes
  try {
    // Execute the modified query on the database
    db.exec({
      sql: queryString,
    });
    console.log("succ");
    // Return true indicating success
    return true;
  } catch (e) {
    console.log("fail:", e);
    // Return false indicating failure
    return false;
  }
}
// Function to insert values into a prepared statement for prispevek table
function insertIntoPreparedStatementArticles(author, text) {
  // Get the current date in ISO format and extract the date portion
  let preparedStmt = db.prepare(
    "INSERT INTO prispevek (autor, datum, text) VALUES (?, date('now'), ?)"
  );
  try {
    // Bind the provided author and text to the prepared statement
    preparedStmt.bind([author, text]).step();
    // Reset the prepared statement for reuse
    preparedStmt.reset();
  } finally {
    // Finalize the prepared statement to release resources
    preparedStmt.finalize();
  }
}
function queryAndFillArticle(tableElementName, query) {
  // Get the table element by its ID
  const tbl = document.getElementById(tableElementName);
  tbl.innerHTML = ""; // Clear the table content
  initializeDatabase();
  // Create a new table body element
  const tbody = document.createElement("tbody");
  // Execute the query on the database
  db.exec({
    sql: query,
    rowMode: "object",
    // Callback function handling each row of the query result
    callback: function (row) {
      let i = 0;
      var radka = document.createElement("tr");
      const keys = [];
      // Loop through the keys (columns) in each row
      for (key in row) {
        if (i > 1) {
          keys.push(key);
          continue;
        }
        // Create a table cell and populate it with row data
        var cell = document.createElement("td");
        var cellText = document.createTextNode(row[key]);
        cell.appendChild(cellText);
        radka.appendChild(cell);
        i++;
      }
      // Append the row with selected cells to the table body
      tbody.appendChild(radka);
      // Create another row for additional information from the query result
      radka = document.createElement("tr");
      cell = document.createElement("td");
      cell.colSpan = 2;
      cellText = document.createTextNode(row[keys[0]]);
      cell.appendChild(cellText);
      radka.appendChild(cell);
      tbody.appendChild(radka);
    }.bind({ counter: 0 }), // Binding a counter for the callback function
  });
  // Append the populated table body to the table element
  tbl.appendChild(tbody);
}
// End of functions related to the forum

// Start of functions related to the "ukoly"
// This function creates a duplicate of an existing table
function createSpecialTable(tableName, newTableName, query) {
  query = sanitizeQueryString(query);
  initializeDatabase();
  // Drop the table if it already exists to avoid conflicts
  // in case we have already tried to solve SQL exercise
  db.exec({
    sql: "DROP TABLE IF EXISTS " + newTableName + ";",
  });
  // Create a new table with the specified name by copying data from the original table
  db.exec({
    sql:
      "CREATE TABLE " + newTableName + " AS SELECT * FROM " + tableName + ";",
  });
  // Execute the provided query to perform additional operations on the new table
  db.exec({
    sql: query,
  });
}

function queryAndFillTable(tableElementName, query, showTHead) {
  // Get the table element by its ID
  const tbl = document.getElementById(tableElementName);
  tbl.innerHTML = ""; // Clear the table content
  initializeDatabase();
  // Sanitize the query by replacing specific characters with single quotes
  query = sanitizeQueryString(query);
  // If showTHead is true, create and populate table header (thead)
  if (showTHead) {
    const thead = document.createElement("thead");
    const tableRow = document.createElement("tr");
    // Prepare a statement and get column names
    const stmt = db.prepare(query);
    const columns = stmt.getColumnNames();
    // Map through columns and create header cells (th)
    columns.map((col) => {
      var cell = document.createElement("th");
      var cellText = document.createTextNode(col);
      cell.appendChild(cellText);
      tableRow.appendChild(cell);
    });
    stmt.finalize();
    thead.appendChild(tableRow);
    tbl.appendChild(thead);
  }
  const result = []; // Store the result temporarily as an array
  const tbody = document.createElement("tbody");
  // Execute the query on the database
  db.exec({
    sql: query,
    rowMode: "object",
    // Callback function handling each row of the query result
    callback: function (row) {
      result.push(JSON.stringify(row)); // Store each row as a JSON string
      var radka = document.createElement("tr");
      for (var key in row) {
        var cell = document.createElement("td");
        var cellText = document.createTextNode(row[key]);
        cell.appendChild(cellText);
        radka.appendChild(cell);
      }
      tbody.appendChild(radka); // Append row to table body
    }.bind({ counter: 0 }),
  });
  tbl.appendChild(tbody); // Append the table body to the table
  // Return the result array as a JSON string
  return JSON.stringify(result);
}
// End of functions related to the "ukoly"

// Start of functions related to the "sql playground"
// Function to create a new table button and its associated table in the UI
function createNewTable(tableName) {
  // Check if the table already exists, if yes, return
  if (document.getElementById("div" + tableName)) {
    return;
  }
  // Create a button element for the table
  const node = document.createElement("button");
  node.setAttribute("class", "button button5");
  node.setAttribute("onClick", 'showDataFromTable("' + tableName + '",true)');
  node.setAttribute("id", "button_" + tableName);
  const textnode = document.createTextNode(tableName);
  node.appendChild(textnode);
  // Add specific styles based on table groupes
  // Different table groups are distinguished by their names
  if (
    tableName === "student" ||
    tableName === "konicek" ||
    tableName === "skola"
  ) {
    node.classList.add("bordered-button1");
  }
  if (
    tableName === "zakaznik" ||
    tableName === "produkt" ||
    tableName === "objednavka"
  ) {
    node.classList.add("bordered-button2");
  }
  if (
    tableName === "netflix" ||
    tableName === "fitness" ||
    tableName === "zvire" ||
    tableName === "nemocnice" ||
    tableName === "prispevek"
  ) {
    node.classList.add("bordered-button3");
  }

  const tableNames = document.getElementById("tableNames");
  tableNames.appendChild(node);
  // Create a div element to contain the table
  const tableDivNode = document.createElement("div");
  tableDivNode.setAttribute("id", "div" + tableName);
  tableDivNode.setAttribute("class", "table-responsive");
  tableDivNode.setAttribute("style", "display: none;");
  // Create a table element and append it to the div
  const tableNode = document.createElement("table");
  tableNode.setAttribute("id", "table" + tableName);
  tableNode.setAttribute("class", "table table-striped table-bordered");
  tableDivNode.appendChild(tableNode);
  document.getElementById("tableNames").appendChild(tableDivNode);
}
// We use this function for SQL query DROP TABLE
// to remove the button after removing the table
function removeButton(tableName) {
  const buttonToRemove = document.getElementById("button_" + tableName);
  if (buttonToRemove) {
    buttonToRemove.parentNode.removeChild(buttonToRemove);
  }
}
// Function to display data from a table when a button is clicked
function showDataFromTable(tableName, clicked) {
  const divNode = document.getElementById("div" + tableName);
  const divStyle = divNode.getAttribute("style");
  // Toggle visibility of the table div based on current style
  if (divStyle.includes("none")) {
    divNode.setAttribute("style", "display: block");
  } else {
    if (clicked) divNode.setAttribute("style", "display: none");
  }
  // Get the table element
  const tbl = document.getElementById("table" + tableName);
  tbl.innerHTML = ""; // Clear the table content
  // Create the table header (thead) based on table information obtained from PRAGMA
  const thead = document.createElement("thead");
  const tableRow = document.createElement("tr");
  // Execute PRAGMA query to fetch table information and create table headers
  db.exec({
    sql: "PRAGMA table_info(" + tableName + ")",
    rowMode: "object",
    callback: function (row) {
      var cell = document.createElement("th");
      var cellText = document.createTextNode(row.name);
      cell.appendChild(cellText);
      tableRow.appendChild(cell);
    }.bind({ counter: 0 }),
  });
  thead.appendChild(tableRow);
  tbl.appendChild(thead);
  // Fetch and display table data (select * from tableName) in the table body (tbody)
  const tbody = document.createElement("tbody");
  db.exec({
    sql: "select * from " + tableName,
    rowMode: "object",
    callback: function (row) {
      // log("row ",++this.counter,"=",JSON.stringify(row));
      var radka = document.createElement("tr");
      for (var key in row) {
        var cell = document.createElement("td");
        var cellText = document.createTextNode(row[key]);
        cell.appendChild(cellText);
        radka.appendChild(cell);
      }
      tbody.appendChild(radka);
    }.bind({ counter: 0 }),
  });
  tbl.appendChild(tbody); // Append the table body to the table
}
// Functions to handle errors during validation SQL queries for SQL playground
function handleValidationError(e) {
  const error = document.getElementById("errorlog");
  errorMessage = e.message.split(":").slice(1).join("").trim();
  error.innerHTML = texts.errorText + errorMessage;
}

function validate() {
  const error = document.getElementById("errorlog");
  error.innerHTML = "";
  // Check if the SQLite global reference is null, exit the function if true
  if (sqlite3Global === null) {
    return;
  }
  try {
    // If the database instance is not initialized, create a new instance
    if (!db) {
      db = new oo.DB("/mydb.sqlite3", "ct");
    }
    let sqlQuery = editorSQLPlayground.getValue().trim().toString();
    // Get the SQL query from the input field and sanitize it
    sqlQuery = sanitizeQueryString(sqlQuery);
    const splitQuery = sqlQuery.split(/\s+/);
    let shouldExecute = true; // Flag to determine if the query should be executed
    // Check the type of SQL query and perform appropriate actions
    if (
      splitQuery[0].toUpperCase() == "CREATE" &&
      splitQuery[1].toUpperCase() == "TABLE"
    ) {
      try {
        db.exec({
          sql: sqlQuery,
        });
      } catch (e) {
        const error = document.getElementById("errorlog");
        errorMessage = e.message.split(":").slice(1).join("").trim();
        error.innerHTML = texts.errorText + errorMessage;
        return false;
      }
      let tableName = splitQuery[2];
      if (tableName.includes("(")) {
        //we should split the actual name
        tableName = tableName.substring(0, tableName.indexOf("("));
      }
      createNewTable(tableName); // Create a new table based on the query
    } else if (splitQuery[0].toUpperCase() == "INSERT") {
      let tableName = splitQuery[2];
      if (tableName.includes("(")) {
        //we should split the actual name
        tableName = tableName.substring(0, tableName.indexOf("("));
      }
      showDataFromTable(tableName, false); // Show data from the inserted table
    } else if (
      splitQuery[0].toUpperCase() == "DROP" &&
      splitQuery[1].toUpperCase() == "TABLE"
    ) {
      let tableName = splitQuery[2];
      tableName = tableName.trim().replace(";", "");
      const tableDiv = document.getElementById("div" + tableName);
      if (tableDiv) {
        tableDiv.parentNode.removeChild(tableDiv);
      }
      removeButton(tableName);
      try {
        db.exec({
          sql: "DROP TABLE " + tableName,
          rowMode: "object",
          callback: function () {
            console.log("Table " + tableName + " dropped successfully.");
          },
        });
        const tblResults = document.getElementById("newTable");
        tblResults.innerHTML = "";
        return;
      } catch (e) {
        handleValidationError(e);
      }
    } else if (splitQuery[0].toUpperCase() == "SELECT") {
      try {
        const tblResults = document.getElementById("newTable");
        tblResults.innerHTML = "";
        // Create thead (table headers) for displaying the result columns
        const theadTable = document.createElement("thead");
        const tableRow = document.createElement("tr");
        const stmt = db.prepare(sqlQuery);
        const columns = stmt.getColumnNames();
        const addedColumns = new Set(); // Keep track of added column names
        columns.forEach((col) => {
          if (!addedColumns.has(col)) {
            // Check if the column name is already added
            const cell = document.createElement("th");
            const cellText = document.createTextNode(col);
            cell.appendChild(cellText);
            tableRow.appendChild(cell);
            addedColumns.add(col); // Add the column name to the set
          }
        });
        theadTable.appendChild(tableRow);
        tblResults.appendChild(theadTable);
        shouldExecute = false;
        // Create body of the table for SELECT query
        // SELECT jmeno FROM studenti
        // it will create data after columns
        // Create tbody (table body) for displaying the result rows
        const tbodyTable = document.createElement("tbody");
        db.exec({
          sql: sqlQuery,
          rowMode: "object",
          callback: function (row) {
            var radka = document.createElement("tr");
            for (var key in row) {
              var cell = document.createElement("td");
              var cellText = document.createTextNode(row[key]);
              cell.appendChild(cellText);
              radka.appendChild(cell);
            }
            tbodyTable.appendChild(radka);
          }.bind({ counter: 0 }),
        });
        tblResults.appendChild(tbodyTable);
      } catch (e) {
        handleValidationError(e);
      }
    }
    if (shouldExecute) {
      try {
        // Execute the SQL query and handle errors
        db.exec({
          sql: sqlQuery,
          rowMode: "object",
          callback: function (row) {
            console.log(row); // Log the result rows
          }.bind({ counter: 0 }),
        });

        if (splitQuery[0].toUpperCase() == "INSERT") {
          let tableName = splitQuery[2];

          if (tableName.includes("(")) {
            // We should split the actual name
            tableName = tableName.substring(0, tableName.indexOf("("));
          }
          showDataFromTable(tableName, false);
          // Show data from the inserted table
          const tblResults = document.getElementById("newTable");
          tblResults.innerHTML = "";
          // Create thead (table headers) for displaying the result columns
          const theadTable = document.createElement("thead");
          const tableRow = document.createElement("tr");
          const stmt = db.prepare("select * from " + tableName);
          const columns = stmt.getColumnNames();
          columns.map((col) => {
            var cell = document.createElement("th");
            var cellText = document.createTextNode(col);
            cell.appendChild(cellText);
            tableRow.appendChild(cell);
          });
          theadTable.appendChild(tableRow);
          tblResults.appendChild(theadTable);
          // Create tbody (table body) for displaying the result rows
          const tbodyTable = document.createElement("tbody");
          db.exec({
            sql: "select * from " + tableName,
            rowMode: "object",
            callback: function (row) {
              var radka = document.createElement("tr");
              for (var key in row) {
                var cell = document.createElement("td");
                var cellText = document.createTextNode(row[key]);
                cell.appendChild(cellText);
                radka.appendChild(cell);
              }
              tbodyTable.appendChild(radka);
            }.bind({ counter: 0 }),
          });
          tblResults.appendChild(tbodyTable);
        } else {
          let tableName = null;
          for (const table of preparedTables) {
            if (sqlQuery.toLowerCase().includes(table)) {
              tableName = table;
              break;
            }
          }
          showDataFromTable(tableName, false);
          const tblResults = document.getElementById("newTable");
          tblResults.innerHTML = "";
          // Create thead (table headers) for displaying the result columns
          const theadTable = document.createElement("thead");
          const tableRow = document.createElement("tr");
          const stmt = db.prepare("select * from " + tableName);
          const columns = stmt.getColumnNames();
          columns.map((col) => {
            var cell = document.createElement("th");
            var cellText = document.createTextNode(col);
            cell.appendChild(cellText);
            tableRow.appendChild(cell);
          });
          theadTable.appendChild(tableRow);
          tblResults.appendChild(theadTable);
          // Create tbody (table body) for displaying the result rows
          const tbodyTable = document.createElement("tbody");
          db.exec({
            sql: "select * from " + tableName,
            rowMode: "object",
            callback: function (row) {
              var radka = document.createElement("tr");
              for (var key in row) {
                var cell = document.createElement("td");
                var cellText = document.createTextNode(row[key]);
                cell.appendChild(cellText);
                radka.appendChild(cell);
              }
              tbodyTable.appendChild(radka);
            }.bind({ counter: 0 }),
          });
          tblResults.appendChild(tbodyTable);
        }
      } catch (e) {
        // Handle potential errors in executing the query
        if (splitQuery[0].toUpperCase() == "CREATE") {
          return;
        }
        const tblResults = document.getElementById("newTable");
        tblResults.innerHTML = "";
        handleValidationError(e);
        console.log(e);
      }
    }
  } catch (e) {
    handleValidationError(e);
  }
}

// End of functions related to the "sql playground"

("use strict");
(function () {
  let logHtml;
  if (self.window === self /* UI thread */) {
    logHtml = function (cssClass, ...args) {
      const ln = document.createElement("div");
      if (cssClass) ln.classList.add(cssClass);
      ln.append(document.createTextNode(args.join(" ")));
      document.body.append(ln);
    };
  } else {
    /* Worker thread */
    logHtml = function (cssClass, ...args) {
      postMessage({
        type: "log",
        payload: { cssClass, args },
      });
    };
  }
  const log = (...args) => logHtml("", ...args);
  const error = (...args) => logHtml("error", ...args);
  const sqlitedb = function (sqlite3) {
    const oo = sqlite3.oo1; /*high-level OO API*/
    //log("sqlite3 version",capi.sqlite3_libversion(), capi.sqlite3_sourceid());
    db = new oo.DB("/mydb.sqlite3", "ct");
    //log("transient db =",db.filename);
    try {
      function insertData(db, table, columns, data) {
        db.exec({
          sql: `CREATE TABLE IF NOT EXISTS ${table}(${columns})`,
        });
        let columnsString = columns
          .split(", ")
          .map((column) => column.split(" ")[0]);
        let placeholders = Array(columnsString.length).fill("?").join(", ");
        let insertQuery = `INSERT INTO ${table}(${columnsString.join(
          ", "
        )}) VALUES(${placeholders})`;
        let statement = db.prepare(insertQuery);
        try {
          data.forEach((row) => {
            statement.bind(row).step();
            statement.reset();
          });
        } finally {
          statement.reset();
          statement.finalize();
        }
      }
      allTables.forEach(function (tableName) {
        var http = new XMLHttpRequest();
        const url = getApiEndpoint() + "/tables/" + tableName;
        http.open("GET", url, true);
        http.setRequestHeader("Content-Type", "application/json");
        http.onreadystatechange = function () {
          if (http.readyState == 4) {
            if (http.status == 200) {
              var response = JSON.parse(http.responseText);
              var table = tableName;
              var columns = response.column_names.join(", ");
              var data = response.data;
              insertData(db, table, columns, data);
            } else {
              console.error(
                "Error fetching data for table '" + tableName + "':",
                http.statusText
              );
            }
          }
        };
        http.send();
      });
    } finally {
      //db.close();
    }
  };
  if (self.window !== self) {
    let sqlite3Js = "sqlite3.js";
    const urlParams = new URL(self.location.href).searchParams;
    if (urlParams.has("sqlite3.dir")) {
      sqlite3Js = urlParams.get("sqlite3.dir") + "/" + sqlite3Js;
    }
    importScripts(sqlite3Js);
  }
  self
    .sqlite3InitModule({
      print: log,
    })
    .then(function (sqlite3) {
      console.log("sqlite3 =", sqlite3);
      try {
        sqlite3Global = sqlite3;
        oo = sqlite3Global.oo1;
        sqlitedb(sqlite3);
      } catch (e) {
        error("Exception:", e.message);
      }
    });
})();
