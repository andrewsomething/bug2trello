const LOGIN_STATUS_CONNECTED = "loggedin";
const LOGIN_STATUS_DISCONNECTED = "loggedout";
const LOGIN_STATUS_ERROR = "loginerror";

function Bug2TrelloSettings() {
  this.setupListeners();
  this.setupReviewLinks();
  this.trelloLogin();
}

Bug2TrelloSettings.prototype = {
  setupListeners() {
    document.getElementById("disconnect").addEventListener("click", this.trelloLogout.bind(this));
    document.getElementById("connect").addEventListener("click", this.trelloLogin.bind(this));
  },

  set loginStatus(status) {
    document.getElementById("login-status").setAttribute("data-status", status);
  },

  setupReviewLinks() {
    let reviewLinks = document.getElementById("review-links");
    let browser = "";
    if (navigator.userAgent.includes("Chrome")) {
      browser = "chrome";
    } else if (navigator.userAgent.includes("Firefox")) {
      browser = "firefox";
    }
    reviewLinks.setAttribute("data-browser", browser);
  },

  trelloLogin() {
    Trello.authorize({
      "name": "Bug 2 Trello",
      "expiration": "never",
      "scope": {
        "write": true,
        "read": true
      },
      "success": this.onTrelloLoginSuccess.bind(this),
      "error": this.onTrelloLoginFailed.bind(this)
    });
  },

  onTrelloLoginSuccess() {
    Trello.members.get("me", member => {
      document.getElementById("trelloFullName").textContent = member.fullName;
      this.loginStatus = LOGIN_STATUS_CONNECTED;
    });
  },

  onTrelloLoginFailed() {
    this.loginStatus = LOGIN_STATUS_ERROR;
  },

  trelloLogout() {
    Trello.deauthorize();
    this.loginStatus = LOGIN_STATUS_DISCONNECTED;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new Bug2TrelloSettings();
});
