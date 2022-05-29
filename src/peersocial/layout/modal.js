module.exports = function(imports) {

    return function(html, options) {
        /* globals $ */

        var $canceled = false;

        var model = $(html);

        if (!options)
            options = {};
        else if(options.goBack) $canceled = true;


        var $options = {
            open: function() {},
            close: function(canceled) {
                if (canceled) 
                    imports.app.state.back();
                
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

        model.close = function(canceled) {
            if (!(typeof canceled == "undefined"))
                $canceled = canceled == true ? true : false;
            model.modal('hide');
        };

        model.find(".close-modal").click(model.cancel);

        model.on("hide.bs.modal", function() {
            if (options.close)
                options.close($canceled);
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