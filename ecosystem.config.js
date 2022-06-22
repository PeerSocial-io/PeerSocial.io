module.exports = {
  apps: [ {
    name: 'docs-builder-watcher',
    script: 'run-build-and-wait.sh',
    watch: './src/.',
    ignore_watch: ["node_modules"],
    env: {
      GEN_HTTPS: true
    }
  }]
};
