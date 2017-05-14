module.exports = {
  name: "Bitbucket",

  async matches(url) {
    return url.hostname == "bitbucket.org" && url.pathname.includes("issues");
  },

  async parse(url) {
    let path = url.pathname.split("/");
    let bugNum = path[4];
    let bugOwner = path[1];
    let bugRepo = path[2];
    let bugUrl = `https://bitbucket.org/api/1.0/repositories/${bugOwner}/${bugRepo}/issues/${bugNum}`;

    let body = await fetch(bugUrl).then(data => data.json());

    let prefix = `${bugRepo}: #${body.local_id}`;
    return {
      prefix,
      title: body.title,
      description: body.content,
      link: url.href
    };
  }
};
