define(function(require, exports, module) {
    /* global $ */
    appPlugin.consumes = ["app", "state", "profile", "user", "gun", "layout"];
    appPlugin.provides = ["peer"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        var _self;

        var gun = imports.gun;

        function getPeerData(pub, done) {
            gun.get(pub).once(function(userData) {
                if (userData && userData.profile)
                    gun.get(pub).get("profile").once(function(profile) {
                        if (profile)
                            userData.profile = profile;
                        else {
                            userData.profile = false;
                        }
                        done(userData, userData.profile, pub);
                    });
                else {
                    if (!userData)
                        userData = false;

                    if (userData && !userData.profile)
                        userData.profile = false;

                    done(userData, userData.profile, pub);
                }
            });
        }

        function peerConfirm(text, done) {
            var confirmedComplete = false;
            var loginModel = $(imports.app.layout.ejs.render(require("./peer-confirm.html"), {
                body: text
            }));
            var model = $(loginModel);
            model.modal({
                show: true
            });
            model.on("hide.bs.modal", function() {
                done(confirmedComplete)
            });
            model.on("hidden.bs.modal", () => {
                model.modal("dispose");
                model.remove();
            });

            model.find("#confirm").click(() => {
                confirmedComplete = true;
                model.modal('hide');
            })
        }

        function loadPeersPage() {
            imports.profile.me(function(err, me, user) {
                if (!err) {
                    var peerListLayout = imports.app.layout.ejs.render(require("./peerList.html"), { me: me, user: user() })

                    peerListLayout = $(peerListLayout);

                    $("#main-container").html("");
                    $("#main-container").append(peerListLayout);

                    _self.listPeers(function(pList) {
                        for (var i in pList) {

                            var peerCard = $(imports.app.layout.ejs.render(require("./peer-card.html"), { profile: pList[i].profile, bio: pList[i].bio, profileImage: pList[i].profileImage, alias: pList[i].alias, pub: pList[i].pub, uid32: pList[i].uid32, add: false }));
                            peerListLayout.find(".peer-cards").append(peerCard);

                        }
                    })
                    /*
                    user.get("profile").get("peers").once(function(peersL) {
                        for (var i in peersL) {
                            if (i != "_" && i != "#")
                                getPeerData(peersL[i],function(data,profile) {

                                    var peerCard = $(imports.app.layout.ejs.render(require("./peer-card.html"), { profile:profile, bio: data.bio, profileImage:data.profileImage, alias: data.alias, pub: data.pub, uid32: data.uid32, add: false }));
                                    peerListLayout.find(".peer-cards").append(peerCard);
                                });
                        }
                    });*/

                    peerListLayout.find("#loopupPeer").click(() => {
                        var addedPeer = false;
                        var loginModel = require("./loopupPeer.html");
                        var model = $(loginModel);
                        model.modal({
                            show: true
                        });
                        model.on("hide.bs.modal", function() {

                        });
                        model.on("hidden.bs.modal", () => {
                            model.modal("dispose");
                            model.remove();
                        });
                        var val;
                        model.find("#username").keyup(() => {
                            if (val != model.find("#username").val()) {
                                val = model.find("#username").val();
                                model.find("#username").change();
                            }
                        });

                        model.find("#username").change(function() {
                            var query = $(this).val().split("#");
                            var username;
                            var userid32;
                            try {
                                if (query[0].length && query[1].length) {
                                    username = query[0];
                                    userid32 = query[1];
                                }
                            }
                            catch (e) { username = query[0]; }

                            var chain;


                            if (username) {
                                if (username[0] == "~")
                                    chain = gun.get(username)
                                else if (username[0] == "@")
                                    chain = gun.user(username);
                                else
                                    chain = gun.user("@" + username);
                            }
                            if (chain) {
                                chain.once((data) => {
                                    if (!data) return model.find("#results").html("");
                                    var $$peers = [];
                                    if (!data.pub) {
                                        var c = 0,
                                            b = 0;
                                        for (var i in data) {
                                            if (i.indexOf("~") == 0) { c += 1 }
                                        }

                                        for (var i in data) {
                                            if (i.indexOf("~") == 0) {
                                                getPeerData(i, function(peerData, profile, pubRoot) {
                                                    if (peerData) {
                                                        if (userid32) {
                                                            if (imports.user.uid(peerData.pub) == userid32) {
                                                                $$peers.push(peerData);
                                                                return next();
                                                            }
                                                        }
                                                        else {
                                                            if (!peerData.pub)
                                                                peerData.pub = pubRoot;
                                                            if (!peerData.uid32)
                                                                peerData.uid32 = imports.user.uid(peerData.pub);

                                                            $$peers.push(peerData);
                                                        }
                                                    }
                                                    b += 1;
                                                    if (b == c)
                                                        next();
                                                })
                                                // var peerData = await getPeerData(i);

                                            }
                                        }
                                    }
                                    else if ("~" + data.pub == username) {
                                        $$peers.push(data);
                                    }

                                    function next() {
                                        if ($$peers.length) {

                                            var peerCard = $(imports.app.layout.ejs.render(require("./peer-card-side.html"), { peer_list: $$peers }));


                                            model.find("#results").html(peerCard);
                                            model.find("#results").show();

                                            model.find("#results").find(".btn").click(() => {

                                                model.modal('hide');

                                            });
                                        }
                                        else {
                                            model.find("#results").html("");
                                        }
                                    }
                                });
                            }
                            else {
                                model.find("#results").html("");
                            }

                        });

                    });
                }
            });
        }

        function peerIsAdded(pub, done) {
            imports.profile.me(function(err, me, user) {
                if (err) return done(false, true);
                user().get("profile").once(function(profile) {
                    if (profile && profile.peers) {
                        user().get("profile").get("peers").once(function(peersL) {
                            for (var i in peersL) {
                                if (i == "~" + pub && peersL[i])
                                    return done(true);
                            }
                            return done(false);
                        });
                    }
                    else return done(false);
                });
            })
        }

        function loadPeerProfile(query) {
            query = query[0].split("@");
            imports.user.getUser(query[1] || query[0], query[1] ? query[0] : false, function(err, $user, user) {
                if (err) {
                    console.log(err)
                }
                else {
                    peerIsAdded($user.pub, function(isMyPeer, notLoggedIn) {

                        user().get('profile').once((profile) => {
                            $user.profile = profile;
                            // $user.peer_apps_dev = await user().get('profile').get("peerappsDev");
                            // $user.peer_apps_v2 = await user().get('profile').get("peerapps_v2");

                            var profileLayout = imports.app.layout.ejs.render(require("./viewPeer.html"), {
                                user: $user,
                                $user: user,
                                isMyPeer: isMyPeer,
                                notLoggedIn: notLoggedIn
                            })
                            profileLayout = $(profileLayout);

                            profileLayout.find("#addPeer").click(() => {
                                peerConfirm("Do you want to add this peer?", function(Yes) {
                                    if (Yes)
                                        _self.addPeer($user.pub, (err, added) => {
                                            if (!err && added) {
                                                console.log("added peer");
                                                imports.state.reload();
                                            }
                                        });
                                });
                            });

                            profileLayout.find("#removePeer").click(() => {

                                peerConfirm("Do you want to remove this peer?", function(Yes) {
                                    if (Yes)
                                        _self.removePeer($user.pub, (err, removed) => {
                                            if (!err && removed) {
                                                console.log("removed peer");
                                                imports.state.reload();
                                            }
                                        });
                                });
                            });

                            if (profile) {
                                if (profile.display_name)
                                    user().get('profile').get("display_name").once(function(display_name) {
                                        profileLayout.find("#display_name").text(display_name);
                                    });
                                if (profile.tagline)
                                    user().get('profile').get("tagline").once(function(tagline) {
                                        profileLayout.find("#tagline").text(tagline);
                                    });
                            }




                            $("#main-container").html(profileLayout);

                        });
                    });
                }

            });
        }

        register(null, {
            peer: _self = {
                init: function() {
                    imports.app.on("login", function() {
                        // imports.layout.addNavBar(imports.app.layout.ejs.render('<li class="nav-item active" id="peers_btn"><a class="nav-link" href="/peers"><%= title %><span class="sr-only"></span></a></li>', { title: "Peers" }))
                        
                        // $("#navbar-nav-right").prepend(

                        // );
                    });
                    imports.state.$hash.on("peers", function() {
                        loadPeersPage();
                    });
                    imports.state.$hash.on("peer", function(query) {
                        loadPeerProfile(query);
                    });

                    imports.app.on("start", () => {
                        
                        var empty_dropdown = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;
                        
                        
                        $("input#search").on("keydown", function(event) {
                            if(event.key == "Enter"){
                                 $("input#search").change();
                                 return false;
                            }
                            return true;
                        });

                        var val;
                        $("input#search").keyup(() => {
                            if (val != $("input#search").val()) {

                                $("#search").dropdown("show");
                                if (hideTimer) {
                                    clearTimeout(hideTimer)
                                    hideTimer = false;
                                }
                                hideTimer = setTimeout(() => {
                                    if (val != $("input#search").val()) {
                                        $("input#search").change();
                                    }
                                }, 1000)
                            }
                        });

                        var hideTimer = false;

                        $("#searchresults").html(empty_dropdown);
                        
                        $("input#search").change(function() {
                            if (val != $("input#search").val()) {
                                val = $("input#search").val();
                            }
                            else return;
                            
                            $("#searchresults").html(empty_dropdown);
                            $("#search").dropdown("show");

                            if (hideTimer) {
                                clearTimeout(hideTimer)
                                hideTimer = false;
                            }

                            var query = $(this).val().split("#");
                            var username;
                            var userid32;
                            try {
                                if (query[0].length && (query[1].length > 3)) {
                                    username = query[0];
                                    userid32 = query[1];
                                }
                            }
                            catch (e) { username = query[0]; }

                            var chain;


                            if (username) {
                                if (username[0] == "~")
                                    chain = gun.get(username)
                                else if (username[0] == "@")
                                    chain = gun.user(username);
                                else
                                    chain = gun.user("@" + username);
                            }
                            if (chain) {
                                // 
                                chain.once((data) => {
                                    if (!data) {
                                        $("#search").dropdown("hide");
                                        $("#searchresults").html(empty_dropdown);
                                        return;
                                    }
                                    var $$peers = [];
                                    if (!data.pub) {
                                        var c = 0,
                                            b = 0;
                                        for (var i in data) {
                                            if (i.indexOf("~") == 0) { c += 1 }
                                        }

                                        for (var i in data) {
                                            if (i.indexOf("~") == 0) {
                                                getPeerData(i, function(peerData, profile, pubRoot) {
                                                    if (peerData) {
                                                        if (userid32) {
                                                            if (imports.user.uid(peerData.pub) == userid32) {
                                                                $$peers.push(peerData);
                                                                return next();
                                                            }
                                                        }
                                                        else {
                                                            if (!peerData.pub)
                                                                peerData.pub = pubRoot;
                                                            if (!peerData.uid32)
                                                                peerData.uid32 = imports.user.uid(peerData.pub);

                                                            $$peers.push(peerData);
                                                        }
                                                    }
                                                    b += 1;
                                                    if (b == c)
                                                        next();
                                                })
                                                // var peerData = await getPeerData(i);

                                            }
                                        }
                                    }
                                    else if ("~" + data.pub == username) {
                                        $$peers.push(data);
                                    }

                                    function next() {
                                        if ($$peers.length) {

                                            var peerCard = $(imports.app.layout.ejs.render(require("./peer-card-side.html"), { peer_list: $$peers }));

                                            peerCard.find(".dropdown-item").each((i, e) => {
                                                var self = $(e);
                                                self.click(() => {
                                                    $("input#search").val('');
                                                });
                                            });

                                            $("#searchresults").html(peerCard);
                                        }
                                        else {
                                            $("#search").dropdown("hide");
                                            $("#searchresults").html(empty_dropdown);
                                        }
                                    }
                                });
                            }
                            else if (!username) {

                                $("#search").dropdown("hide");
                                $("#searchresults").html(empty_dropdown);
                            }

                        });

                    })
                },
                addPeer: function(pub, callback) {
                    if (imports.gun.user().is) {
                        getPeerData("~" + pub, function(data, profile, pubRoot) {
                            if (data)
                                imports.gun.user().get("profile").get("peers").set(pubRoot, (res) => {
                                    if (!res.err) {
                                        console.log("added peer");
                                        callback(null, true);
                                    }
                                    else callback(res.err);
                                });
                            else callback(data);
                        });
                        return;

                    }
                },
                removePeer: function(pub, callback) {
                    if (imports.gun.user().is) {
                        getPeerData("~" + pub, function(data, profile, pubRoot) {
                            if (data) {
                                var myPeersList = imports.gun.user().get("profile").get("peers");

                                myPeersList.unset(pubRoot);
                                setTimeout(function() {

                                    console.log("added removed");
                                    callback(null, true);

                                }, 500)

                            }
                            else callback(data);
                        });
                        return;

                    }
                },
                listPeers: function(done) {
                    var peers = [];

                    imports.profile.me(function(err, me, user) {
                        if (!err) {

                            user().get("profile").get("peers").once(function(peersL) {
                                var count = 0;
                                var recCount = 0;
                                for (var i in peersL) {
                                    if (i != "_" && i != "#" && peersL[i])
                                        count += 1;
                                }
                                for (var i in peersL) {
                                    if (i != "_" && i != "#" && peersL[i])
                                        getPeerData(peersL[i], function(data, profile) {
                                            if (data) {
                                                data.profile = profile;
                                                peers.push(data);
                                            }
                                            recCount += 1;
                                            if (count == recCount)
                                                done(peers);
                                        });
                                }


                            });
                        }
                    })
                }
            }
        });

    }

});