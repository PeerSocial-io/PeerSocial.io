module.exports = function(gun) {
    function $gun(last) {
        var self = this;
        if (last) {
            self.last = last;
            self.root = last.root;
        }
        else {
            self.user = function(user) {
                var _user = new $gun();
                _user.graph.push(user);
                _user.user = true;
                Object.defineProperty(_user, 'is', {
                    get() {
                        return gun.user().is;
                    }
                });
                return _user;
            };

            self.root = self;
        }
        var graph = [];
        self.graph = graph;

        return self;
    }

    $gun.prototype.get = function(key) {
        var self = this;

        var next = new $gun(self);
        next.graph = [].concat(self.graph, [key]);
        return next;
    };
    $gun.prototype.cert = function(cert) {
        var self = this;

        self.root._cert = cert;

        return self;
    };

    var chainList = ["put", "on", "once"];

    for (var i in chainList) {
        ((c) => {

            $gun.prototype[c] = function(val, cb, option) {
                var self = this;
                var next;
                if (c == "pub" && self.root._cert) {
                    if (!option) option = {};
                    if (!option.opt) option.opt = {};
                    if (!option.opt.cert) option.opt.cert = self.root._cert;

                }
                for (var i in self.graph) {
                    var n = next || gun;
                    if (i == 0 && self.root.user == true)
                        next = n.user(self.graph[i]);
                    else
                        next = n.get(self.graph[i]);
                }

                return next[c](val, cb, option);
            };

        })(chainList[i]);
    }

    return function() { return new $gun() };
};