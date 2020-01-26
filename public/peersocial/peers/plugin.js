define(function(require, exports, module) {

    appPlugin.consumes = ["app", "state", "profile", "user", "gun"];
    appPlugin.provides = ["peer"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        var _self;

        var gun = imports.gun;

        function getPeerData(pub) {
            return new Promise(resolve => {
                gun.get(pub).once(resolve);
            });
        }


        function loadPeersPage() {
            imports.profile.me(async function(err, me, user) {
                if (!err) {
                    var peerListLayout = $(await imports.app.layout.ejs.render(require("text!./peerList.html"), { me: me, user: user }, { async: true }));
                    $("#main-container").html("");
                    $("#main-container").append(peerListLayout)

                    user.get("profile").get("peers").once(function(peersL) {
                        for (var i in peersL) {
                            if (i != "_" && i != "#")
                                getPeerData(peersL[i]).then(function(data) {

                                    var peerCard = $(imports.app.layout.ejs.render(require("text!./peer-card.html"), { bio: data.bio, profileImage:data.profileImage, alias: data.alias, pub: data.pub, uid32: data.uid32, add: false }));
                                    peerListLayout.find(".peer-cards").append(peerCard);
                                })
                        }
                    })

                    peerListLayout.find("#addPeer").click(() => {
                        var addedPeer = false;
                        var loginModel = require("text!./addPeer.html")
                        var model = $(loginModel)
                        model.modal({
                            show: true
                        })
                        model.on("hide.bs.modal", function() {
                            if (addedPeer) loadPeersPage()
                        })
                        model.on("hidden.bs.modal", () => {
                            model.modal("dispose");
                        })

                        var addUsername;
                        model.find("#username").change(function() {
                            addUsername = $(this).val();
                        });

                        model.find("#usercode").change(function() {
                            if (addUsername) {
                                var $$peer;
                                gun.user("@" + addUsername).once(async(data) => {
                                    for (var i in data) {
                                        if (i.indexOf("~") == 0) {
                                            var peerData = await getPeerData(i);
                                            if (peerData && peerData.uid32 && peerData.uid32 == model.find("#usercode").val()) {
                                                $$peer = peerData;
                                                break;
                                            }
                                        }
                                    }
                                    if ($$peer) {

                                        var peerCard = $(await imports.app.layout.ejs.render(require("text!./peer-card.html"), { bio: "", profileImage:$$peer.profileImage, alias: $$peer.alias, pub: $$peer.pub, uid32: data.uid32, add: true }, { async: true }));
                                        model.find("#results").html(peerCard)
                                        model.find("#results").show();

                                        model.find("#results").find(".btn").click(() => {
                                            _self.addPeer($$peer.pub, (err, added) => {
                                                if (!err && added) {
                                                    console.log("added peer")
                                                    addedPeer = true;
                                                    model.modal('hide');
                                                }
                                            })
                                            // if (imports.gun.user().is) {
                                            //     imports.gun.user().get("profile").get("peers").set($$peer.pub, () => {
                                            //         console.log("added peer")
                                            //         addedPeer = true;
                                            //         model.modal('hide');
                                            //     })
                                            // }
                                        })
                                    }

                                });
                                // imports.user.getUser(addUsername, function(err, res, user) {

                                //     console.log(res, user)

                                // })
                            }
                        });
                    })
                }
            });
        }

        function loadPeerProfile(query) {
            query = query.split("@");
            imports.user.getUser(query[1], query[0], async function(err, $user, user) {

                $user.profile = await user.get('profile');

                var profileLayout = await imports.app.layout.ejs.render(require("text!./viewPeer.html"), {
                    user: $user,
                }, { async: true })


                $("#main-container").html(profileLayout)

            })
        }

        register(null, {
            peer: _self = {
                init: function() {

                    imports.app.on("login", function() {
                        $("#navbar-nav-right").prepend(
                            imports.app.layout.ejs.render('<li class="nav-item active" id="peers_btn"><a class="nav-link" href="#peers"><%= title %><span class="sr-only"></span></a></li>', { title: "Peers" })
                        );
                    });
                    imports.state.$hash.on("peers", function() {
                        loadPeersPage();
                    });
                    imports.state.$hash.on("peer", function(query) {
                        loadPeerProfile(query);
                    });
                },
                addPeer: function(pub, callback) {
                    if (imports.gun.user().is) {
                        getPeerData("~" + pub).then(function(data) {
                            if (!data.err)
                                imports.gun.user().get("profile").get("peers").set(data, (res) => {
                                    if (!res.err) {
                                        console.log("added peer")
                                        callback(null, true)
                                    }
                                    else callback(res.err)
                                })
                            else callback(data)
                        })
                        return;
                        
                    }
                },
                removeFriend: function() {},
                listFriends: function() {}
            }
        });

    }

});