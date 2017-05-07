module.exports = {
  name: "Launchpad - Bug",

  async matches(url) {
    return url.hostname == "bugs.launchpad.net" && url.pathname.includes("+bug");
  },

  async parse(url) {
    let path = url.pathname.split("+bug/").slice(-1)[0];
    let bugNum = path.split("/")[0];
    let bugUrl = `https://api.launchpad.net/1.0/bugs/${bugNum}`;

    let body = await fetch(bugUrl).then(data => data.json());

    let prefix = `LPP: #${body.id}`;
    return {
      prefix,
      title: body.title,
      description: body.description,
      link: body.web_link
    };
  }
};
