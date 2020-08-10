define(function(require, exports, module) {

    /*!
     * worky
     * An EventEmitter like interface for web-workers.
     *
     * This module was created by the @jillix developers, with <3 and JS!
     * The code is licensed under the MIT license.
     *
     * Check out the repository on GitHub: https://github.com/jillix/worky
     *
     * */
    (function(root) {

        if (typeof window === "object" && !window.Worker) {
            return alert("This browser does not support web workers.");
        }

        /**
         * EventEmitter
         * Creates a new `EventEmitter` instance. This is exposed via `Worky.EventEmitter`.
         *
         * @name EventEmitter
         * @function
         * @return {EventEmitter} The `EventEmitter` instance.
         */
        function EventEmitter() {
            this._ = {};
        }

        /**
         * _on
         * The core `on` method. By default `on` is the same with `_on`.
         * However, `on` can be rewritten, but `_on` is still the same.
         *
         * @name _on
         * @function
         * @param {String} ev The event name.
         * @param {Function} fn The listener function.
         * @return {EventEmitter} The `EventEmitter` instance.
         */
        EventEmitter.prototype._on = function(ev, fn) {
            var l = this._[ev] = this._[ev] || [];
            l.push(fn);
            return this;
        };

        /**
         * _emit
         * Emits the passed arguments. By default `emit` is the same with `_emit`.
         * However, `emit` can be rewritten, but `_emit` is still the same.
         *
         * Usage:
         *
         * ```js
         * // Using arguments - this is the convenient way
         * worker.emit("eventName", 42, { some: "object" }, "foo");
         *
         * // Internally, this method is used:
         * worker.emit({
         *     event: "eventName"
         *   , args: [42, { some: "object" }, "foo"]
         * });
         * ```
         *
         * @name _emit
         * @function
         * @param {String|Worky.Message} ev The event name or a `Worky.Message` object.
         * @return {EventEmitter} The `EventEmitter` instance.
         */
        EventEmitter.prototype._emit = function(ev) {

            var self = this,
                args = [],
                event = null,
                l = null;

            if (typeof ev === "object") {
                event = ev.event;
                args = ev.args;
            }
            else {
                event = ev;
                args = Array.prototype.slice.call(arguments, 1);
            }

            l = this._[event];
            if (!l || !l.length) { return; }

            l.forEach(function(fn) {
                fn.apply(self, args);
            });

            return this;
        };

        EventEmitter.prototype.on = EventEmitter.prototype._on;
        EventEmitter.prototype.emit = EventEmitter.prototype._emit;

        /**
         * Worky
         * Creates or initializes a web worker. This is inherited from
         * the `EventEmitter` class.
         *
         * Usage:
         *
         * ```js
         * // In the main thread (window)
         * var worker = new Worky("some-worker.js");
         *
         * // In the worker thread (some-worker.js)
         * var worker = new Worky();
         * ```
         *
         * @name Worky
         * @function
         * @param {String|Worker} script The worker script url or the worker object itself.
         * @return {Worky} The `Worky` instance.
         */
        function Worky(script) {

            var self = {};

            if (this.constructor !== Worky && script) {
                return new Worky(script);
            }

            if (!script) {
                self = Object.create(EventEmitter.prototype);
            }
            else {
                self = this;
            }

            EventEmitter.call(self);
            self.is_worker = !script;

            // We are inside of a worker
            if (self.is_worker) {
                root.onmessage = Worky.Receiver.call(self);
                self.emit = Worky.Emitter.call(root);
                return self;
            }

            // Inside of a window, creating a worker
            if (typeof script === "string") {
                self.worker = new Worker(script);
            }
            else {
                self.worker = script;
            }

            self.worker.onmessage = Worky.Receiver.call(self);
            self.emit = Worky.Emitter.call(self.worker);
        }

        // Expose the EventEmitter class
        Worky.EventEmitter = EventEmitter;

        /**
         * Worky.Receiver
         * Creates the `onmessage` handler. This method is used internally.
         *
         * @name Worky.Receiver
         * @function
         * @return {Function} The receiver handler which calls the core `_emit` function.
         */
        Worky.Receiver = function() {
            var self = this;
            return function(ev) {
                self._emit(ev.data);
            };
        };

        /**
         * Worky.Emitter
         * Creates the `emit` handler. This method is used internally.
         *
         * @name Worky.Emitter
         * @function
         * @return {Function} The emitter handler which calls the `postMessage` function.
         */
        Worky.Emitter = function() {
            var self = this;
            return function() {
                var ev = new Worky.Message(arguments);
                self.postMessage(ev);
            };
        };

        /**
         * Worky.Message
         * Creates a new `Message` instance
         *
         * @name Worky.Message
         * @function
         * @param {Arguments} args The arguments pseudo-array.
         * @return {Worky.Message} The `Message` instance containing the following fields:
         *
         *  - `event` (String): The event name.
         *  - `args` (Array): An array of elements representing the event data.
         */
        Worky.Message = function(args) {
            args = Array.prototype.slice.call(args);
            //this._ = args[0];
            this.event = args[0];
            this.args = args.slice(1);
        };

        // Inherit the EventEmitter functions
        Worky.prototype = Object.create(EventEmitter.prototype);
        Worky.prototype.constructor = Worky;


        root.Worky = Worky;
    })(self);


});