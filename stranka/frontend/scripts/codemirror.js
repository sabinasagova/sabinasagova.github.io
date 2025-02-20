function initializeCodeMirrorEditor(id) {
  var editor = CodeMirror.fromTextArea(document.getElementById(id), {
    mode: "text/x-sql",
    lineNumbers: true,
    matchBrackets: true,
    autofocus: true,
  });
  return editor;
}
