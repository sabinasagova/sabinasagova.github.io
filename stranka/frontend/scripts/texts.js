const texts = {
  navItems: [
    { text: "Úvod", href: "index.html", isActive: false },
    { text: "SQL hřiště", href: "sqlplayground.html", isActive: false },
    { text: "Úkoly", href: "tasks.html", isActive: false },
    { text: "Diskusní fórum", href: "forum.html", isActive: false },
    { text: "Test", href: "test.html", isActive: false },
  ],
  homepage: {
    title: "SQLSaga",
    description:
      "<b>Vítejte na naší stránce</b>, kde můžete procvičovat SQL dotazy! SQL je jazyk pro práci s databázemi a získávání potřebných informací. Na naší stránce si můžete vyzkoušet i interaktivní úkol, který vám pomůže lépe pochopit, jak funguje propojení webové stránky a databáze. Tak neváhejte <b>a začněte se učit SQL s námi!</b> <br> <br> Lokální databáze umožňuje hrát si s tabulkami, aniž by se něco pokazilo.",
  },
  sqlPlayground: {
    sqlPlaygroundText:
      "Na této stránce můžete zkoušet libovolné SQL dotazy. Můžete pracovat s existujícími tabulkami, které najdete v pravé části obrazovky. Zkuste si také vytvořit vlastní tabulku pomocí SQL dotazu.",
    tablesButtonText: "Tabulky",
    sqlPlaygroundButtonText: "Odeslat",
  },
  tasks: {
    tablesButtonText: "Tabulky",
    tasksButtonText: "Odeslat",
    tasksText: "Takto by měla vypadat tabulka po vykonání správného dotazu:",
    tasksResult: "Výsledek vašeho dotazu: ",
    tasksTitle: "SQL Úkol",
    tasksResultCorrect: "Výsledek vašeho dotazu: Tabulka se shoduje.",
    tasksResultIncorrect: "Výsledek vašeho dotazu: Tabulka se neshoduje.",
  },
  df: {
    dfTitle1:
      "Diskusní fórum zatím nefunguje, doplňte dotazy, aby začalo fungovat!",
    dfTitle2: "Diskusní fórum",

    firstQueryText:
      "Doplňte dotaz pro vypsání všech příspěvků (z tabulky prispevek).<br><em>Po zadání správného dotazu se v diskusním fóru vypíšou příspěvky.</em>",
    secondQueryText:
      "Seřaďte příspěvky od nejnovějších.<br><em>Po zadání správného dotazu začne fungovat řazení příspěvků - šipka dolů.</em>",
    thirdQueryText:
      "Seřaďte příspěvky od nejstarších.<br><em>Po zadání správného dotazu začne fungovat řazení příspěvků - šipka nahoru.</em>",
    fourthQueryText:
      "Přidejte příspěvek. Napište dotaz pro zadání libovolného příspěvku do fóra.<br><em>Po zadání správného dotazu začne fungovat přidávání příspěvků.</em>",

    dfButtonText: "Odeslat",
    dfButtonAddText: "Přidej",

    dfTable: "Tabulka prispevek",
    dfAuthor: "Autor",
    dfText: "Text",

    dfDescription1: "Vítejte v našem diskusním fóru!",
    dfDescription2: "Budeme rádi, když nám zde zanecháte nějaký vzkaz.",

    dfTaskInputIncorrectText: "Nesprávně.",
    dfTaskInputCorrectText: "Správně.",
  },
  registration: {
    emailText: "e-mail",
    registrationButtonText: "vygenerovat heslo",
    linkBackText: "zpět",

    successToastHeaderText: "Notifikace",
    successToastBodyText:
      "Vygenerování hesla proběhlo úspěšně. Heslo obdržíte e-mailem.",

    dangerToastHeaderText: "Notifikace",
    dangerToastBodyText:
      "Vygenerování hesla neproběhlo úspěšně. Špatně zadaný e-mail nebo slabé připojení k internetu.",
  },
  login: {
    studentsTitleText: "Pro studenty",
    teachersTitleText: "Pro učitele",

    codeText: "kód",
    emailText: "e-mail",
    passwordText: "heslo",

    codeButtonText: "Odeslat",

    rememberUserText: "zapamatovat si uživatele",
    loginButtonText: "přihlásit",
    registrationLinkText: "registrace/zapomenuté heslo",

    successToastHeaderText: "Notifikace",
    successToastBodyText: "Přihlášení proběhlo úspěšně.",
    dangerToastHeaderText: "Notifikace",
    dangerToastBodyText:
      "Přihlášení neproběhlo úspěšně. Špatně zadaný e-mail nebo heslo.",

    codeFailureMessage: "Špatně zadaný kód.",
    codeErrorMessage: "Neoprávněný přístup - neplatný nebo prošlý token.",
  },
  ownTaskSets: {
    tablesButtonText: "Tabulky",

    successToastHeaderText: "Notifikace",
    successToastBodyText: "Přihlášení proběhlo úspěšně.",
    addToastHeaderText: "Notifikace",
    addToastBodyText: "Úkol byl úspěšně přidán.",

    mainTitleText: "Zde můžete vytvořit sadu úkolů pro vaše studenty",
    subtitleText: "Přidejte další úkol",
    titleText1: "Pevné úkoly",
    titleText2: "Vlastní úkoly",

    assignmentTitleText: "Zadání - textový popis",
    solutionTitleText: "Řešení - SQL dotaz",
    addTaskButtonText: "Přidej",

    preparedTasksColumn1Text: "ID",
    preparedTasksColumn2Text: "Zadání",

    ownTasksColumn1Text: "ID",
    ownTasksColumn2Text: "Zadání",
    ownTasksColumn3Text: "Řešení",

    codeTitleText: "Kód pro sdílení se studenty:",
    codeButtonText: "Odeslat",
    logoutButtonText: "Odhlásit",

    codeSuccessMessage: "Kód byl úspěšně vytvořen.",
    codeFailureMessage: "Zadaný kód již existuje.",
  },
  errorText: "&nbsp;&nbspDATABÁZE HLÁSÍ CHYBU!&nbsp;&nbsp;",
};

function setActivePage(page) {
  texts.navItems.forEach((item) => {
    item.isActive = item.href === page;
  });
}
