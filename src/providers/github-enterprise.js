module.exports = {
  name: "GitHub Enterprise",

  async matches(url) {
    try {
      let html = await fetch(url.href).then(data => data.text());

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
    let path = url.pathname.split("/");
    let bugNum = path[path.length - 1];
    let bugRepo = path[2];
    let type = "Unkown";
    if (url.pathname.indexOf("issues") > -1) {
      type = "Issue";
    } else if (url.pathname.indexOf("pull") > -1) {
      type = "Pull";
    }
    let prefix = `${bugRepo}: #${bugNum}`;

    let html = await fetch(url.href).then(data => data.text());
    let domParser = new DOMParser();
    let doc = domParser.parseFromString(html, "text/html");

    let description = doc.querySelector("meta[name=\"description\"]").getAttribute("content");
    let title = doc.querySelector(".js-issue-title").textContent;
    title = `${title} (${type})`;
    return {
      prefix,
      title,
      description,
      link: url.href
    };
  }
};
