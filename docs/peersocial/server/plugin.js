define(function($require, exports, module) {

    var fs = require('fs');
    var path = require("path");
    var http = require('http');
    var https = require('https');

    appPlugin.consumes = ["app"];
    appPlugin.provides = ["server", "gun", "express"];

    var Gun = require('gun');

    require('gun/axe'); // is there a GUN BUG with this?
    // require('gun/lib/webrtc');
    require("gun/sea");

    var express = require('express');

    function genHTTPS() {
        var forge = require('node-forge');
        forge.options.usePureJavaScript = true;

        var pki = forge.pki;
        var keys = pki.rsa.generateKeyPair(2048);
        var privKey = forge.pki.privateKeyToPem(keys.privateKey);


        var cert = pki.createCertificate();
        cert.publicKey = keys.publicKey;
        cert.serialNumber = '01';
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
        var attrs = [{
            name: 'commonName',
            value: 'localhost'
        }, {
            name: 'countryName',
            value: 'US'
        }, {
            shortName: 'ST',
            value: 'EARTH'
        }, {
            name: 'localityName',
            value: new Date().getTime().toString()
        }, {
            name: 'organizationName',
            value: 'localhost'
        }, {
            shortName: 'OU',
            value: 'localhost'
        }];
        cert.setSubject(attrs);
        cert.setIssuer(attrs);
        cert.setExtensions([{
            name: 'basicConstraints',
            cA: true
        }, {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        }, {
            name: 'extKeyUsage',
            serverAuth: true,
            clientAuth: true,
            codeSigning: true,
            emailProtection: true,
            timeStamping: true
        }, {
            name: 'nsCertType',
            client: true,
            server: true,
            email: true,
            objsign: true,
            sslCA: true,
            emailCA: true,
            objCA: true
        }, {
            name: 'subjectAltName',
            altNames: [{
                type: 6, // URI
                value: 'https://localhost/'
            }, {
                type: 7, // IP
                ip: '127.0.0.1'
            }]
        }, {
            name: 'subjectKeyIdentifier'
        }]);

        // self-sign certificate
        cert.sign(keys.privateKey);
        var pubKey = pki.certificateToPem(cert);

        return {
            key: privKey,
            cert: pubKey
        };

    }

    return appPlugin;

    function appPlugin(options, imports, register) {


        var port = process.env.PORT || 8766;

        // Gun.log = console.log;
        // Gun.log.once = console.log;


        var casheControl = process.env.HTTP_MAXAGE || 0; //1000 * 60 * 60;
        //var https = require('https');

        var express_app = express();

        express_app.use("/gun", express.static(require('path').dirname(require.resolve("gun")), { maxAge: casheControl }));
        express_app.use(express.static(require("path").join(__dirname, '../../../docs'), { maxAge: casheControl }));
        express_app.use(Gun.serve);

        var http_options = {};

        var use_https = false;
        if (fs.existsSync(path.resolve('./', './ssl-cert/server.key'))) {
            use_https = true;
            console.log("HTTPS enabled");
            http_options.key = fs.readFileSync(path.resolve('./', './ssl-cert/server.key'));
            http_options.cert = fs.readFileSync(path.resolve('./', './ssl-cert/server.cert'));
        }
        else if (process.env.GEN_HTTPS) {
            use_https = true;
            var cert = genHTTPS();
            console.log("GEN_HTTPS:HTTPS enabled");
            http_options.key = cert.key;
            http_options.cert = cert.cert;
        }


        var server = (use_https ? https : http).createServer(http_options, express_app);


        var gunOptions = {
            peers: ["https://www.peersocial.io/gun", "https://dev.peersocial.io/gun"],
            file: 'radata',
            web: server,
            // super: false,
            stats: true
        };

        if (process.env.ISMASTERPEER || process.env.ISMASTERDEV) {
            gunOptions = {
                peers: [],
                file: 'radata',
                web: server,
                super: true,
                stats: true
            };
            if (process.env.ISMASTERDEV) {
                gunOptions.peers.push("https://www.peersocial.io/gun");
            }
            else {
                gunOptions.peers.push("https://dev.peersocial.io/gun");
            }
        }
        var gun = Gun(gunOptions);
        gun.SEA = Gun.SEA;
        global.gun = gun;

        var io = require('socket.io')(http);

        io.on('connection', function(socket) {
            console.log("socket.io connection");
        });
        if (process.env.ISMASTERPEER) {}
        else {
            // var mesh = gun.back('opt.mesh'); // DAM;
            // mesh.say({ dam: 'opt', opt: { peers: 'https://www.peersocial.io/gun' } });
        }
        // require("../../server_api/gunfs/gunfs.js")(gun, app);


        server.express_app = express_app;

        var bodyParser = require('body-parser');
        express_app.use(bodyParser.json());
        express_app.use(bodyParser.urlencoded({ extended: true }));

        // console.log('Server started on port ' + port + ' with /gun');
        server.init = function() {

            server.listen(port, function() {
                console.log('Server started on port ' + port + ' with /gun');

                express_app.use(function(req, res, next) {
                    res.sendFile(require("path").join(__dirname, '../../../docs', 'index.html'));
                });
            });
            
            imports.app.on("start", function() {



            });

        };

        register(null, {
            gun: gun,
            server: server,
            express: express
        });

    }

});