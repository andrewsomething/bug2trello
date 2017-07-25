module.exports = {
  name: "Bugzilla",

  async matches(url) {
    return url.pathname.includes("show_bug.cgi");
  },

  async parse(url) {
    let bugNum = url.searchParams.get("id");
    let bugOrg = url.hostname.split(".")[1];

    let html = await fetch(url.href, { credentials: "include" }).then(data => data.text());
    let domParser = new DOMParser();
    let doc = domParser.parseFromString(html, "text/html");

    let prefix = `${bugOrg}: #${bugNum}`;
    // Second selector is for bugzilla.mozilla.org
    let title = doc.querySelector("#short_desc_nonedit_display, #field-value-short_desc").textContent;
    let description = doc.querySelector(".bz_first_comment .bz_comment_text, #ct-0").textContent;
    return {
      prefix,
      title,
      description,
      link: url.href
    };
  }
};
