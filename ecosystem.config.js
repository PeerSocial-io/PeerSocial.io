module.exports = {
  apps : [{
    name: 'PeerSocial',
    script: 'PeerSocial.js',

    // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
    //args: './NORMAL',
    instances: 1,
    autorestart: true,
    watch: false
    
  }]
};
