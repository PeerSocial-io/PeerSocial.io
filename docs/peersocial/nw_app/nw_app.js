define(function(require, exports, module) {

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["nw_app"];

    var LightweightCharts = require("../lib/lightweightCharts");

    return appPlugin;

    function appPlugin(options, imports, register) {

        var nw = imports.app;
        window.name = "testing_ID"
        
        var nw_app_core = window.nw_app_core;
        // // console.log(window.nw_app.test())
        // var r = imports.app.nw.require("./nw_app_require.js");
        // r.resolve("./nw_app");

        // var server = r("../server.js");


        // server.start(nw_app_core, console, function() {


        register(null, {
            nw_app: {
                Gun: nw_app_core.Gun,
                gun: nw_app_core.gun,
                init: function() {

                    window.gun = nw_app_core.gun;
                    window.Gun = nw_app_core.Gun;
                    var gun = nw_app_core.gun;

                    if (!nw_app_core.added_initPeers) {
                        nw_app_core.gun._.opt.wire({ url: "https://onlykey.herokuapp.com/gun" });
                        // nw_app_core.gun._.opt.wire({url:"https://www.peersocial.io/gun"});
                        nw_app_core.added_initPeers = true;
                    }
                    imports.app.on("nw-home", function() {

                        $("#navbar-nav-right").hide();
                        $("#app-footer").hide();
                        
                        var chart, areaSeriesData = {
                            line1:[],
                            line2:[],
                            line3:[],
                            line4:[]
                        };
                        
                        imports.app.ejs.render(require("./services.html"), {
                            nw_app_core: nw_app_core
                        }, { async: true }).then(function(pageOutput) {
                            $("#main-container").html(pageOutput);


                            chart = LightweightCharts.createChart($("#main-container").find("#chart")[0], {
                                // width: chartWidth,
                                height: 300,
                                rightPriceScale: {
                                    scaleMargins: {
                                        top: 0.2,
                                        bottom: 0.1,
                                    },
                                },
                                timeScale: {
                                    rightOffset: 2,
                                },
                            });


                            var areaSeries1 = chart.addAreaSeries({
                                lineColor: 'rgba(245, 124, 0, 1)',
                                lineWidth: 2,
                            });

                            var areaSeries2 = chart.addAreaSeries({
                                lineColor: 'rgba(124, 245,  0, 1)',
                                lineWidth: 2,
                            });
                            
                            var areaSeries3 = chart.addAreaSeries({
                                lineColor: 'rgba(0, 245, 124, 1)',
                                lineWidth: 2,
                            });
                            
                            var areaSeries4 = chart.addAreaSeries({
                                lineColor: 'rgba(0, 124, 245, 1)',
                                lineWidth: 2,
                            });

                            // areaSeries.setData([]);
                            
                            var path = require("path");
                        	var __dirname = window.global.__dirname;
                        	var fileName = path.resolve(__dirname, '../radata.stats');
                            var fs = require("fs");
                            
                            
                            setInterval(loadData,15000)
                            loadData();
                            
                            function loadData(){
                                var data = JSON.parse(fs.readFileSync(fileName,"utf8"));
                                
                                var thisTime = data.up.time;
                                
                                areaSeriesData.line1.push({time:thisTime, value: data.dam.in.count })
                                areaSeriesData.line2.push({time:thisTime, value: data.dam.out.count })
                                
                                
                                areaSeriesData.line3.push({time:thisTime, value: data.rad.get.count })
                                areaSeriesData.line4.push({time:thisTime, value: data.rad.put.count })
                                
                                
                                areaSeries1.setData(areaSeriesData.line1);
                                areaSeries2.setData(areaSeriesData.line2);
                                areaSeries3.setData(areaSeriesData.line3);
                                areaSeries4.setData(areaSeriesData.line4);
                                console.log(data)
                            }
                        });



                        setInterval(function() {
                            var content = $("#status-interval");
                            var p = gun._.opt.peers;

                            var output = "";

                            for (var i in p) {
                                if (!p[i].wire) continue;

                                var type = (p[i] instanceof gun._.opt.RTCPeerConnection ? "-RTCPeerConnection" : "");

                                output += (p[i].url ? p[i].url : i) + type + " ";

                                output += "readyState:" + p[i].wire.readyState;
                                output += "<br/>";

                            }

                            content.html(output);
                            // console.log("gun",nw_app_core.gun); 

                        }, 1000)


                        // console.log(server)

                        //console.log("app started", imports.app)

                        // imports.app.state.on("anchorchange",()=>{
                        //     console.log(imports.app.state.hash)
                        // })

                        // setInterval(()=>{
                        //     imports.app.state.hash = Date.now().toString();
                        // },1000)
                    })

                }
            }
        });

        // });
    }

});