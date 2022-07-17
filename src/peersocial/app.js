requirejs.define(function () {
    var config = [];

    //network
    config.push(require("./gun/plugin"));

    //app
    config.push(require("./user/plugin"));
    config.push(require("./welcome/plugin"));
    // config.push(require("./messenger"));
    // config.push(require("./profile/plugin"));
    // config.push(require("./peers/plugin"));
    // config.push(require("./posts/plugin"));

    return config;
})