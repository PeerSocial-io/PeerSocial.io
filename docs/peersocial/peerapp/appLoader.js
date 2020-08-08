define(function(require, exports, module) {

    exports = async function(appSource) {
        try {
            return eval(appSource)
        }
        catch (e) {
            console.log(e);
            return e;
        }
    };
});