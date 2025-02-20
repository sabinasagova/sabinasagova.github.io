const currentPage = window.location.pathname.split("/").pop(); // Get the current page
setActivePage(currentPage); // Set the active page

// Set page title and specific content
let pageTitle = texts.homepage.title;

if (currentPage === "index.html" || currentPage === "") {
  setActivePage("index.html");
  document.getElementById("homepageDescription").innerHTML =
    texts.homepage.description;
}

if (currentPage === "sqlplayground.html") {
  document.getElementById("sqlPlaygroundDescription").innerHTML =
    texts.sqlPlayground.sqlPlaygroundText;
  document.getElementById("tablesButton").innerHTML =
    texts.sqlPlayground.tablesButtonText;
  document.getElementById("sqlPlaygroundButton").innerHTML =
    texts.sqlPlayground.sqlPlaygroundButtonText;
}

if (currentPage === "tasks.html" || currentPage === "owntasks.html") {
  document.getElementById("tablesButton").innerHTML =
    texts.tasks.tablesButtonText;
  document.getElementById("tasksButton").innerHTML =
    texts.tasks.tasksButtonText;
  document.getElementById("tasksDescription").innerHTML = texts.tasks.tasksText;
  document.getElementById("tasksResult").innnerHTML = texts.tasks.tasksResult;
}

if (currentPage === "forum.html") {
  document.getElementById("dfTitle1").innerHTML = texts.df.dfTitle1;
  document.getElementById("dfTitle2").innerHTML = texts.df.dfTitle2;

  document.getElementById("firstQuery").innerHTML = texts.df.firstQueryText;
  document.getElementById("secondQuery").innerHTML = texts.df.secondQueryText;
  document.getElementById("thirdQuery").innerHTML = texts.df.thirdQueryText;
  document.getElementById("fourthQuery").innerHTML = texts.df.fourthQueryText;

  document.getElementById("dfButtonSelect").innerHTML = texts.df.dfButtonText;
  document.getElementById("dfButtonOrderDesc").innerHTML =
    texts.df.dfButtonText;
  document.getElementById("dfButtonOrderAsc").innerHTML = texts.df.dfButtonText;
  document.getElementById("dfButtonInsert").innerHTML = texts.df.dfButtonText;
  document.getElementById("dfButtonAdd").innerHTML = texts.df.dfButtonAddText;

  document.getElementById("tableName").innerHTML = texts.df.dfTable;
  document.getElementById("author").innerHTML = texts.df.dfAuthor;
  document.getElementById("text").innerHTML = texts.df.dfText;

  document.getElementById("dfDescription1").innerHTML = texts.df.dfDescription1;
  document.getElementById("dfDescription2").innerHTML = texts.df.dfDescription2;
}

if (currentPage === "registration.html") {
  setActivePage("test.html");
  document.getElementById("email").innerHTML = texts.registration.emailText;
  document.getElementById("registrationButton").innerHTML =
    texts.registration.registrationButtonText;
  document.getElementById("linkBack").innerHTML =
    texts.registration.linkBackText;

  document.getElementById("successToastHeader").innerHTML =
    texts.registration.successToastHeaderText;
  document.getElementById("successToastBody").innerHTML =
    texts.registration.successToastBodyText;

  document.getElementById("dangerToastHeader").innerHTML =
    texts.registration.dangerToastHeaderText;
  document.getElementById("dangerToastBody").innerHTML =
    texts.registration.dangerToastBodyText;
}

if (currentPage === "owntasks.html") {
  setActivePage("test.html");
}

if (currentPage === "test.html") {
  document.getElementById("studentsTitle").innerHTML =
    texts.login.studentsTitleText;
  document.getElementById("teachersTitle").innerHTML =
    texts.login.teachersTitleText;

  document.getElementById("code").innerHTML = texts.login.codeText;
  document.getElementById("email").innerHTML = texts.login.emailText;
  document.getElementById("password").innerHTML = texts.login.passwordText;

  document.getElementById("codeButton").innerHTML = texts.login.codeButtonText;

  document.getElementById("rememberUser").innerHTML =
    texts.login.rememberUserText;
  document.getElementById("loginButton").innerHTML =
    texts.login.loginButtonText;
  document.getElementById("registrationLink").innerHTML =
    texts.login.registrationLinkText;

  document.getElementById("successToastHeader").innerHTML =
    texts.login.successToastHeaderText;
  document.getElementById("successToastBody").innerHTML =
    texts.login.successToastBodyText;
  document.getElementById("dangerToastHeader").innerHTML =
    texts.login.dangerToastHeaderText;
  document.getElementById("dangerToastBody").innerHTML =
    texts.login.dangerToastBodyText;
}

if (currentPage === "tasksets.html") {
  setActivePage("test.html");
  document.getElementById("tablesButton").innerHTML =
    texts.tasks.tablesButtonText;
  document.getElementById("successToastHeader").innerHTML =
    texts.ownTaskSets.successToastHeaderText;
  document.getElementById("successToastBody").innerHTML =
    texts.ownTaskSets.successToastBodyText;
  document.getElementById("addToastHeader").innerHTML =
    texts.ownTaskSets.addToastHeaderText;
  document.getElementById("addToastBody").innerHTML =
    texts.ownTaskSets.addToastBodyText;

  document.getElementById("mainTitle").innerHTML =
    texts.ownTaskSets.mainTitleText;
  document.getElementById("subtitle").innerHTML =
    texts.ownTaskSets.subtitleText;
  document.getElementById("title1").innerHTML = texts.ownTaskSets.titleText1;
  document.getElementById("title2").innerHTML = texts.ownTaskSets.titleText2;

  document.getElementById("assignmentTitle").innerHTML =
    texts.ownTaskSets.assignmentTitleText;
  document.getElementById("solutionTitle").innerHTML =
    texts.ownTaskSets.solutionTitleText;
  document.getElementById("addTaskButton").innerHTML =
    texts.ownTaskSets.addTaskButtonText;

  document.getElementById("preparedTasksColumn1").innerHTML =
    texts.ownTaskSets.preparedTasksColumn1Text;
  document.getElementById("preparedTasksColumn2").innerHTML =
    texts.ownTaskSets.preparedTasksColumn2Text;

  document.getElementById("ownTasksColumn1").innerHTML =
    texts.ownTaskSets.ownTasksColumn1Text;
  document.getElementById("ownTasksColumn2").innerHTML =
    texts.ownTaskSets.ownTasksColumn2Text;
  document.getElementById("ownTasksColumn3").innerHTML =
    texts.ownTaskSets.ownTasksColumn3Text;

  document.getElementById("codeTitle").innerHTML =
    texts.ownTaskSets.codeTitleText;
  document.getElementById("codeButton").innerHTML =
    texts.ownTaskSets.codeButtonText;
  document.getElementById("logoutButton").innerHTML =
    texts.ownTaskSets.logoutButtonText;
}

document.title = pageTitle;

const header = document.querySelector(".header");
texts.navItems.forEach((item) => {
  const link = document.createElement("a");
  link.className = item.isActive ? "active" : "inactive";
  link.href = item.href;
  link.textContent = item.text;
  header.appendChild(link);
});

if (window.location.pathname.endsWith("tasksets.html")) {
  logoutButton.id = "logoutButton";
  logoutButton.onclick = function () {
    logout();
  };
  logoutButton.style.backgroundColor = "crimson";
  logoutButton.style.color = "white";
  logoutButton.style.border = "none";
  logoutButton.style.padding = "14px 16px";
  header.appendChild(logoutButton);
  const indexLink = Array.from(header.children).find((link) =>
    link.href.includes("index.html")
  );
  if (indexLink) {
    header.removeChild(indexLink);
  }
}
