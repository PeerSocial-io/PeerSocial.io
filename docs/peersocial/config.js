module.exports = (config, server) => {


    if (server) {
        
    }
    else {

        //core
        config.push(require("./layout/plugin"));
        config.push(require("./state/plugin"));
        config.push(require("./gun/plugin"));
        config.push(require("./user/plugin"));
        
        //app
        config.push(require("./welcome/plugin"));
        config.push(require("./profile/plugin"));
        config.push(require("./peers/plugin"));
        config.push(require("./posts/plugin"));

    }



};