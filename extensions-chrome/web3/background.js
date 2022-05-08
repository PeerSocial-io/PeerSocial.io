(function(sr) {
	/* globals chrome globalThis ServiceWorkerGlobalScope */

	if (globalThis && globalThis instanceof ServiceWorkerGlobalScope && typeof window == "undefined")
		globalThis.window = globalThis;

	// window.localStorage = chrome.storage.local;

	try {
		importScripts("app/background.js");
	}
	catch (e) {
		console.log(e);
	}

}());