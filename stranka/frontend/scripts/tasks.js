let editorTasks;

document.addEventListener("DOMContentLoaded", function () {
  editorTasks = initializeCodeMirrorEditor("taskInput");
});

// Initialize a variable to keep track of the current query
let currentQuery = 0;
// An array of questions corresponding to the SQL queries
const questions = [
  // Each question represents an SQL query
];
// An array of correct SQL queries corresponding to the questions
const correctQueries = [
  // Each correct query corresponds to the question at the same index
];
// An array containing final expected queries (SELECT)
let expectedQueries = [
  // ... to be loaded
];

function fetchTasks(url) {
  // Create a new XMLHttpRequest object
  fetch(getApiEndpoint() + "/get_api_key")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      var apiKey = data.API_KEY;
      const http = new XMLHttpRequest();
      // Initialize the request with the specified URL, method, and asynchronous flag
      http.open("GET", url, true);
      http.setRequestHeader("Content-Type", "application/json");
      http.setRequestHeader("X-API-KEY", apiKey);

      http.onload = function () {
        // If the HTTP status code of the response is 200 (OK)
        if (http.status === 200) {
          const response = JSON.parse(http.responseText);
          response.forEach((task) => {
            // Extract the task description and correct query, and push them into corresponding arrays
            questions.push(task.assignment);
            correctQueries.push(task.solution);
          });
          expectedQueries = [...correctQueries];

          const sidebar = document.getElementById("navbar");

          sidebar.innerHTML = "";
          // Create a link for each SQL task fetched from the response
          response.forEach((_task, index) => {
            const link = document.createElement("a");
            // Set the text content of the link to indicate the task number
            link.textContent = texts.tasks.tasksTitle + ` ${index + 1}`;
            link.onclick = () => {
              selectQuestion(index);
              // Set active class for clicked link
              document.querySelectorAll("#navbar a").forEach((link) => {
                link.classList.remove("active");
                link.classList.add("inactive");
              });
              link.classList.remove("inactive");
              link.classList.add("active");
            };
            // Append the link to the sidebar
            sidebar.appendChild(link);
          });
          // Select and activate the first link in the sidebar by default
          const firstLink = sidebar.querySelector("a");
          if (firstLink) {
            firstLink.classList.remove("inactive");
            firstLink.classList.add("active");
          }
          // Call the selectQuestion function with index 0 to initially select the first task
          selectQuestion(0);
        } else {
          console.error("Error:", http.statusText);
        }
      };
      // Send the XMLHttpRequest
      http.send();
    })
    .catch((error) => {
      console.error("Error fetching API key:", error);
    });
}

function getTableNameFromQuery(query) {
  const splitQuery = query.trim().toLowerCase().split(/\s+/);

  if (splitQuery.includes("select")) {
    const fromIndex = splitQuery.indexOf("from");
    return splitQuery[fromIndex + 1];
  } else if (splitQuery.includes("insert")) {
    const intoIndex = splitQuery.indexOf("into");
    return splitQuery[intoIndex + 1];
  } else if (splitQuery.includes("update")) {
    return splitQuery[1];
  } else if (splitQuery.includes("delete")) {
    const fromIndex = splitQuery.indexOf("from");
    return splitQuery[fromIndex + 1];
  }
}

function selectQuestion(questionNumber) {
  // Set the current query to the provided question number
  currentQuery = questionNumber;
  // Display the question associated with the current query
  document.getElementById("taskQuestion").innerHTML =
    texts.tasks.tasksTitle +
    ` ${questionNumber + 1}: <strong>${questions[currentQuery]}</strong>`;
  // Show the expected result based on the correct query
  // Depending on the query type (INSERT, UPDATE, DELETE), handle accordingly
  const splitquery = correctQueries[currentQuery].toLowerCase().split(/\s+/);
  const tableName = getTableNameFromQuery(correctQueries[currentQuery]);
  const newTableName = tableName + (currentQuery + 1);
  if (
    splitquery.includes("insert") ||
    splitquery.includes("update") ||
    splitquery.includes("delete")
  ) {
    createSpecialTable(
      tableName,
      newTableName,
      correctQueries[currentQuery].replace(tableName, newTableName)
    );
    expectedQueries[currentQuery] = "SELECT * from " + newTableName;
    showExpectedResult(currentQuery, "SELECT * from " + newTableName);
  } else showExpectedResult(currentQuery, correctQueries[currentQuery]);

  // Reset input, actual result, and result display
  const taskInput = editorTasks.getValue();
  if (taskInput) {
    editorTasks.setValue("");
  }

  const taskActual = document.getElementById("taskActual");
  if (taskActual) {
    taskActual.innerHTML = "";
  }

  const taskResult = document.getElementById("tasksResult");
  if (taskResult) {
    taskResult.innerHTML = texts.tasks.tasksResult;
  }

  // Deactivate all links
  const numQuestions = questions.length;
  for (let i = 1; i <= numQuestions; i++) {
    const menuLink = document.getElementById("menuLink" + i);
    if (menuLink) {
      menuLink.classList.remove("active");
      menuLink.classList.add("inactive");
    }
  }

  // Filter tables related to the current task and update button colors
  const queryText = correctQueries[currentQuery].toLowerCase();
  const tablesRelatedToCurrentTask = preparedTables.filter((tableName) =>
    queryText.includes(tableName.toLowerCase())
  );

  // Change the button colors for tables related to the current task
  const buttons = document.querySelectorAll(".button");
  buttons.forEach((button) => {
    if (tablesRelatedToCurrentTask.includes(button.textContent.toLowerCase())) {
      button.style.backgroundColor = "black";
      button.style.color = "white";
      button.style.border = "1px solid black";
    } else {
      button.style.backgroundColor = "";
      button.style.color = "";
      button.style.border = ""; // Reset to default color
    }
  });
}

// Show the expected result after a short delay
async function showExpectedResult(_taskNumber, query) {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  await delay(700);
  queryAndFillTable("taskExpected", query, true);
}
// Function to submit the user's answer
function submitAnswer() {
  let query = editorTasks.getValue();
  query = query.replace(/\n/g, "");
  const splitquery = query.toLowerCase().toString().split(/\s+/);
  if (
    splitquery.includes("insert") ||
    splitquery.includes("update") ||
    splitquery.includes("delete")
  ) {
    const tableName = getTableNameFromQuery(query);
    const tmpTableName = "tmp";
    createSpecialTable(
      tableName,
      tmpTableName,
      query.replace(tableName, tmpTableName)
    );
  }

  try {
    // Compare expected and actual results for SELECT queries and display the result
    const expectedResult = queryAndFillTable(
      "taskExpected",
      expectedQueries[currentQuery],
      true
    );
    let actualResult;
    if (
      splitquery.includes("insert") ||
      splitquery.includes("update") ||
      splitquery.includes("delete")
    ) {
      const tmpTableName = "tmp";
      actualResult = queryAndFillTable(
        "taskActual",
        "SELECT * from " + tmpTableName,
        true
      );
    } else {
      actualResult = queryAndFillTable("taskActual", query, true);
    }
    const taskActualElement = document.getElementById("taskActual");
    taskActualElement.classList.remove("table-success", "table-danger"); // We need to reset table classes

    if (expectedResult == actualResult) {
      taskActualElement.classList.add("table-success"); // Correct table will be green
      document.getElementById("tasksResult").innerHTML =
        texts.tasks.tasksResultCorrect;
    } else {
      taskActualElement.classList.add("table-danger");
      document.getElementById("tasksResult").innerHTML =
        texts.tasks.tasksResultIncorrect;
    }
  } catch {
    document.getElementById("tasksResult").innerHTML =
      texts.tasks.tasksResultIncorrect;
    document.getElementById("taskActual").classList.add("table-danger"); // Incorrect table will be red
  }
}
