var NwBuilder = require('nw-builder');


var nw = new NwBuilder({
    files: __dirname + '/docs/**/**', // use the glob format
    platforms: [
        // "win64",
        // "osx64",
        "linux64"
    ],
    flavor: "normal"
});

// Log stuff you want
nw.on('log', console.log);

nw.build().then(function() {
    console.log('all done!');
}).catch(function(error) {
    console.error(error);
});