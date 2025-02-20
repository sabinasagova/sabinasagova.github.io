function submitFormData(event) {
  event.preventDefault();
  var email = event.target.email.value;
  var successToast = new bootstrap.Toast(
    document.getElementById("successToast"),
    {
      autohide: false,
    }
  );
  var errorToast = new bootstrap.Toast(document.getElementById("errorToast"), {
    autohide: false,
  });

  var http = new XMLHttpRequest();
  var url = getApiEndpoint() + "/users/registrations/emails/" + email;
  http.open("POST", url, true);

  http.onreadystatechange = function () {
    if (http.readyState == 4) {
      if (http.status == 200) {
        successToast.show();
      } else {
        errorToast.show();
      }
    }
  };
  http.send();
}
