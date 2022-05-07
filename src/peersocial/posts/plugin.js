define(function(require, exports, module) {
    /* global $ */
    appPlugin.consumes = ["app", "user", "gun", "state", "user", "profile", "layout"];
    appPlugin.provides = ["posts"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        var {
            app,
            layout,
            user,
            gun,
            state,
            user,
            profile
        } = imports;

        var login = user.login;

        var {
            SEA,
            Gun
        } = gun;

        var _self;

        register(null, {
            posts: _self = {
                init: function() {
                    imports.state.$hash.on("/posts", function(args, currentState, lastState, onDestroy) {
                        if (args.length == 0) {
                            loadPostFeed(false, onDestroy);
                        }
                        else {
                            loadPostFeed(args[0], onDestroy);
                        }
                    });

                }
            }
        });


        function loadPostFeed($pub, onDestroy) {
            var act = {};

            act.a = () => {
                if(login.user)
                    act.b("~"+login.user().is.pub);
                else act.z();
            };

            act.b = (pub) => {
                user.getUser(pub, false, function(err, userData, user, isMe) {
                    if (err) console.log(err);
                    profile.load(user, function(profile) {
                        var profileLayout = $(imports.app.layout.ejs.render(require("./post_feed.html"), {
                            userData: userData,
                            isMe:isMe,
                            profile: profile
                        }));
                        $("#main-container").html(profileLayout);

                        var posts = [];
                        user().get("test_posts").once(function($posts) {
                            var count = 0;
                            var recCount = 0;
                            for (var i in $posts) {
                                if (i != "_" && i != "#" && $posts[i] && !$posts[i]['#'])
                                    count += 1;
                            }
                            for (var i in $posts) {
                                if (i != "_" && i != "#" && $posts[i] && !$posts[i]['#']) {
                                    (function(hash,timestamp){
                                    user().get("test_posts#").get(hash).once(async ($post, hash) => {
                                        if ($post) {
                                            var post = await SEA.verify($post, userData.pub);
                                            post.timestamp = timestamp;
                                            if (post)
                                                posts.push(post);
                                        }
                                        recCount += 1;
                                        if (count == recCount)
                                            act.c(posts, profileLayout, userData, profile);
                                    });
                                    })($posts[i], $posts._[">"][i] );
                                }

                            }
                        });

                    });
                });
            };

            act.c = (posts, profileLayout, userData, profile) => {
                var feedCleared = false;
                
                for (var i in posts) {
                    if(!posts[i].data) continue;
                    
                    var post_view_message = imports.app.layout.ejs.render(require("./post_view_message.html"), {
                        post: posts[i]
                    });

                    if(!feedCleared){
                        profileLayout.find("#post_feed").html("");
                        feedCleared = true;
                    }
                    profileLayout.find("#post_feed").prepend(post_view_message);
                    profileLayout.find("#type_message_input").focus();
                }
            };
            
            act.z = ()=>{//fail
                
            };

            if (!$pub) {
                act.a();
            }
            else {
                switch ($pub) {
                    case 'new':
                        user.me(function(err, me, $user) {
                            if (err) return;

                            var model = layout.modal(require("./post_box.html"));


                            model.find("#post_message").click(async() => {
                                // alert("posting");
                                var message = model.find("#type_message_input").val();

                                message = await SEA.sign({
                                    type: "message",
                                    data: message
                                    // , timestamp: new Date().getTime()
                                }, login.user()._.sea);

                                SEA.work(message, null, function(hash) {
                                    $user().get("test_posts#").get(hash).put(message, function() {
                                        $user().get("test_posts").set(hash, function(data, key) {
                                            console.log("test_posts", data, key);
                                            model.close(true);
                                        });
                                    });

                                }, { name: "SHA-256" });


                            });

                            onDestroy(function() {
                                model.close();
                            });
                        });
                        break;

                    default:
                         act.b($pub);
                }
            }

        }

        function createPost() {


            let message = { text: 'hello' };
            let userPub = gun.user().is.pub;

            // Logged in user writes a message in his signed graph. Notice, it should be an object in order to have a soul
            gun.user().get('messages').set(message).on(async(data, key) => {
                let soul = Gun.node.soul(data);
                let hash = await SEA.work(soul, null, null, { name: 'SHA-256' });
                gun.get('#messages').get(userPub + '#' + hash).put(soul); // User puts a hashed soul of the message in a public content-addressed node
            });
            // then anyone can list messages of a particular userPub right from the private graph
            gun.get('#messages').get({ '.': { '*': userPub } }).map().once(soul => {
                gun.user(userPub).get('messages').get(soul).once(d => {
                    console.log(d); // 'hello world!', true
                });
            });

        }

    }
});