module.exports = {
  name: "Bitbucket",

  async matches(url) {
    return url.hostname == "bitbucket.org" && url.pathname.includes("pull-requests");
  },

  async parse(url) {
    let path = url.pathname.split("/");
    let bugNum = path[4];
    let bugOwner = path[1];
    let bugRepo = path[2];
    let bugUrl = `https://bitbucket.org/api/2.0/repositories/${bugOwner}/${bugRepo}/pullrequests/${bugNum}?fields=id,title,description`;

    let body = await fetch(bugUrl, { credentials: "include" }).then(data => data.json());

    let prefix = `${bugRepo}: #${body.id}`;
    return {
      prefix,
      title: body.title,
      description: body.description,
      link: url.href
    };
  }
};
