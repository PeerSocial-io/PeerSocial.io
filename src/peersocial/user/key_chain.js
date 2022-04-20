module.exports = function(pwd, extra) {
    var forge = require("node-forge");
    forge.options.usePureJavaScript = true;
    var EC = require('elliptic').ec;

    return new Promise((resolve, reject) => {

        var ec_p256 = new EC('p256');

        if (!pwd)
            pwd = forge.random.getBytesSync(32);

        var privateKey_d = forge.md.sha256.create().update("d").update(pwd); //decrypt key
        var privateKey_s = forge.md.sha256.create().update("s").update(pwd); //sign key

        if (extra) {
            if (extra instanceof String)
                extra = [extra];

            for (let i = 0; i < extra.length; i++) {
                privateKey_s = privateKey_s.update(extra[i]);
                privateKey_d = privateKey_d.update(extra[i]);
            }
        }

        privateKey_s = privateKey_s.digest().toHex();
        privateKey_d = privateKey_d.digest().toHex();

        var keyA_d = ec_p256.keyFromPrivate(privateKey_d, "hex");
        var validation = keyA_d.validate();
        if (validation.reason)
            return reject(validation.reason);

        var keyA_s = ec_p256.keyFromPrivate(privateKey_s, "hex");
        validation = keyA_s.validate();
        if (validation.reason)
            return reject(validation.reason);

        resolve({
            pub: keyBuffer_to_jwk("ECDSA", Buffer.from(keyA_s.getPublic("hex"), "hex")),
            priv: arrayBufToBase64UrlEncode(Buffer.from(privateKey_s, "hex")),
            epub: keyBuffer_to_jwk("ECDH", Buffer.from(keyA_d.getPublic("hex"), "hex")),
            epriv: arrayBufToBase64UrlEncode(Buffer.from(privateKey_d, "hex")),
            // secret: arrayBufToBase64UrlEncode(Buffer.from(keyA_d.derive(keyA_s.getPublic()).toString("hex"), "hex"))
        });
    });

    function arrayBufToBase64UrlEncode(buf) {
        var btoa = require("btoa");
        var binary = '';
        var bytes = new Uint8Array(buf);
        for (var i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary)
            .replace(/\//g, '_')
            .replace(/=/g, '')
            .replace(/\+/g, '-');
    }

    function keyBuffer_to_jwk(type, raw_publicKeyRawBuffer) {
        var key;
        switch (type) {
            case "ECDSA":
            case "ECDH":
                if (raw_publicKeyRawBuffer[0] == 4)
                    key = arrayBufToBase64UrlEncode(raw_publicKeyRawBuffer.slice(1, 33)) + '.' + arrayBufToBase64UrlEncode(raw_publicKeyRawBuffer.slice(33, 66));
                break;
            default:
                key = false;
                break;
        }
        return key;
    }

};