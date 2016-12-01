//noinspection SpellCheckingInspection
/**
 * Lofte is a Promise polyfill
 *
 * The function onCancel takes a function that runs when the promise is canceled
 *
 * @param {function(resolve, reject, onCancel, notify)} resolver
 * @returns {Lofte}
 * @public
 * @constructor
 */
function Lofte(resolver) {
    /**
     * @callback onResolved
     * @param [result]
     */
    /**
     * @callback onRejected
     * @param [reason]
     */
    /**
     * @callback onNotify
     * @param [value]
     */

    // 0 = pending, 1 = resolved, 2 = rejected, 3 = fulfilled, 4 = canceled
    /**
     *
     * @type {Number}
     */
    var state = 0
    /**
     * @type {*}
     */
    var value
    /**
     * @typedef {Object} Handler
     * @property {onResolved} onResolved
     * @property {onRejected} onRejected
     * @property {Function} resolve
     * @property {Function} reject
     */
    /**
     *
     * @type {Handler[]}
     */
    var handlers = []
    /**
     *
     * @type {Function[]}
     */
    var listeners = []
    var cancellationFunction = function () {}

    /**
     * Resole the promise with a value.
     *
     * @param {*} [newValue]
     * @returns {*}
     * @public
     */
    function resolve(newValue) {
        try {
            if (newValue && typeof newValue.then === 'function')
                return newValue.then(resolve, reject)
            state = 1
            value = newValue
            handlers.forEach(handle)
            handlers = []
        } catch (e) {
            reject(e)
        }
    }

    /**
     * Reject the promise with a error/reason
     *
     * @param {Error|String} [reason]
     * @returns {void}
     * @public
     */
    function reject(reason) {
        state = 2
        value = reason
        handlers.forEach(handle)
        handlers = []
    }

    function notify(value) {
        try {
            for (var i = 0, listener = listeners[i]; i < listeners.length; i++, listener = listeners[i])
                listener(value)
        } catch (error) {
            reject(error)
        }
    }

    /**
     * Specify the function called when the Promise is canceled.
     * If this is not called then the Promise is not cancellable.
     *
     * @param {Function} fn - The function called upon Promise cancellation
     * @returns {void}
     * @public
     */
    function onCancel(fn) {
        cancellationFunction = fn
    }

    /**
     * The central handler
     *
     * @param {Handler} handler
     */
    function handle(handler) {
        if (state === 0) {
            handlers.push(handler)
        } else {
            var fnHandler = state === 1 ? handler.onResolved : state === 2 ? handler.onRejected : undefined
            if (typeof fnHandler === 'function') {
                try {
                    return handler.resolve(fnHandler(value))
                } catch (ex) {
                    return handler.reject(ex)
                }
            }
            if (state === 1)
                return handler.resolve(value)
            if (state === 2)
                return handler.reject(value)
        }
    }

    //noinspection SpellCheckingInspection
    /**
     * Resolve what to do with the value
     *
     * @param {onResolved} [onResolved]
     * @param {onRejected} [onRejected]
     * @returns {Lofte}
     */
    this.then = function (onResolved, onRejected) {
        return new Lofte(function (resolve, reject) {
            if (typeof process !== 'undefined')
                process.nextTick(run)
            else
                setTimeout(run, 0)
            function run() {
                handle({
                    onResolved: onResolved,
                    onRejected: onRejected,
                    resolve: resolve,
                    reject: reject
                })
            }
        })
    }
    //noinspection SpellCheckingInspection
    /**
     * Can be useful for error handling in your Promise
     * composition.
     *
     * @param {onRejected} [onRejected]
     * @returns {Lofte}
     * @public
     */
    this.catch = function (onRejected) {
        return this.then(undefined, onRejected)
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * NOT STANDARD
     *
     * If the promise is pending
     *
     * @returns {Boolean}
     * @public
     */
    this.isPending = function () {
        return state == 0
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * NOT STANDARD
     *
     * If the promise has resolved
     *
     * @returns {Boolean}
     * @public
     */
    this.isResolved = function () {
        return state == 1
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * NOT STANDARD
     *
     * If the promise has rejected
     *
     * @returns {Boolean}
     * @public
     */
    this.isRejected = function () {
        return state == 2
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * NOT STANDARD
     *
     * If the promise has fulfilled
     *
     * @returns {Boolean}
     * @public
     */
    this.isFulfilled = function () {
        return state == 3
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * NOT STANDARD
     *
     * If the promise has resolved
     *
     * @returns {Boolean}
     * @public
     */
    this.isCanceled = function () {
        return state == 4
    }
    //noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    /**
     * Get progression notifications
     *
     * @param {Function} handler
     * @returns {Lofte}
     */
    this.progress = function (handler) {
        if (typeof handler === 'function')
            listeners.push(handler)
        return this
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * NOT STANDARD
     * Do not expect this to work in other Promise libraries.
     *
     * Cancels the promise if it is cancelable
     *
     * @returns {void}
     * @throws {ReferenceError} If the promise is not cancelable
     * @public
     */
    this.cancel = function() {
        cancellationFunction()
        state = 4
    }
    /**
     * NOT STANDARD
     * Do not expect this to work in other Promise libraries.
     *
     * Make a callback from the promise.
     *
     * @param {callback} cb
     * @param {*} [ctx]
     * @returns {void}
     * @public
     */
    this.callback = function (cb, ctx) {
        this.then(function (value) {
            cb.call(ctx, null, value)
        }).catch(function (reason) {
            cb.call(ctx, reason)
        })
    }
    //noinspection JSUnusedGlobalSymbols,SpellCheckingInspection
    /**
     * NOT STANDARD
     * Do not expect this to work in other Promise libraries.
     *
     * Delay the execution by x amount of milliseconds.
     *
     * @param {Number} ms
     * @returns {Lofte}
     * @public
     */
    this.delay = function (ms) {
        return new Lofte(function (resolve) {
            setTimeout(function () {
                resolve(this)
            }, ms)
        })
    }

    resolver(resolve, reject, onCancel, notify)
}

//noinspection SpellCheckingInspection
/**
 * Returns a Lofte that is resolved.
 *
 * @param {*|Lofte} [value]
 * @returns {Lofte}
 * @since 1.0
 * @public
 * @static
 */
Lofte.resolve = function (value) {
    return new Lofte(function (resolve) {
        resolve(value)
    })
}
//noinspection SpellCheckingInspection
/**
 * Returns a Lofte that is rejected. For debugging purposes
 * and selective error catching, it is useful to make reason
 * an instanceof {@see Error}.
 *
 * @param {Error|String|*} [reason]
 * @returns {Lofte}
 * @since 1.0
 * @public
 * @static
 */
Lofte.reject = function (reason) {
    return new Lofte(function (resolve, reject) {
        reject(reason)
    })
}
//noinspection SpellCheckingInspection,JSValidateJSDoc
/**
 * Lofte.all passes an array of values from
 * all the promises in the array object that it was
 * passed. The array of values maintains the order of the
 * original iterable object, not the order that the
 * promises were resolved in. If something passed in the
 * iterable array is not a promise, it's converted to one
 * by {@see Lofte.resolve}.
 *
 * If any of the passed in promises rejects, the all
 * Lofte immediately rejects with the value of the
 * promise that rejected, discarding all the other promises
 * whether or not they have resolved. If an empty array is
 * passed, then this method resolves immediately.
 *
 * @param {Array<Lofte|*>|Generator|Function|Iterator} iterable
 * @returns {Lofte}
 * @public
 * @static
 */
Lofte.all = function (iterable) {
    return new Lofte(function (resolve, reject) {
        var each = (function () {
            function res(value) {
                values[this] = value
                resolved.push(this)
                if (resolved.length === idx)
                    resolve(values)
            }
            return function (value) {
                //noinspection JSCheckFunctionSignatures
                Lofte.resolve(value).then(res.bind(idx++)).catch(reject)
            }
        })()
        var values = [], resolved = []
        var idx = 0

        //noinspection JSUnresolvedVariable
        if (typeof iterable === 'function' && typeof iterable().next === 'function' || typeof iterable.next === 'function') {
            //noinspection JSUnresolvedVariable
            var iterator = typeof iterable.next === 'function' ? iterable : iterable()
            var iteration
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            while (!(iteration = iterator.next()).done)
                each(iteration.value)
        } else if ('length' in iterable && iterable.length > 0)
            for (var i = 0; i < iterable.length; i++)
                each(iterable[i])
        else resolve()
    })
}
//noinspection JSValidateJSDoc,SpellCheckingInspection
/**
 * The race function returns a Lofte that is settled
 * the same way as the first passed water stream to settle.
 * It resolves or rejects, whichever happens first.
 *
 * @param {Array<Lofte|*>|Generator|Function|Iterator} iterable
 * @returns {Lofte}
 * @since 1.0
 * @public
 * @static
 */
Lofte.race = function (iterable) {
    return new Lofte(function (resolve, reject) {
        //noinspection JSValidateTypes,JSUnresolvedVariable
        if (typeof iterable === 'function' && typeof iterable().next === 'function' || typeof iterable.next === 'function') {
            //noinspection JSValidateTypes,JSUnresolvedVariable
            var iterator = typeof iterable.next === 'function' ? iterable : iterable()
            var iteration
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            while (!(iteration = iterator.next()).done)
                each(iteration.value)
        } else if ('length' in iterable && iterable.length > 0)
            for (var i = 0; i < iterable.length; i++)
                each(iterable[i])
        else resolve()
        function each(value) {
            //noinspection JSCheckFunctionSignatures
            Lofte.resolve(value).then(resolve).catch(reject)
        }
    })
}

//noinspection SpellCheckingInspection
/**
 * NOT STANDARD
 *
 * Make a function return a promise.
 *
 * Useful for callback functions
 *
 * @param {Function} fn
 * @param {Number} [argumentCount] - The amount of parameters the function will have
 * @param {Boolean} [hasErrorPar=true] - If the callback has error in callback
 * @returns {Function}
 * @public
 */
Lofte.promisify = function (fn, argumentCount, hasErrorPar) {
    argumentCount = argumentCount || Infinity
    hasErrorPar = hasErrorPar || true
    return function () {
        const self = this
        const args = Array.prototype.slice.call(arguments)
        return new Lofte(function (resolve, reject) {
            while (args.length && args.length > argumentCount) args.pop()
            args.push(function (err, res) {
                if (!hasErrorPar)//noinspection JSUnresolvedFunction
                    resolve.apply(Array.prototype.slice.call(arguments))
                else if (err) reject(err)
                else resolve(res)
            })
            var result = fn.apply(self, args)
            if (result) resolve(result)
        })
    }
}
//noinspection SpellCheckingInspection,JSValidateJSDoc
/**
 * NOT STANDARD
 *
 * Make asynchronous code look like synchronous with es6 generators.
 * Pass arguments the the first execution of the
 * generator after the first parameter.
 *
 * @param {Generator|Function} generator
 * @returns {Lofte}
 * @public
 */
Lofte.flow = function (generator) {
    var args = Array.prototype.splice.call(arguments, 1)
    if (typeof generator === 'function') //noinspection JSUnresolvedFunction
        generator = generator.apply(this, args)
    var iterate = function (iteration) {
        //noinspection JSUnresolvedVariable
        if (iteration.done) return Lofte.resolve(iteration.value)
        return Lofte[Array.isArray(iteration.value) ? 'all' : 'resolve'](iteration.value)
            .then(exec.bind('next'))
            .catch(exec.bind('throw'))
    }
    function exec(val) {
        return iterate(generator[this](val))
    }
    //noinspection JSUnresolvedFunction
    return iterate(generator.next())
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Lofte
else//noinspection JSUnresolvedVariable
if (typeof define === 'function' && define.amd) //noinspection JSUnresolvedFunction,JSCheckFunctionSignatures,SpellCheckingInspection
    define('Lofte', [], function () {
        return Lofte
    })
else window.Lofte = Lofte
