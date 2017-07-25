let github = require("./github");

module.exports = {
  name: "GitHub Enterprise",

  async matches(url) {
    try {
      let html = await fetch(url.href, { credentials: "include" }).then(data => data.text());

      let domParser = new DOMParser();
      let doc = domParser.parseFromString(html, "text/html");
      let og_site_name = doc.querySelector("meta[property=\"og:site_name\"]").getAttribute("content");
      return og_site_name == "GitHub Enterprise";
    } catch (e) {
      console.error(`Error in provider "${this.name}" while matching:`, e);
      return false;
    }
  },

  async parse(url) {
    return github.parse(url);
  }
};
