define(function(require, exports, module) {
    /* global $ */
    appPlugin.consumes = ["app", "gun", "state", "profile", "user"];
    appPlugin.provides = ["peerapp"];

    return appPlugin;

    function appPlugin(options, imports, register) {

        function saveApp(id, data) {

            imports.user.me(async function(err, me, user) {
                await user.get('profile').get("peerappsDev").get(id).get("appSource").put(data, function() {
                    console.log("saved app", id)
                })
            })
        }



        register(null, {
            peerapp: {
                init: function() {

                    imports.state.$hash.on("peerapp-test", async(id) => {

                        if (imports.gun.user().is) {
                            imports.user.me(async function(err, me, user) {
                                var appSource = await user.get('profile').get("peerappsDev").get(id).get("appSource");
                                try {
                                    eval(appSource)
                                }
                                catch (e) {
                                    console.log(e)
                                }
                            })
                        }
                    });

                    imports.state.$hash.on("peerapp-edit", async(id) => {

                        if (imports.gun.user().is) {
                            imports.user.me(async function(err, me, user) {


                                var layout = $(await imports.app.layout.ejs.render(require("text!./appEdit.html"), { appSource: await user.get('profile').get("peerappsDev").get(id).get("appSource") }, { async: true }))

                                $("#main-container").html(layout)


                                layout.find("#editor").addClass("border").addClass("border-primary");
                                layout.find("#runApp").click(() => {
                                    imports.state.hash = "peerapp-test~" + id
                                });
                                layout.find("#saveApp").click(() => {
                                    saveApp(id, editor.getValue());
                                    hasChangedAfterSave = false;
                                    layout.find("#editor").removeClass("border-danger").addClass("border-primary");
                                })
                                var hasChangedAfterSave = false;
                                var editor = ace.edit("editor");
                                editor.session.on('change', function(delta) {
                                    hasChangedAfterSave = true;

                                    layout.find("#editor").removeClass("border-primary").addClass("border-danger");
                                });
                                // editor.setTheme("ace/theme/twilight");
                                editor.session.setMode("ace/mode/javascript");
                                editor.commands.addCommand({
                                    name: 'save',
                                    bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
                                    exec: function(editor) {
                                        saveApp(id, editor.getValue());
                                        hasChangedAfterSave = false;
                                        layout.find("#editor").removeClass("border-danger").addClass("border-primary");
                                    },
                                    readOnly: false // false if this command should not apply in readOnly mode
                                });
                                editor.commands.addCommand({
                                    name: 'run',
                                    bindKey: { win: 'F5', mac: 'F5' },
                                    exec: function(editor) {
                                        imports.state.hash = "peerapp-test~" + id
                                    },
                                    readOnly: false // false if this command should not apply in readOnly mode
                                });

                            })
                        }
                    })

                    imports.state.$hash.on("peerapp", function() {
                        if (imports.gun.user().is) {
                            imports.user.me(async function(err, me, user) {
                                //var profileImage = await user.get("profileImage");
                                var peerapps = await user.get('profile').get("peerapps");
                                var peerappsDev = await user.get('profile').get("peerappsDev");
                                console.log(peerappsDev)
                                var layout = $(await imports.app.layout.ejs.render(require("text!./appList.html"), { me: me, user: user, peerapps: peerapps, peerappsDev: peerappsDev }, { async: true }))

                                layout.find("#delete").click(async(e) => {
                                    var val = $(e.target).data("id");
                                    console.log("delete", val);
                                    await user.get('profile').get("peerappsDev").get(val).put(null)
                                    imports.state.hash = "peerapp";
                                })

                                layout.find("#createApp").click(() => {
                                    var createdApp = false;
                                    var model = $(require("text!./createApp.html"));

                                    model.modal({
                                        show: true
                                    })
                                    model.on("hide.bs.modal", function() {
                                        //imports.state.hash = createdApp;
                                    })
                                    model.on("hidden.bs.modal", () => {
                                        model.modal("dispose");
                                    })

                                    model.find("#create").click(async() => {
                                        var name = model.find("#appname").val();
                                        await user.get('profile').get("peerappsDev").get(name).put({
                                            title: name
                                        }, function() {
                                            imports.state.hash = "peerapp";
                                        })
                                        createdApp = name;
                                        model.modal("hide");
                                    })


                                })

                                $("#main-container").html(layout)

                            })
                        }
                    })
                    imports.app.on("start", function() {});
                }
            }
        });

    }

});