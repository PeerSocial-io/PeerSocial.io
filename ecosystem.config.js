module.exports = {
  apps: [{
    name: "peersocial",
    script: 'run-build-and-wait.sh',
    watch: './src/.',
    ignore_watch: ["node_modules", "src/peersocial/server"],
  }, {
    name: "peersocial",
    script: 'server.js',
    watch: './src/.',
    ignore_watch: ["node_modules"],
    env: {
      GEN_HTTPS: true
    }
  }, ]
};
