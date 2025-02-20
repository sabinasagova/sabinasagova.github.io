// This function toggles the visibility of an HTML element with the ID "tableNames".
function toggle() {
  // Get the HTML element with the ID "tableNames".
  var tableNames = document.getElementById("tableNames");

  // Check if the display style of the element is set to "none" (i.e., the element is hidden).
  if (tableNames.style.display == "none") {
    // If the element is hidden, change its display style to "block" to make it visible.
    tableNames.style.display = "block";
  } else {
    // If the element is visible, change its display style to "none" to hide it.
    tableNames.style.display = "none";
  }
}
