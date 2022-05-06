define(function(require, exports, module) {
    /* global $ ace */
    appPlugin.consumes = ["app", "gun", "state", "profile", "user", "gunfs"];
    appPlugin.provides = ["peerapp_v2"];

    var Showdown = require("../lib/showdown.min");

    var peer_profile_key = "profile";
    var peerApps_v2_key = "peerapps_v2";

    var ace_editor_window;
    var ace_editor_$editor;

    var editor_options = {
        save: noop,
        run: noop,
    }

    function noop() {}

    var appLoader = require("./appLoader");

    return appPlugin;

    function appPlugin(options, imports, register) {
        var GunFS = imports.gunfs;

        function mime(filename) {
            var ext = filename.split('.').pop();
            var prefix = "ace/mode/";

            if (!ext) {
                return prefix + "text";
            }

            switch (ext) {
                case "js":
                    return prefix + "javascript";
                case "json":
                    return prefix + "json";
                case "md":
                    return prefix + "markdown";
                case "html":
                    return prefix + "html";
            }
        }
        
        function deleteConfirm(text, done){
            var model = $(require("./delete_confirm.html"));
            model.find("#delete_text").text(text)
            var confirmed = false;
            model.modal({
                show: true
            });
            
            model.on("hide.bs.modal", function() {});
            model.on("hidden.bs.modal", () => {
                model.modal("dispose");
                done(confirmed)
            });

            model.find("#create").click(async() => {
                confirmed = true;
                model.modal("hide");
            });
        }

        var reload;

        function load_aceWindow(query, $editor_options, value, readOnly) {
            reload = true;
            if (ace_editor_window) {
                // ace_editor_$editor.destroy();
                // ace_editor_window = false;
            }
            if (!ace_editor_window) {
                ace_editor_window = $(imports.app.layout.ejs.render(require("./ace_editor.html"), {
                    editorBody:value
                }));

                $("#main-container").html(ace_editor_window);

                ace_editor_$editor = ace.edit("editor");

                ace_editor_$editor.setOptions({
                    minLines: 16,
                    maxLines: 52
                });

                ace_editor_$editor.session.on('change', function(delta) {

                    if (!reload) {
                        ace_editor_window.find("#editor").parent().removeClass("border-primary").addClass("border-danger");
                    }
                });
                // editor.setTheme("ace/theme/twilight");
                ace_editor_$editor.commands.addCommand({
                    name: 'save',
                    bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
                    exec: function(editor) {
                        editor_options.save(editor.getValue());
                        ace_editor_window.find("#editor").parent().removeClass("border-danger").addClass("border-primary");
                    },
                    readOnly: false // false if this command should not apply in readOnly mode
                });
                ace_editor_$editor.commands.addCommand({
                    name: 'run',
                    bindKey: { win: 'F5', mac: 'F5' },
                    exec: function(editor) {
                        editor_options.run();
                    },
                    readOnly: false // false if this command should not apply in readOnly mode
                });
                
                ace_editor_$editor.commands.addCommand(ace.require("ace/ext/beautify").commands[0]);
                
                if(!readOnly){
                    var bottomBar = $("<div/>");
                    $("#main-container").find("#editor").parent().append(bottomBar)
                    
                    var SettingsMenu = new ace.require("ace/ext/settings_menu")
                    
                    SettingsMenu.init();
                    
                    var KeyBindingMenu = new ace.require("ace/ext/keybinding_menu")
                    
                    KeyBindingMenu.init(ace_editor_$editor);
                    
                    //ace_editor_$editor.showKeyboardShortcuts()
                    
                    //var optionsPanel = new OptionPanel(ace_editor_$editor)
                    //bottomBar.append(optionsPanel.container)
                    //optionsPanel.render()
                    
                    bottomBar.append((function(){
                        var $openSettings = $(" <a href='#'>&nbsp;Editor Settings&nbsp;</a> ")
                        $openSettings.click(() => ace_editor_$editor.showSettingsMenu());
                        return $openSettings;
                    })())
                    
                    bottomBar.append((function(){
                        var $openSettings = $(" <a href='#'>&nbsp;Keyboad-Shortcuts&nbsp;</a> ")
                        $openSettings.click(() => ace_editor_$editor.showKeyboardShortcuts());
                        return $openSettings;
                    })())
                    new ace.require("ace/ext/statusbar").StatusBar(ace_editor_$editor,bottomBar[0])
                    
                }
                window.myAce = ace_editor_$editor;
            }
            else {
                $("#main-container").html(ace_editor_window);
                //ace_editor_$editor.setValue(value);
            }

            ace_editor_window.find("#runApp").unbind();
            ace_editor_window.find("#runApp").click(() => {
                editor_options.run();
            });

            ace_editor_window.find("#editor").parent().removeClass("border-danger").addClass("border-primary");


            ace_editor_window.find("#saveApp").unbind();
            ace_editor_window.find("#saveApp").click(() => {
                editor_options.save(ace_editor_$editor.getValue());
                ace_editor_window.find("#editor").parent().removeClass("border-danger").addClass("border-primary");
            })

            ace_editor_$editor.session.setMode(mime(query.url));

            if ($editor_options.save)
                editor_options.save = $editor_options.save;
            //else editor_options.save = noop;

            if ($editor_options.run)
                editor_options.run = $editor_options.run;
            //else editor_options.run = noop;

            //if(value)
            
            setTimeout(function() {
                reload = false;
            }, 100)

            if (readOnly) {
                ace_editor_$editor.setReadOnly(true);
                ace_editor_window.find("#saveApp").hide();
            }
            else {
                ace_editor_$editor.setReadOnly(false);
                ace_editor_window.find("#saveApp").show();
            }

            if (mime(query.url) != "ace/mode/javascript") {
                ace_editor_window.find("#runApp").hide();
                editor_options.run = noop;
            }else{
                ace_editor_window.find("#runApp").show();
            }
            
            ace_editor_window.find("#navmenu").html("")
            var lioop= query.query.split("/").filter(function (el) { return el != ""; });
            var id = lioop[0].split("~")[0];
            lioop[0] = lioop[0].split("~")[1];
            lioop = [id].concat(lioop)
            var linkUp;
            for (var i = 0; i < lioop.length; i++) { 
                var isActive = (lioop.length-1 == i ? true : false)
                
                if(i == 0){
                    linkUp = "/peer~"
                }else if(i == 1){
                    linkUp = "/peerapp2-open~"+lioop[0]+"~"
                }
                
                linkUp += lioop[i]+(i == 0 ? "" : "/")
                
                if(!isActive){
                    $(`<li class="breadcrumb-item"><a href="${linkUp}">${lioop[i]}</a></li>`).appendTo(ace_editor_window.find("#navmenu"));
                }else{ 
                    $(`<li class="breadcrumb-item active">${lioop[i]}</li>`).appendTo(ace_editor_window.find("#navmenu"));
                }
            } 

            ace_editor_$editor.gotoLine(0, 0);

        }

        function parse_app_query(query) {
            //1234@alias~test
            var $query = query.split("@");
            var out = {};
            out.query = query;
            out.app_id = $query[1].split("~");
            out.alias = out.app_id[0];
            out.url = out.app_id[1].split("/").filter(function(el) { return el != ""; });
            out.app_id = out.url.shift();
            out.url = "/" + out.url.join("/");
            out.uid = $query[0];
            return out;
        }
        
        register(null, {
            peerapp_v2: {
                init: function() {
                    
                    
                    
                    imports.profile.add_profile_tab(function(query, me, user, profile, profileLayout) {
                        if (query == "peerapp2") {
                            profileLayout.find("#profileTabs").append('<li class="nav-item"><a class="nav-link active" href="/profile~peerapp2">Peerapps</a></li>');
                            
                            imports.app.layout.ejs.render(require("./profile_app_list.html"), {
                                query: query,
                                me: me,
                                user: user,
                                profile: profile
                            }, { async: true }).then(function(profile_app_list){
                                profile_app_list = $(profile_app_list);
                                    
                                

                               profile_app_list.find(".deleteApp2").click((e) => {
                                    var val = $(e.target).data("id");
                                    deleteConfirm("Are you sure you want to delete this app '" + val + "'", function(yes){
                                        if(yes)
                                        user.get(peer_profile_key).get(peerApps_v2_key).get(val).put(null, function() {
                                            imports.state.pushState("/profile~peerapp2");
                                        });
                                    });
                                });
                                var creating = false;
                                profile_app_list.find("#createApp2").click(() => {
                                    if (creating) return;
                                    var createdApp = false;
                                    var model = $(require("../peerapp_v2/createApp.html"));

                                    model.modal({
                                        show: true
                                    });
                                    model.on("hide.bs.modal", function() {
                                        //imports.state.hash = createdApp;
                                    });
                                    model.on("hidden.bs.modal", () => {
                                        model.modal("dispose");

                                        if (createdApp) {
                                            imports.state.pushState("/peerapp2-open~" + me.uid32 + "@" + me.alias + "~" + createdApp + "/");
                                        }
                                    });

                                    model.find("#create").click(async() => {
                                        creating = true;
                                        var name = model.find("#appname").val();
                                        var chain = user.get(peer_profile_key).get(peerApps_v2_key);
                                        
                                        await chain.get(name).put(null);
                                        
                                        await chain.get(name).put({
                                            title: name
                                        });
                                        //, function() {

                                            createdApp = name;
                                            model.modal("hide");

                                        //});
                                    });
                                });
                                
                                profileLayout.find(".tab-content").html(profile_app_list);
                            })
                            
                        }else{
                            profileLayout.find("#profileTabs").append('<li class="nav-item"><a class="nav-link" href="/profile~peerapp2">Peerapps</a></li>');
                        }
            
                    });

                    imports.state.$hash.on("/peerapp2-run", (query) => {

                        var $query = parse_app_query(query);

                        imports.user.getUser($query.alias, $query.uid, function(err, $user, user, isMe) {
                            if (err) return (err);

                            var gunfs = new GunFS(user.get(peer_profile_key).get(peerApps_v2_key).get($query.app_id));
                            
                            appLoader.peerapp(gunfs, $query.url, $query)
                            
                            /*
                            gunfs.stat($query.url, async function(err, stat) {
                                if (err == 404) return console.log("File Not Found");

                                if (stat.mime == "folder") {
                                    
                                }else{
                                    gunfs.readfile($query.url, function(err, file) {
                                        if (err) return (err);
                                        
                                        var appSource = file;
                                        
                                        try {
                                            appLoader.exec(appSource);
                                        }
                                        catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }
                                

                            });
                            */
                        });

                    });


                    imports.state.$hash.on("/peerapp2-open", async(query, currentState, lastHash, onDestroy ) => {
                        onDestroy(()=>{
                            if (ace_editor_window) {
                                ace_editor_$editor.destroy();
                                ace_editor_window = false;
                            }
                        });
                        var $query = parse_app_query(query);

                        imports.user.getUser($query.alias, $query.uid, async function(err, $user, user, isMe) {
                            if (err) return (err);

                            var gunfs = new GunFS(user.get(peer_profile_key).get(peerApps_v2_key).get($query.app_id));
                            gunfs.stat($query.url, function(err, stat) {
                                if (err == 404) return console.log("File Not Found");

                                if (stat.mime == "folder") {
                                    gunfs.readdir($query.url, function(err, list) {
                                        if (err) throw err;
                                        
                                        var $list = [];
                                        for(var i in list){ 
                                            $list.push(list[i]);
                                        }
                                        list = $list;
                                        
                                        list.sort(function(a, b){
                                            if(a.name < b.name) { return -1; }
                                            if(a.name > b.name) { return 1; }
                                            return 0;
                                        });
                                        
                                        list.sort(function(a, b){
                                            if(a.type == "folder") { return -1; }
                                            else{ return 1; }
                                        });
                                        
                                        
                                        var layout = $(imports.app.layout.ejs.render(require("./peerapp_files.html"), {
                                            list: list,
                                            query: $query,
                                            showdown: new Showdown.Converter(),
                                            isMe:isMe
                                        }));
                                        layout.find("#runApp").click(function() {
                                            var filename = $(this).data("file");
                                            
                                            if(filename.indexOf("./") == 0){
                                                filename = filename.replace(/\.\//,'')
                                            } 
                                             
                                            var path = (
                                                [].concat(
                                                        $query.url.split("/"), filename
                                                    )
                                                )
                                                .filter(function (el) { return el != ""; })
                                                .join("/");
                                                
                                            var url = "/peerapp2-run~" + $query.uid + "@" + $query.alias + "~" + $query.app_id+$query.url+path;
                                            imports.state.pushState(url);
                                        });


                                        layout.find("#deleteFile").click(function() {
                                            var filename = $(this).data("file");
                                            var path = "/"+([].concat($query.url.split("/"), filename)).filter(function (el) { return el != ""; }).join("/");
                                            
                                            
                                            deleteConfirm("File '"+$query.uid+"@"+$query.alias+"~"+$query.app_id+path+"'", function(confirmed){
                                                if(confirmed){
                                                    gunfs.rmfile(path, function() {
                                                        imports.state.reload();
                                                    });
                                                }
                                            });
                                        });
                                        layout.find("#createFile").click(() => {
                                            var model = layout.find("#createFileModel");
                                            var created = false;
                                            var createdName;
                                            model.modal({
                                                show: true
                                            });
                                            model.on("hide.bs.modal", function() {});
                                            model.on("hidden.bs.modal", () => {
                                                model.modal("dispose");

                                                if (created) {
                                                    var url = "/peerapp2-open~" + $query.uid + "@" + $query.alias + "~" + $query.app_id + createdName;
                                                    imports.state.pushState(url);
                                                }
                                            });

                                            model.find("#create").click(async() => {

                                                var name = model.find("#filename").val();

                                                if ($query.url.charAt($query.url.length - 1) == "/")
                                                    name = $query.url + name;
                                                else name = $query.url + "/" + name;

                                                gunfs.mkfile(name, "", function(err, list) {
                                                    if (err) throw err;

                                                    createdName = name;
                                                    created = true;
                                                    model.modal("hide");
                                                });
                                            });
                                        });

                                        layout.find("#deleteFolder").click(() => {
                                            var backFolder = $query.url.split("/");
                                                backFolder.pop();
                                                backFolder = backFolder.join("/");


                                            deleteConfirm("Folder '"+$query.uid+"@"+$query.alias+"~"+$query.app_id + $query.url, function(confirmed){
                                                if(confirmed){
                                                            
                                                    gunfs.rmdir($query.url, function() {
                                                        
                                                        var url = "/peerapp2-open~" + $query.uid + "@" + $query.alias + "~" + $query.app_id + backFolder;
                                                        imports.state.pushState(url);
                                                    });
                                                }
                                            });
                                        });
                                        layout.find("#createFolder").click(() => {
                                            var model = layout.find("#createFolderModel");
                                            var created = false;
                                            var createdName;
                                            model.modal({
                                                show: true
                                            });
                                            model.on("hide.bs.modal", function() {});
                                            model.on("hidden.bs.modal", () => {
                                                model.modal("dispose");

                                                if (created) {
                                                    var url = "/peerapp2-open~" + $query.uid + "@" + $query.alias + "~" + $query.app_id + createdName;
                                                    imports.state.pushState(url);
                                                }
                                            });

                                            model.find("#create").click(async() => {

                                                var name = model.find("#foldername").val();

                                                if ($query.url.charAt($query.url.length - 1) == "/")
                                                    name = $query.url + name;
                                                else name = $query.url + "/" + name;

                                                gunfs.mkdir(name, function(err, list) {
                                                    if (err) throw err;

                                                    createdName = name;
                                                    created = true;
                                                    model.modal("hide");

                                                });
                                            });
                                        });


                                        $("#main-container").html(layout);

                                    });
                                }
                                else {
                                    gunfs.readfile($query.url, function(err, file) {

                                        load_aceWindow($query, {
                                            save: function(value) {

                                                gunfs.mkfile($query.url, value, function(err) {
                                                    if (err) throw err;
                                                    console.log("Saved file", $query.url)

                                                });
                                            },
                                            run: function() {
                                                imports.state.pushState("/peerapp2-run~" + $query.uid + "@" + $query.alias + "~" + $query.app_id+$query.url);
                                                //imports.state.hash = "peerapp2-run~" + $query.uid + "@" + $query.alias + "~" + $query.app_id;
                                            }
                                        }, file, isMe ? false : true);

                                    });

                                }
                            });
                        });
                    });

                    imports.app.on("start", function() {
                        
                        
                    });
                }
            }
        });

    }

});