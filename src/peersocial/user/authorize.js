/* global $ */

module.exports = function(imports, login, keychain) {
    var gun = imports.gun;

    var crypto = require("crypto");
    var url = require("url");
    
    var hostname = window.location.hostname;
    
    var authorize = function() {
        var useOAuth = false;
        if (!imports.app.state.query.auth && hostname != "www.peersocial.io" /*&& hostname != "localhost" */ )
            useOAuth = true;


        if (imports.app.state.query.auth && imports.app.state.query.pub && imports.app.state.query.epub) {
            if (!login.user) {
                // imports.app.on("login", () => {
                //     authorize();
                // });
                login.openLogin(function(){
                    authorize();
                });
            }
            else {
                // keychain("test").then((room) => {
                var room = login.user._.sea;

                var domain = "https://" + imports.app.state.query.auth;
                var domain_hash = crypto.createHash('sha256').update(domain).digest('hex');
            


                imports.app.sea.certify(
                    imports.app.state.query.pub, // everybody is allowed to write
                    { "*": "notifications", "+": "*" }, // to the path that starts with 'profile' and along with the key has the user's pub in it
                    room, //authority
                    null, //no need for callback here
                    { expiry: Date.now() + (60 * 60 * 24 * 1000) } // Let's set a one day expiration period
                ).then(async(cert) => {
                    console.log(cert);
                    var d = await imports.app.sea.encrypt(cert, await imports.app.sea.secret(imports.app.state.query.epub, login.user._.sea)); // pair.epriv will be used as a passphrase
                    window.location = domain+ "/blank.html?epub=" + room.epub + "&pub=" + room.pub + "&cert=" + (new Buffer(d).toString("base64"));
                });
                // });
            }
            return true;
        }


        if (useOAuth) {

            keychain().then((room) => {

                var domain;
                if (hostname == "localhost")
                    domain = window.location.host;
                else
                    domain = "www.peersocial.io";

                domain = 'https://' + domain;

                var popupOptions = { popup: true, height: 800 };
                var _url = domain + '/login?' + 'auth=' + window.location.host + "&" + "pub=" + room.pub + "&" + "epub=" + room.epub;
                var popup = window.open(_url, 'auth', popupOptions);

                var interval = setInterval(function() {
                    if (popup.closed !== false) {

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
                        var cert = query.cert;
                        if (cert) {
                            (async() => {
                                cert = Buffer.from(cert, "base64").toString("utf8");
                                cert = await imports.app.sea.decrypt(cert, await imports.app.sea.secret(query.epub, room));
                                query.cert = cert;
                                console.log(query);


                                gun.user().auth(room, function(res) {

                                    if (!res.err) {
                                        if (login.user) {
                                            login.prepLogout();
                                            imports.app.emit("login", login.user);
                                            imports.app.state.history.back();
                                        }
                                    }


                                });
                            })();
                        }
                        clearInterval(interval);
                        //popup.close();
                    }
                }, 500);
            });
            return true;
        }
        return false;
    }

    return authorize;
};
