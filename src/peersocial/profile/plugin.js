define(function(require, exports, module) {
    /* global $ */
    appPlugin.consumes = ["app", "user", "gun", "state", "user", "layout"];
    appPlugin.provides = ["profile"];

    // var peer_profile_key = "profile";
    // var peer_profile_image_key = "profileImage";

    // var peerApps_key = "peerappsDev";
    // var peerApps_v2_key = "peerapps_v2";

    var profileTabs = [];

    function loadProfileData(user, done) {

        var profile_out = {};

        var act = {};

        act.a = function() {
            var next = act.b;
            user().get("profile").once(function(profile) {
                if (!profile || profile.err) return act.done(profile_out);

                profile_out = profile;

                next();
            });
        };

        act.b = function() {
            var next = act.done;
            user().get("profileImage").once(function(peer_profile_image2) {

                if (!peer_profile_image2) return next();

                profile_out.peer_profile_image = peer_profile_image2;

                next();
            });
        };

        // act.c = function() {
        //     user.get(peer_profile_key).get(peerApps_key).once(function(peer_apps_dev) {
        //         var next = act.d;
        //         if (peer_apps_dev && peer_apps_dev.err) return next();

        //         profile_out.peer_apps_dev = peer_apps_dev;

        //         next();
        //     });
        // };


        // act.d = function() {
        //     user.get(peer_profile_key).get(peerApps_v2_key).once(function(peer_apps) {
        //         var next = act.done;
        //         if (peer_apps && peer_apps.err) return next();

        //         profile_out.peer_apps = peer_apps;

        //         next();
        //     });
        // };

        act.done = function() {
            done(profile_out);
        };

        act.a();

    }

    return appPlugin;

    function appPlugin(options, imports, register) {

        var _self;

        register(null, {
            profile: _self = {
                me: imports.user.me, //carry this over from users plugin 
                init: function() {

                    imports.app.on("login", function() {
                        imports.layout.addNavBar(
                            imports.app.layout.ejs.render('<li class="nav-item active" id="profile_btn"><a class="nav-link" href="/profile"><%= title %><span class="sr-only"></span></a></li>', { title: "Profile" })
                        ); 
                    });

                    function openProfile(query) {
                        if (imports.gun.user().is) {
                            imports.user.me(function(err, me, user) {
                                if (err) console.log(err);
                                //var profileImage = await user.get("profileImage");
                                loadProfileData(user, function(profile) {

                                    if (!profile) profile = {};
                                    
                                    if (me.uid32 && !me.alias)
                                        profile.url = me.uid32 + "@" + me.alias;

                                    imports.app.layout.ejs.render(require("./profile.html"), {
                                        query: query,
                                        me: me,
                                        profile: profile

                                    }, { async: true }).then(function(profileLayout) {
                                        profileLayout = $(profileLayout);

                                        $("#main-container").html(profileLayout);

                                        for (var i in profileTabs) {
                                            profileTabs[i](query, me, user, profile, profileLayout);
                                        }

                                        profileLayout.find(".nav-tabs").find("[href='/profile" + (query == "" ? "" : "~" + query) + "']").addClass("active")

                                        var readURL = function(input) {
                                            if (input.files && input.files[0]) {
                                                var reader = new FileReader();
                                                reader.onload = function(e) {
                                                    $('.avatar').attr('src', e.target.result);
                                                    user().get("profileImage").put(e.target.result, function() {
                                                        console.log("saved profile image");
                                                    });
                                                };
                                                reader.readAsDataURL(input.files[0]);
                                            }
                                        };
                                        $("#main-container").find(".file-upload").on('change', function() {
                                            readURL(this);
                                        });

                                    });


                                });

                            });
                        }
                    }

                    imports.state.$hash.on("profile", openProfile);

                },
                add_profile_tab: function(tab_fn) {
                    profileTabs.push(tab_fn);
                }
            }
        });

        _self.add_profile_tab(function(query, me, user, profile, profileLayout) {
            if (query == "") {
                var basicInfo = $(imports.app.layout.ejs.render(require("./basic_info.html"), {
                    query: query,
                    me: me,
                    user: user(),
                    profile: profile
                }));

                basicInfo.find("#display_name").on('keyup', function() {
                    user().get("profile").get("display_name").put($(this).val(), function() {
                        // console.log("saved profile display_name");
                    });
                });
                user().get("profile").get("display_name").on(function(display_name) {
                    // console.log("update profile display_name", display_name);
                    basicInfo.find("#display_name").val(display_name)
                });

                basicInfo.find("#tagline").on('keyup', function() {
                    user().get("profile").get("tagline").put($(this).val(), function() {
                        // console.log("saved profile tagline");
                    });
                });
                user().get("profile").get("tagline").on(function(tagline) {
                    // console.log("update profile tagline", tagline);
                    basicInfo.find("#tagline").val(tagline)
                });
                profileLayout.find("#profileTabs").append('<li class="nav-item"><a class="nav-link active" href="/profile">Profile</a></li>');
                profileLayout.find(".tab-content").append(basicInfo);
            }
            else {
                profileLayout.find("#profileTabs").append('<li class="nav-item"><a class="nav-link" href="/profile">Profile</a></li>');
            }

        });
    }

});