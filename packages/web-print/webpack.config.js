const { composePlugins, withNx } = require("@nx/webpack");
const { withReact } = require("@nx/react");
const { resolve } = require("path");

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  config["resolve"].alias = {
    "@": resolve(__dirname, "./src"),
    assets: resolve(__dirname, "./src/assets"),
  };
  return config;
});
