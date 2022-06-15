//default gun
var Gun =   require('./src/root');


require('./src/shim');
require('./src/onto');
require('./src/valid');
require('./src/state');
require('./src/dup');
require('./src/ask');
require('./src/chain');
require('./src/back');
require('./src/put');
require('./src/get');
require('./src/on');
require('./src/map');
require('./src/set');
require('./src/mesh');
require('./src/websocket');
// require('./src/localStorage');

require('./lib/store');
require('./lib/rfs');
require("./lib/radix");
require("./lib/radisk");

require('./lib/axe');

//default extra gun lis to include
require('./lib/lex');

// require("./nts");
require("./lib/unset");
require("./lib/not");
require("./lib/open");
require("./lib/load");


require("./lib/rindexed");





//include sea in the build
require('./sea');


module.exports = Gun;