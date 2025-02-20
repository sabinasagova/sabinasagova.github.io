function checkToken() {
  var http = new XMLHttpRequest();
  var token = localStorage.getItem("token");

  var url = getApiEndpoint() + "/tokens";
  http.open("POST", url, true);

  http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  var data = JSON.stringify({
    token: token,
  });
  http.onreadystatechange = function () {
    if (http.readyState == 4) {
      if (http.status == 200) {
        window.location.href = "tasksets.html";
      } else if (http.status == 401) {
        // delete token from localstorage
        localStorage.removeItem("token");
      }
    }
  };
  http.send(data);
}

function submitFormData(event) {
  event.preventDefault();
  var email = event.target.email.value;
  var password = event.target.password.value;
  var rememberUser = event.target.exampleCheck1.checked;
  if (rememberUser) {
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
  } else {
    localStorage.removeItem("email");
    localStorage.removeItem("password");
  }
  var successToast = new bootstrap.Toast(
    document.getElementById("successToast"),
    { autohide: false }
  );
  var errorToast = new bootstrap.Toast(document.getElementById("errorToast"), {
    autohide: false,
  });
  var http = new XMLHttpRequest();
  var url =
    getApiEndpoint() +
    "/users/logins/emails/" +
    email +
    "/passwords/" +
    password;
  http.open("POST", url, true);
  http.onreadystatechange = function () {
    if (http.readyState == 4) {
      if (http.status == 200) {
        var response = JSON.parse(http.responseText);
        var token = response["token"];
        localStorage.setItem("token", token);
        window.location.href = "tasksets.html";
      } else {
        errorToast.show();
      }
    }
  };
  http.send();
}

function checkCode(event) {
  event.preventDefault();
  var code = event.target.code.value;
  var http = new XMLHttpRequest();
  var url = getApiEndpoint() + "/codes/codeID/" + code;
  var token = localStorage.getItem("token");
  http.open("GET", url, true);
  http.setRequestHeader("Authorization", token);
  http.setRequestHeader("Content-type", "application/json");
  http.onreadystatechange = function () {
    if (http.readyState == 4) {
      if (http.status == 200) {
        document.getElementById("result").innerHTML = "";
        localStorage.setItem("code", code);
        window.location.href = "owntasks.html";
      } else if (http.status == 404) {
        document.getElementById("result").innerHTML =
          texts.login.codeFailureMessage;
      } else if (http.status == 403) {
        document.getElementById("result").innerHTML =
          texts.login.codeErrorMessage;
      }
    }
  };
  http.send();
}
document.addEventListener("DOMContentLoaded", function () {
  var storedEmail = localStorage.getItem("email");
  var storedPassword = localStorage.getItem("password");
  if (storedEmail && storedPassword) {
    document.getElementById("emailInput").value = storedEmail;
    document.getElementById("passwordInput").value = storedPassword;
    document.getElementById("exampleCheck1").checked = true;
  }
  const togglePassword = document.querySelector("#togglePassword");
  const password = document.querySelector("#passwordInput");
  // Initially set the password input type to password
  password.setAttribute("type", "password");
  togglePassword.addEventListener("click", function () {
    // Toggle the type attribute
    const type =
      password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    // Toggle the eye icon
    togglePassword.classList.toggle("fa-eye-slash");
    togglePassword.classList.toggle("fa-eye");
  });
});
