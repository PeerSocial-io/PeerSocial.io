/* global $ */

module.exports = function(imports, login, keychain) {
    var gun = imports.gun;

    var crypto = require("crypto");
    var url = require("url");
    var querystring = require('querystring');
    var hostname = window.location.hostname;

    var authorize = function() {
        var useOAuth = false;
        // if (!imports.app.state.query.auth && hostname != "www.peersocial.io" /*&& hostname != "localhost" */ ) useOAuth = true;

        var domain_hash = crypto.createHash('sha256').update(window.location.host).digest('hex');

        if (login.will_authorize) {
            var domain = imports.app.state.query.auth;
            domain_hash = crypto.createHash('sha256').update(domain).digest('hex');

            if (!login.user) {
                // imports.app.on("login", () => {
                //     authorize();
                // });
                gun.user().recall({
                    sessionStorage: false
                });
                gun.user().leave();

                login.openLogin(function(canceled) {
                    if (canceled) {
                        window.location = "https://" + domain + "/blank.html?canceled=true";
                    }
                    else {
                        authorize();
                    }
                });
            }
            else {
                // keychain("test").then((room) => {
                var room = login.user()._.sea;


                imports.app.sea.certify(
                    imports.app.state.query.pub, // everybody is allowed to write
                    { "*": domain_hash, "+": "*" }, // to the path that starts with 'profile' and along with the key has the user's pub in it
                    room, //authority
                    null, //no need for callback here
                    { expiry: Date.now() + (60 * 60 * 24 * 1000) } // Let's set a one day expiration period
                ).then(async(cert) => {
                    console.log(cert);
                    var d = await imports.app.sea.encrypt(cert, await imports.app.sea.secret(imports.app.state.query.epub, login.user()._.sea)); // pair.epriv will be used as a passphrase


                    var tmp = "~" + imports.app.state.query.pub;
                    var data = {};

                    var link = {};
                    link[tmp] = { '#': tmp };
                    gun.user().get(domain_hash).get(imports.app.state.query.pub).put(link).get(tmp).once(function(data, key, msg, eve) {

                        var query = {
                            cert: new Buffer(d).toString("base64"),
                            pub: room.pub,
                            epub: room.epub,
                        };
                        query = querystring.stringify(query);

                        gun.user().leave();
                        window.sessionStorage.clear();

                        setTimeout(function() {
                            window.location = "https://" + domain + "/blank.html?" + query;
                        }, 1000)
                    });

                });
                // });
            }
            return true;
        }


        if (useOAuth) {

            keychain().then((room) => {

                gun.user().auth(room, function(res) {
                    gun.user().get("profile").get("seen").put(new Date().getTime(), function() {
                        var domain;

                        if (hostname == "localhost") domain = window.location.host;
                        else

                            domain = "www.peersocial.io";

                        domain = 'https://' + domain;

                        var popupOptions = "popup,location=1,toolbar=1,menubar=1,resizable=1,height=800,width=600";
                        var query = {
                            auth: window.location.host,
                            pub: room.pub,
                            epub: room.epub,
                        };
                        query = querystring.stringify(query);
                        var _url = domain + '/login?' + query;
                        var popup = window.open(_url, 'auth', popupOptions);

                        var interval = setInterval(function() {
                            if (popup.closed !== false) {
                                gun.user().leave();
                                clearInterval(interval);
                                imports.app.state.history.back();
                                return;
                            }

                            try {
                                (popup.location.pathname == "/blank.html");
                            }
                            catch (e) { return; }

                            // var message = (new Date().getTime());
                            // proxy.postMessage(message, domain); //send the message and target URI
                            if (popup.location.pathname == "/blank.html" && popup.location.host == window.location.host) {
                                var query = url.parse(popup.location.href, true).query;
                                if (query.cert) {
                                    (async() => {
                                        query.cert = Buffer.from(query.cert, "base64").toString("utf8");
                                        query.cert = await imports.app.sea.decrypt(query.cert, await imports.app.sea.secret(query.epub, room));
                                        login.user_cert = query;
                                        
                                        if (login.user) {
                                            gun.user().get("last").get("seen").put(new Date().getTime(), function() {

                                                login.prepLogout();
                                                imports.app.emit("login", login.user);
                                                imports.app.state.history.back();
                                            });
                                        }

                                    })();
                                }
                                else {
                                    imports.app.state.history.back();
                                }
                                clearInterval(interval);
                                popup.close();
                            }
                        }, 500);
                    });
                });
            });
            return true;
        }
        return false;
    }

    Object.defineProperty(login, 'will_authorize', {
        get() {
            return !!(imports.state.query.auth && imports.state.query.pub && imports.state.query.epub);
        }
    });
    
    return authorize;
};
