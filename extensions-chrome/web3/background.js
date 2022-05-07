// This file is currently an empty template for any potential future RPC operations.

var win;
try { 
	win = browser }
catch (e) {}
try { 
	win = win || chrome }
catch (e) {}


win.runtime.onSuspend.addListener(function() {
	console.log("Suspended");
});

// listen to the content script sending requests to this extension:
win.runtime.onMessage.addListener(function(msg, info, ack) {
	var tmp;
	//console.log("background:", msg);
	msg._ = {}; // overwrite _ as it is reserved or may not be serializable.
	if (tmp = msg.rpc) {
		if (!(tmp = win.RPC[tmp] || win.RPC[tmp[0]])) { // check if we support the operation.
			ack({ err: "Command '" + tmp + "' not found." });
			return;
		}
		tmp(msg, ack, info); // call it!
		return true;
	}
	return true;
});


win.RPC = {};