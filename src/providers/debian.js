const TITLE_SUFFIX_LENGTH = " - Debian Bug report logs".length;

module.exports = {
  name: "Debian BTS",

  async matches(url) {
    return url.hostname == "bugs.debian.org" && url.pathname.includes("bugreport.cgi");
  },

  async parse(url) {
    let html = await fetch(url.href).then(data => data.text());
    let domParser = new DOMParser();
    let doc = domParser.parseFromString(html, "text/html");

    // Get title, removing the trailing " - Debian Bug report"
    let title = doc.getElementsByTagName("title")[0].textContent;
    title = title.slice(0, -TITLE_SUFFIX_LENGTH);
    let description = doc.querySelector(".message").innerText;
    return {
      prefix: "BTS",
      title,
      description,
      link: url.href
    };
  }
};
