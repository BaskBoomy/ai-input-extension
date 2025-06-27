// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "ai-input-server",
      script: "./dist/index.js",
      watch: false,
    },
  ],
};
