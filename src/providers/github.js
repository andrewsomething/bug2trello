module.exports = {
  name: "GitHub",

  async matches(url) {
    return url.hostname == "github.com";
  },

  async parse(url) {
    let path = url.pathname.split("/");
    let bugNumber = path[path.length - 1];
    let owner = path[1];
    let repo = path[2];
    let bugUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${bugNumber}`;

    let body = await fetch(bugUrl).then(data => data.json());

    let prefix = `${repo}: #${bugNumber}`;
    let type = body.pull_request ? "PR" : "Issue";
    let title = `${body.title} (${type})`;
    return {
      prefix,
      title,
      description: body.body,
      link: body.html_url
    };
  }
};
