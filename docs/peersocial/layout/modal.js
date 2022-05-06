module.exports = function(imports) {

    return function(html, options) {
        /* globals $ */

        var goBack = false;

        var model = $(html);

        if (!options)
            options = {};
        else if(options.goBack) goBack = true;


        var $options = {
            backHash: "/",
            open: function() {},
            hide: function() {},
            show: function() {},
            close: function($goBack) {
                if ($goBack) {
                    // if (imports.app.state.lastHash)
                    //     imports.app.state.hash = imports.app.state.lastHash;
                    // else {
                    // if (imports.app.state.history.length > 0)
                        imports.app.state.back();
                    // else {
                    //     if (typeof options.backHash == "function")
                    //         imports.app.state.hash = options.backHash();
                    //     else
                    //         imports.app.state.hash = options.backHash;
                    // }
                    // }
                }
            }
        };

        for (var i in $options)
            if (!options[i])
                options[i] = $options[i];

        model.modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });

        model.cancel = function() {
            model.close(true);
        };

        model.close = function($goBack) {
            if (!(typeof $goBack == "undefined"))
                goBack = $goBack ? true : false;
            model.modal('hide');
        };

        model.find(".close-modal").click(model.cancel);

        model.on("hide.bs.modal", function() {
            if (options.close)
                options.close(goBack);
        });

        model.on("hidden.bs.modal", () => {
            model.modal("dispose");
            model.remove();
        });

        if (options.open)
            model.on("shown.bs.modal", options.open);

        return model;
    };

};