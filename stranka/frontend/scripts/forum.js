let editorSelect;
let editorOrderByDesc;
let editorOrderByAsc;
let editorInsert;

document.addEventListener("DOMContentLoaded", function () {
  // Initialize CodeMirror editors for each textarea
  editorSelect = initializeCodeMirrorEditor("querySelect");
  editorOrderByDesc = initializeCodeMirrorEditor("queryOrderByDesc");
  editorOrderByAsc = initializeCodeMirrorEditor("queryOrderByAsc");
  editorInsert = initializeCodeMirrorEditor("queryInsert");
});

function processUserInput(input) {
  return input
    .getValue() // Get the value
    .toLowerCase() // Convert to lowercase
    .trim() // Trim leading and trailing whitespace
    .toString() // Convert to string
    .replace(/\n/g, " ") // Replace newline characters with spaces
    .replace(/ /g, "") // Remove all spaces
    .replace(/;/g, ""); // Remove all semicolons
}

// Variables to track button enablement
let handleDownEnabled = false;
let handleUpEnabled = false;
let handleOkEnabled = false;
// Async function to display articles with a delay
async function showArticles(query) {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  await delay(3000);
  queryAndFillTable("articlesTable", query, true);
}
showArticles("Select * from prispevek");
// Function to handle the SELECT query task
function handleSelect() {
  // Retrieving user input and preparing for comparison
  const userInput = processUserInput(editorSelect);
  // Valid queries for the task
  const validQueries = [
    "select*fromprispevek",
    "selectautor,datum,textfromprispevek",
  ];
  // Get the table element
  const table = document.getElementById("articles2Table");
  // Clear the table content by setting innerHTML to an empty string
  table.innerHTML = "";
  // Checking and handling user input validity
  if (validQueries.includes(userInput)) {
    try {
      queryAndFillArticle("articles2Table", editorSelect.getValue());
      document.getElementById("dfTask1").innerHTML =
        texts.df.dfTaskInputCorrectText;
    } catch (e) {
      document.getElementById("dfTask1").innerHTML =
        texts.df.dfTaskInputIncorrectText;
    }
  } else {
    document.getElementById("dfTask1").innerHTML =
      texts.df.dfTaskInputIncorrectText;
  }
}
// Functions to handle ordering tasks (descending and ascending)
function handleOrderByDesc() {
  // Implementation similar to handleSelect for descending order
  const userInput2 = processUserInput(editorOrderByDesc);
  const validQueries2 = [
    "select*fromprispevekorderbydatumdesc",
    "selectautor,datum,textfromprispevekorderbydatumdesc",
  ];
  // Get the table element
  const table = document.getElementById("articles2Table");
  // Clear the table content by setting innerHTML to an empty string
  table.innerHTML = "";

  if (validQueries2.includes(userInput2)) {
    try {
      queryAndFillArticle("articles2Table", editorOrderByDesc.getValue());
      document.getElementById("dfTask2").innerHTML =
        texts.df.dfTaskInputCorrectText;
      handleDownEnabled = true;
    } catch (e) {
      try {
        queryAndFillArticle("articles2Table", editorSelect.getValue());
      } catch (e) {
        document.getElementById("dfTask2").innerHTML =
          texts.df.dfTaskInputIncorrectText;
      }
    }
  } else {
    try {
      queryAndFillArticle("articles2Table", editorSelect.getValue());
    } catch (e) {
      document.getElementById("dfTask2").innerHTML =
        texts.df.dfTaskInputIncorrectText;
    }
  }
}

function handleOrderByAsc() {
  // Implementation similar to handleSelect for ascending order
  const userInput3 = processUserInput(editorOrderByAsc);
  const validOrderQueries3 = [
    "select*fromprispevekorderbydatumasc",
    "select*fromprispevekorderbydatum",
    "selectautor,datum,textfromprispevekorderbydatumasc",
    "selectautor,datum,textfromprispevekorderbydatum",
  ];
  // Get the table element
  const table = document.getElementById("articles2Table");
  table.innerHTML = "";

  if (validOrderQueries3.includes(userInput3)) {
    try {
      queryAndFillArticle("articles2Table", editorOrderByAsc.getValue());
      document.getElementById("dfTask3").innerHTML =
        texts.df.dfTaskInputCorrectText;
      handleUpEnabled = true;
    } catch (e) {
      switch (true) {
        case handleDownEnabled:
          queryAndFillArticle("articles2Table", editorOrderByDesc.getValue());
          break;
        default:
          try {
            queryAndFillArticle("articles2Table", editorSelect.getValue());
          } catch (e) {
            texts.df.dfTaskInputIncorrectText;
          }
      }
      document.getElementById("dfTask3").innerHTML =
        texts.df.dfTaskInputIncorrectText;
    }
  } else {
    switch (true) {
      case handleDownEnabled:
        queryAndFillArticle("articles2Table", editorOrderByDesc.getValue());
        break;
      default:
        try {
          queryAndFillArticle("articles2Table", editorSelect.getValue());
        } catch (e) {
          texts.df.dfTaskInputIncorrectText;
        }
    }
    document.getElementById("dfTask3").innerHTML =
      texts.df.dfTaskInputIncorrectText;
  }
}
// Function to handle the INSERT query task
function handleInsert() {
  // Implementation for handling INSERT INTO query
  const userInput4 = editorInsert.getValue();
  // Get the table element
  const table = document.getElementById("articles2Table");
  // Clear the table content by setting innerHTML to an empty string
  table.innerHTML = "";
  if (processUserInput(editorInsert).startsWith("insertintoprispevek")) {
    if (tryExecuteQuery(userInput4)) {
      queryAndFillArticle("articles2Table", "select * from prispevek");
      document.getElementById("dfTask4").innerHTML =
        texts.df.dfTaskInputCorrectText;
      handleOkEnabled = true;
    } else {
      switch (true) {
        case handleUpEnabled:
          queryAndFillArticle("articles2Table", editorOrderByAsc.getValue());
          break;
        case handleDownEnabled:
          queryAndFillArticle("articles2Table", editorOrderByDesc.getValue());
          break;
        default:
          try {
            queryAndFillArticle("articles2Table", editorSelect.getValue());
          } catch (e) {
            texts.df.dfTaskInputIncorrectText;
          }
      }
      document.getElementById("dfTask4").innerHTML =
        texts.df.dfTaskInputIncorrectText;
    }
  } else {
    switch (true) {
      case handleUpEnabled:
        queryAndFillArticle("articles2Table", editorOrderByAsc.getValue());
        break;
      case handleDownEnabled:
        queryAndFillArticle("articles2Table", editorOrderByDesc.getValue());
        break;
      default:
        try {
          queryAndFillArticle("articles2Table", editorSelect.getValue());
        } catch (e) {
          texts.df.dfTaskInputIncorrectText;
        }
    }
    document.getElementById("dfTask4").innerHTML =
      texts.df.dfTaskInputIncorrectText;
  }
}
// Functions to handle additional actions based on enabled flags
function handleDown() {
  // If the button is enabled, it can rearrange articles accordingly
  if (!handleDownEnabled) return;
  queryAndFillArticle(
    "articles2Table",
    "select * from prispevek order by date(datum) desc"
  );
}
function handleUp() {
  // If the button is enabled, it can rearrange articles accordingly
  if (!handleUpEnabled) return;
  queryAndFillArticle(
    "articles2Table",
    "select * from prispevek order by date(datum) asc"
  );
}

function handleOk() {
  // If the button is enabled, user can insert into articles
  if (!handleOkEnabled) return;
  const authorElement = document.getElementById("articleAuthor");
  const textElement = document.getElementById("articleText");

  insertIntoPreparedStatementArticles(authorElement.value, textElement.value);
  queryAndFillArticle("articles2Table", "select * from prispevek");
}
