module.exports = (config, server) => {

    console.log("App Mode", process.env.APP_ENV);
    
    if (server) {

    }
    else {

        //core
        
        config.push(require("./service/plugin"));
        config.push(require("./react_vue/plugin"));
        config.push(require("./layout/plugin"));
        config.push(require("./state/plugin"));
        config.push(require("./gun/plugin"));
        config.push(require("./user/plugin"));

        //app
        config.push(require("./terminal/plugin"));
        config.push(require("./welcome/plugin"));
        config.push(require("./messenger"));
        config.push(require("./profile/plugin"));
        config.push(require("./peers/plugin"));
        config.push(require("./posts/plugin"));

    }



};