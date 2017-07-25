module.exports = {
  name: "GitHub",

  async matches(url) {
    return url.hostname == "github.com";
  },

  async parse(url) {
    let path = url.pathname.split("/");
    let bugNum = path[path.length - 1];
    let bugRepo = path[2];
    let type = url.pathname.includes("pull") ? "PR" : "Issue";
    let prefix = `${bugRepo}: #${bugNum}`;

    let html = await fetch(url.href, { credentials: "include" }).then(data => data.text());
    let domParser = new DOMParser();
    let doc = domParser.parseFromString(html, "text/html");

    let title = doc.querySelector(".js-issue-title").textContent.trim();
    let description = doc.querySelector(".comment-body:first-child").textContent.trim();
    title = `${title} (${type})`;
    return {
      prefix,
      title,
      description,
      link: url.href
    };
  }
};
