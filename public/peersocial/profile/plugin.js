define(function(require, exports, module) {

    appPlugin.consumes = ["app", "user", "gun", "state", "user"];
    appPlugin.provides = ["profile"];

    return appPlugin;

    function appPlugin(options, imports, register) {
        
        var _self;
        
        register(null, {
            profile: _self = {
                me: imports.user.me,//carry this over from users plugin 
                
                
                
                init: function() {
                    
                    imports.app.on("login",function(){
                            
                        $("#navbar-nav-right").prepend(
                            imports.app.layout.ejs.render('<li class="nav-item active" id="profile_btn"><a class="nav-link" href="#profile-settings"><%= title %><span class="sr-only"></span></a></li>', { title: "MyProfile" })
                        )
                        
                    })

                    imports.state.$hash.on("profile-settings", function() {
                        if (imports.gun.user().is) {
                            imports.user.me(async function(err, me, user) {

                                //var profileImage = await user.get("profileImage");
                                var profile = await user.get('profile');
                                
                                var profileLayout = await imports.app.layout.ejs.render(require("text!./profile.html"), { me: me , user:user , profile:profile }, {async : true})


                                $("#main-container").html(profileLayout)


                                var readURL = function(input) {
                                    if (input.files && input.files[0]) {
                                        var reader = new FileReader();
                                        reader.onload = function(e) {
                                            $('.avatar').attr('src', e.target.result);
                                            user.get("profileImage").put(e.target.result, function() {
                                                console.log("saved profile image")
                                            })
                                        }
                                        reader.readAsDataURL(input.files[0]);
                                    }
                                }
                                $("#main-container").find(".file-upload").on('change', function() {
                                    readURL(this);
                                });
                                $("#main-container").find("#first_name").on('change', function() {
                                    user.get("profile").get("first_name").put($(this).val(), function() {
                                        console.log("saved profile first_name")
                                    })
                                });
                                $("#main-container").find("#last_name").on('change', function() {
                                    user.get("profile").get("last_name").put($(this).val(), function() {
                                        console.log("saved profile last_name")
                                    })
                                });
                                $("#main-container").find("#phone").on('change', function() {
                                    user.get("profile").get("phone").put($(this).val(), function() {
                                        console.log("saved profile phone")
                                    })
                                });
                                $("#main-container").find("#mobile").on('change', function() {
                                    user.get("profile").get("mobile").put($(this).val(), function() {
                                        console.log("saved profile mobile")
                                    })
                                });
                                $("#main-container").find("#email").on('change', function() {
                                    user.get("profile").get("email").put($(this).val(), function() {
                                        console.log("saved profile email")
                                    })
                                });
                                $("#main-container").find("#location").on('change', function() {
                                    user.get("profile").get("location").put($(this).val(), function() {
                                        console.log("saved profile location")
                                    })
                                });
                                

                            })
                        }
                    })


                    imports.app.on("start", function() {

                    });

                }
            }
        });

    }

});