module.exports = {
  name: "Launchpad - Merge",

  async matches(url) {
    return url.hostname == "code.launchpad.net" && url.pathname.includes("+merge");
  },

  async parse(url) {
    let html = await fetch(url.href, { credentials: "include" }).then(data => data.text());
    let domParser = new DOMParser();
    let doc = domParser.parseFromString(html, "text/html");

    let description = doc.querySelector("meta[name=\"description\"]").getAttribute("content");
    let title = doc.querySelector(".context-publication h1").textContent;
    return {
      prefix: null,
      title,
      description,
      link: url.href
    };
  }
};
