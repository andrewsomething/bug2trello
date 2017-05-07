/* global __dirname:true */

module.exports = {
  entry: {
    options: "./options/options.js",
    popup: "./popup/popup.js",
    vendor: ["jquery"]
  },
  output: {
    filename: "[name]/index.js",
    path: `${__dirname}/addon`
  },
  module: {
    rules: [{
      test: require.resolve("jquery"),
      use: [{
        loader: "expose-loader",
        options: "jQuery"
      }]
    }]
  }
};
