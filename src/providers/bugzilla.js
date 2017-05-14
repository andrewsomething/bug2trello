module.exports = {
  name: "Bugzilla",

  async matches(url) {
    return url.pathname.includes("show_bug.cgi");
  },

  async parse(url) {
    let bugNum = url.search.split("id=").slice(-1)[0];
    let bugOrg = url.hostname.split(".")[1];
    let bugPrefix = url.href.split("show_bug.cgi")[0];
    let bugUrl = `${bugPrefix}/jsonrpc.cgi?method=Bug.get&params=[{"ids":[${bugNum}]}]`;

    let body = await fetch(bugUrl).then(data => data.json());

    let bugJson = body.result.bugs["0"];
    let prefix = `${bugOrg}: #${bugJson.id}`;
    let title = body.result.bugs["0"].summary;
    return {
      prefix,
      title,
      description: "",
      link: url.href
    };
  }
};
