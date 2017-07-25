module.exports = {
  name: "Sourceforge",

  async matches(url) {
    return url.hostname == "sourceforge.net" && (url.pathname.includes("bugs") || url.pathname.includes("feature-requests"));
  },

  async parse(url) {
    let path = url.pathname.split("/");
    let bugNum = path[4];
    let bugType = path[3];
    let bugProject = path[2];
    let bugUrl = `https://sourceforge.net/rest/p/${bugProject}/${bugType}/${bugNum}`;

    let body = await fetch(bugUrl, { credentials: "include" }).then(data => data.json());

    let prefix = `SF: #${ body.ticket.ticket_num}`;
    let webLink = `https://sourceforge.net/p/${bugProject}/${bugType}/${bugNum}`;
    return {
      prefix,
      title: body.ticket.summary,
      description: body.ticket.description,
      link: webLink
    };
  }
};
