let editorOwnTasks;

document.addEventListener("DOMContentLoaded", function () {
  editorOwnTasks = initializeCodeMirrorEditor("solution");
});

// Function to show a toast and hide it after 5 seconds
function showToast(toastId, delay) {
  var toastElement = document.getElementById(toastId);
  var toast = new bootstrap.Toast(toastElement, { autohide: false });
  toast.show();
  setTimeout(function () {
    toast.hide();
  }, delay);
}

window.onload = function () {
  var successToast = new bootstrap.Toast(
    document.getElementById("successToast"),
    {
      autohide: false,
    }
  );
  showToast("successToast", 5000);
};

function buttonHandler() {
  const http = new XMLHttpRequest();
  var token = localStorage.getItem("token");
  var url = getApiEndpoint() + "/tasks/users";
  http.open("POST", url, true);
  http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  var data = JSON.stringify({
    token: token,
  });
  http.onload = function () {
    const responseData = JSON.parse(this.responseText);
    updateTable(responseData);
  };
  http.send(data);
}

document.addEventListener("DOMContentLoaded", buttonHandler);

function updateTable(data) {
  const tableBody1 = document.querySelector("#tasksTable1 tbody");
  const tableBody2 = document.querySelector("#tasksTable2 tbody");

  tableBody1.innerHTML = "";
  tableBody2.innerHTML = "";

  data.forEach((rowData) => {
    const row = document.createElement("tr");

    const checkboxCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkboxCell.appendChild(checkbox);
    checkboxCell.appendChild(document.createTextNode("\u00A0"));
    checkboxCell.appendChild(document.createTextNode("\u00A0"));
    row.appendChild(checkboxCell);

    const idCell = document.createElement("td");
    idCell.textContent = rowData.taskID;
    row.appendChild(idCell);

    const assignmentCell = document.createElement("td");
    assignmentCell.textContent = rowData.assignment;
    row.appendChild(assignmentCell);

    if (rowData.userID !== 1) {
      const solutionCell = document.createElement("td");
      solutionCell.textContent = rowData.solution;
      row.appendChild(solutionCell);
    }

    if (rowData.userID !== 1) {
      const trashCell = document.createElement("td");
      const trashButton = document.createElement("button");
      trashButton.type = "button";
      trashCell.appendChild(document.createTextNode("\u00A0"));
      trashCell.appendChild(document.createTextNode("\u00A0"));
      trashButton.className = "btn btn-light btn-sm trash-button";
      trashButton.innerHTML = '<i class="bi bi-trash"></i>';
      trashCell.appendChild(trashButton);
      trashButton.addEventListener("click", function () {
        const taskID = rowData.taskID;
        deleteTask(taskID);
      });

      row.appendChild(trashCell);
    }

    if (rowData.userID !== 1) {
      tableBody2.appendChild(row);
    } else {
      tableBody1.appendChild(row);
    }
  });
}

function submitFormData() {
  var userID = localStorage.getItem("userID");
  var assignment = document.getElementById("assignment").value;
  var solution = editorOwnTasks.getValue();
  var http = new XMLHttpRequest();
  var token = localStorage.getItem("token");
  var url = getApiEndpoint() + "/tasks";
  http.open("POST", url, true);
  http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  http.onreadystatechange = function () {
    if (http.readyState === 4) {
      if (http.status === 200) {
        var addToast = new bootstrap.Toast(
          document.getElementById("addToast"),
          {
            autohide: false,
          }
        );
        showToast("addToast", 5000);
        buttonHandler();
      } else {
        console.error("Error", http.statusText);
      }
    }
  };

  var data = JSON.stringify({
    assignment: assignment,
    solution: solution,
    token: token,
  });
  http.send(data);
}

function deleteTask(taskID) {
  const http = new XMLHttpRequest();
  var token = localStorage.getItem("token");
  var url = getApiEndpoint() + "/tasks/taskID/" + taskID;
  http.open("DELETE", url, true);
  http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  var data = JSON.stringify({
    token: token,
  });
  http.onload = function () {
    if (http.status === 200) {
      buttonHandler();
    } else {
      console.error("Error:", http.statusText);
    }
  };
  http.send(data);
}

function sendCode() {
  var code = document.getElementById("code").value;
  var checkBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
  var userID = localStorage.getItem("userID");
  var token = localStorage.getItem("token");
  var http = new XMLHttpRequest();
  var url = getApiEndpoint() + "/codes";
  http.open("POST", url, true);
  http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  http.onreadystatechange = function () {
    if (http.readyState === 4) {
      if (http.status === 200) {
        document.getElementById("result").innerHTML =
          texts.ownTaskSets.codeSuccessMessage;
      } else {
        document.getElementById("result").innerHTML =
          texts.ownTaskSets.codeFailureMessage;
      }
    }
  };
  var data = {
    code: code,
    userID: userID,
    checkedBoxes: [],
    token: token,
  };
  checkBoxes.forEach(function (checkBox) {
    var taskID = checkBox
      .closest("tr")
      .querySelector("td:nth-child(2)").textContent;
    data.checkedBoxes.push(taskID);
  });
  http.send(JSON.stringify(data));
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userID");
  window.location.href = "test.html";
}
