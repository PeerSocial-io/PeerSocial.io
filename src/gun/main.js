//default gun
var Gun =   require('./gun/src/root');
require('./gun/src/shim');
require('./gun/src/onto');
require('./gun/src/valid');
require('./gun/src/state');
require('./gun/src/dup');
require('./gun/src/ask');
require('./gun/src/chain');
require('./gun/src/back');
require('./gun/src/put');
require('./gun/src/get');
require('./gun/src/on');
require('./gun/src/map');
require('./gun/src/set');
require('./gun/src/mesh');
require('./gun/src/websocket');
require('./gun/src/localStorage');

//default extra gun lis to include
require('./gun/lib/lex');

require("./gun/nts");
require("./gun/lib/unset");
require("./gun/lib/not");
require("./gun/lib/open");
require("./gun/lib/load");

//include sea in the build
require('./gun/sea');

module.exports = Gun;