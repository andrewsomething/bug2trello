const browser = require("webextension-polyfill");
const providers = require("./providers/");

function Bug2TrelloPopup() {
  this.setupListeners();
  this.trelloLogin();
}

Bug2TrelloPopup.prototype = {
  get boardsSelect() {
    return document.getElementById("boards");
  },

  get selectedBoardId() {
    let select = this.boardsSelect;
    return select.options[select.selectedIndex].value;
  },

  get listsSelect() {
    return document.getElementById("lists");
  },

  get selectedListId() {
    let select = this.listsSelect;
    return select.options[select.selectedIndex].value;
  },

  set addBugEnabled(enabled) {
    let button = document.getElementById("add-bug");
    if (enabled) {
      button.removeAttribute("disabled");
    } else {
      button.setAttribute("disabled", "true");
    }
  },

  set loggedIn(bool) {
    document.getElementById("footer").setAttribute("data-loggedin", bool);
  },

  setupListeners() {
    let addListener = (elemId, listener, event = "click") => {
      let el = document.getElementById(elemId);
      el.addEventListener(event, listener.bind(this));
    };
    addListener("disconnect", this.trelloLogout);
    addListener("connect", this.trelloLogin);
    addListener("add-bug", this.onAddBugClicked);
    addListener("trello-link", this.openTrello);
    addListener("boards", this.onBoardSelected, "change");
  },

  trelloLogin() {
    Trello.authorize({
      interactive: false,
      success: this.onTrelloLoginSuccess.bind(this),
      error: this.onTrelloLoginFailed.bind(this)
    });
  },

  onTrelloLoginSuccess() {
    this.loggedIn = true;
    this.populateBoards();
  },

  onTrelloLoginFailed() {
    this.loggedIn = false;
    this.openTrelloLoginPage();
  },

  async onAddBugClicked() {
    let tab = await browser.tabs.query({
      currentWindow: true,
      active: true
    });
    let info;
    try {
      info = await this.parseLink(tab[0].url);
    } catch (e) {
      this.onBugParsingError(e);
      return;
    }
    let listId = this.selectedListId;
    let name = info.prefix ?
               `${info.prefix} - ${info.title}` :
               info.title;
    let description = `${info.link}\n\n${info.description}`;
    try {
      await this.createTrelloCard(listId, name, description);
    } catch (e) {
      this.onTrelloError(e);
      return;
    }
    this.showSuccessNotification(info.title);
    window.close();
  },

  async onBoardSelected() {
    this._purgeSelect(this.listsSelect);
    let boardId = this.selectedBoardId;
    try {
      await this.populateLists(boardId);
    } catch (e) {
      this.onTrelloError(e);
      return;
    }
    this.listsSelect.selectedIndex = 1;
    this.addBugEnabled = true;
  },

  async parseLink(tabUrl) {
    const url = new URL(tabUrl);
    for (let provider of providers) {
      if (await provider.matches(url)) {
        try {
          return await provider.parse(url);
        } catch (e) {
          throw new Error(`Error in provider "${provider.name}" while parsing:`, e);
        }
      }
    }
    throw new Error("Could not find a suitable provider.");
  },

  createTrelloCard(listId, name, desc) {
    return new Promise((resolve, reject) => {
      Trello.post("cards", {
        name,
        desc,
        idList: listId,
        success: resolve,
        error: reject
      });
    });
  },

  async populateLists(boardId) {
    return this._populateBoardsOrLists(this.listsSelect, `boards/${boardId}/lists`);
  },

  async populateBoards() {
    return this._populateBoardsOrLists(this.boardsSelect, "/members/me/boards?filter=open");
  },

  async _populateBoardsOrLists(select, url) {
    let boardsOrLists = await new Promise((resolve, reject) => {
      Trello.get(url, resolve, reject);
    });
    for (let boardOrList of boardsOrLists) {
      let option = document.createElement("option");
      option.value = boardOrList.id;
      option.text = boardOrList.name;
      select.appendChild(option);
    }
  },

  showSuccessNotification(cardTitle) {
    this._showNotification("Bug card added!", cardTitle);
  },

  onBugParsingError(error) {
    this._logError(error, "Can't send this to Trello, it doesn't look like a bug.");
  },

  onTrelloError(error) {
    this._logError(error, "Error communicating with Trello, check the extension console for more information.");
  },

  _logError(error, userMessage) {
    console.error(error);
    this._showNotification("Error", userMessage);
  },

  _showNotification(title, message) {
    browser.notifications.create(null, {
      "type": "basic",
      "iconUrl": browser.extension.getURL("icons/icon-32.png"),
      "title": title,
      "message": message
    });
  },

  trelloLogout() {
    this.loggedIn = false;
    this._purgeSelect(this.listsSelect);
    this._purgeSelect(this.boardsSelect);
    this.addBugEnabled = false;
    Trello.deauthorize();
  },

  _purgeSelect(select) {
    for (let option of [...select.options]) {
      // Keep the first option
      if (!option.hasAttribute("disabled")) {
        select.removeChild(option);
      }
    }
    select.selectedIndex = 0;
  },

  openTrelloLoginPage() {
    setTimeout(function() {
      let url = browser.extension.getURL("options/options.html");
      browser.tabs.create({url});
      window.close();
    }, 100);
  },

  openTrello() {
    let boardId = this.selectedBoardId;
    let pageToOpen;
    if (boardId) {
      pageToOpen = `https://trello.com/board/${boardId}`;
    } else {
      pageToOpen = "https://www.trello.com";
    }
    browser.tabs.create({
      url: pageToOpen
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new Bug2TrelloPopup();
});
