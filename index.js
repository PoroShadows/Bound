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
     * @param {*} [result]
     * @returns {(*|void)}
     */
    /**
     * @callback onRejected
     * @param {*} [reason]
     * @returns {(*|void)}
     */
    /**
     * @callback onNotify
     * @param {*} [value]
     * @returns {(*|void)}
     */
    /**
     * @callback resolve
     * @param {*} [result]
     * @returns {(*|void)}
     */
    /**
     * @callback reject
     * @param {*} [reason]
     * @returns {(*|void)}
     */
    /**
     * @callback Callback
     * @param {?*} error
     * @param {?*} value
     */
    /**
     * @typedef {Object} Handler
     * @property {onResolved} onResolved
     * @property {onRejected} onRejected
     * @property {resolve} resolve
     * @property {reject} reject
     */

    // 0 = pending, 1 = resolved, 2 = rejected, 3 = fulfilled, 4 = canceled
    /**
     * The state of the promise.
     *
     * @type {Number}
     */
    var state = 0
    /**
     * The value of the promise.
     *
     * @type {*}
     */
    var value
    /**
     * The stacked handlers that are
     * going to be called when the promise
     * is resolved.
     *
     * @type {Handler[]}
     */
    var handlers = []
    /**
     * Listeners that listens for
     * progression notifications.
     *
     * @type {Function[]}
     */
    var listeners = []
    /**
     * The function called whenever
     * the promise is canceled.
     *
     * @type {Function}
     */
    var cancellationFunction = function () {}

    /**
     * Resole the promise with a value or not
     * your choice.
     *
     * @since 1.0
     * @param {?*} [newValue]
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
     * or not your choice.
     *
     * @since 1.0
     * @param {?(Error|String)} [reason]
     * @returns {void}
     * @public
     */
    function reject(reason) {
        state = 2
        value = reason
        handlers.forEach(handle)
        handlers = []
    }

    /**
     * Send a progression notification.
     * You can call it whatever you want.
     * Notification, progression or both
     * progression notification.
     *
     * @since 1.2
     * @param {?*} value
     * @returns {(*|void)}
     * @public
     */
    function notify(value) {
        try {
            for (var i = 0, listener = listeners[i]; i < listeners.length; i++, listener = listeners[i])
                listener(value)
        } catch (error) {
            reject(error)
        }
    }

    /**
     * Specify the function called when the
     * Promise is canceled. If this is not
     * called then the Promise is not cancellable.
     *
     * @since 1.1
     * @param {Function} fn
     * The function called upon Promise cancellation
     *
     * @returns {void}
     * @public
     */
    function onCancel(fn) {
        cancellationFunction = fn
    }

    /**
     * The central handler for the promise
     *
     * @param {Handler} handler
     * @returns {void}
     * @private
     */
    function handle(handler) {
        if (state === 4)
            return
        if (typeof process !== 'undefined')
            process.nextTick(run)
        else
            setTimeout(run, 0)
        function run() {
            if (state === 0) {
                handlers.push(handler)
            } else {
                var fnHandler = state === 1 ? handler.onResolved : state === 2 ? handler.onRejected : undefined
                if (typeof fnHandler === 'function') {
                    try {
                        //noinspection JSValidateTypes
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
    }

    function arrayLikeFunction(promise, fnName, args) {
        return promise.then(function (value) {
            var arr = Array.isArray(value) ? value : [value]
            arr = Array.prototype[fnName].apply(arr, args)
            return arr.length === 1 ? arr[0] : arr
        })
    }

    //noinspection SpellCheckingInspection
    /**
     * Resolve what to do with the value
     *
     * @since 1.0
     * @api
     * @param {onResolved} [onResolved]
     * @param {onRejected} [onRejected]
     * @returns {Lofte}
     * @public
     */
    this.then = function (onResolved, onRejected) {
        return new Lofte(function (resolve, reject) {
            handle({
                onResolved: onResolved,
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
            })
        })
    }
    //noinspection SpellCheckingInspection
    /**
     * Can be useful for error handling in your Promise
     * composition.
     *
     * @since 1.0
     * @param {onRejected} [onRejected]
     * @returns {Lofte}
     * @public
     */
    this.catch = function (onRejected) {
        return this.then(null, onRejected)
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * If the promise is pending
     *
     * NOT STANDARD FUNCTION
     * @since 1.0
     * @returns {Boolean}
     * @public
     */
    this.isPending = function () {
        return state == 0
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * If the promise has resolved
     *
     * NOT STANDARD FUNCTION
     * @since 1.0
     * @returns {Boolean}
     * @public
     */
    this.isResolved = function () {
        return state == 1
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * If the promise has rejected
     *
     * NOT STANDARD FUNCTION
     * @since 1.0
     * @returns {Boolean}
     * @public
     */
    this.isRejected = function () {
        return state == 2
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * If the promise has fulfilled
     *
     * NOT STANDARD FUNCTION
     * @since 1.0
     * @returns {Boolean}
     * @public
     */
    this.isFulfilled = function () {
        return state == 3
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * If the promise has resolved
     *
     * NOT STANDARD FUNCTION
     * @since 1.1
     * @returns {Boolean}
     * @public
     */
    this.isCanceled = function () {
        return state == 4
    }
    /**
     * Make a callback from the promise.
     *
     * NOT STANDARD FUNCTION
     * @since 1.0
     * @param {Callback} cb
     * @param {*} [ctx]
     * @returns {void}
     * @public
     */
    this.callback = function (cb, ctx) {
        this.then(function (value) {
            cb.call(ctx, null, value)
        }, function (reason) {
            cb.call(ctx, reason)
        })
    }
    //noinspection JSUnusedGlobalSymbols,SpellCheckingInspection
    /**
     * Delay the execution by x amount of milliseconds.
     *
     * NOT STANDARD FUNCTION
     * @since 1.0
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
    //noinspection JSUnusedGlobalSymbols
    /**
     * Cancels the promise
     *
     * NOT STANDARD FUNCTION
     * @since 1.1
     * @returns {void}
     * @throws {ReferenceError} If the promise is not cancelable
     * @public
     */
    this.cancel = function() {
        cancellationFunction()
        state = 4
    }
    //noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    /**
     * Get progression notifications
     *
     * @since 1.2
     * @param {...Function} handler
     * @returns {Lofte}
     * @public
     */
    this.progress = function (handler) {
        for (var i = 0, handle = arguments[i]; i < arguments.length; i++, handler = arguments[i])
            if (typeof handle === 'function')
                listeners.push(handle)
        return this
    }
    //noinspection SpellCheckingInspection
    /**
     * Like normal array reduce.
     *
     * If the current value is not an
     * array (Array.isArray) it wraps
     * the value in a array
     *
     * @since 1.3
     * @param {function(*, *=, number=, Array=)} callback
     * @param {*} [initialValue]
     * @returns {Lofte}
     * @public
     */
    this.reduce = function (callback, initialValue) {
        return arrayLikeFunction(this, 'reduce', [callback, initialValue])
    }
    //noinspection SpellCheckingInspection
    /**
     * Like normal array filter.
     *
     * If the current value is not an
     * array (Array.isArray) it wraps
     * the value in a array
     *
     * @since 1.3
     * @param {function(*=, number=, Array=)} callback
     * @param {*} [thisArg]
     * @return {Lofte}
     * @public
     */
    this.filter = function (callback, thisArg) {
        return arrayLikeFunction(this, 'filter', [callback, thisArg])
    }
    //noinspection SpellCheckingInspection
    /**
     * Like normal array map.
     *
     * If the current value is not an
     * array (Array.isArray) it wraps
     * the value in a array
     *
     * @since 1.3
     * @param {function(*=, number=, Array=)} callback
     * @param {*} [thisArg]
     * @return {Lofte}
     * @public
     */
    this.map = function (callback, thisArg) {
        return arrayLikeFunction(this, 'map', [callback, thisArg])
    }

    try {
        resolver(resolve, reject, onCancel, notify)
    } catch (e) {
        reject(e)
    }
}

//noinspection SpellCheckingInspection
/**
 * Returns a Lofte that is resolved.
 *
 * @param {(*|Lofte)} [value]
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
 * @param {(Error|String|*)} [reason]
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
    return new Lofte(function (resolve, reject, onCancel, notify) {
        var canceled = false
        onCancel(function () {
            canceled = true
        })
        var each = (function () {
            function res(id) {
                return function (value) {
                    if (canceled)
                        return
                    values[id] = value
                    resolved.push(id)
                    notify(value)
                    if (resolved.length === idx)
                        resolve(values)
                }
            }
            return function (value) {
                Lofte.resolve(value).then(res(idx++), reject)
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
            while (!(iteration = iterator.next()).done && !canceled)
                each(iteration.value)
        } else if ('length' in iterable && iterable.length > 0)
            for (var i = 0; i < iterable.length && !canceled; i++)
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
    return new Lofte(function (resolve, reject, onCancel) {
        var canceled = false
        onCancel(function () {
            canceled = true
        })
        var each = (function () {
            function run(fn) {
                return function (value) {
                    if (!canceled)
                        fn(value)
                }
            }

            return function (value) {
                Lofte.resolve(value).then(run(resolve), run(reject))
            }
        })()
        //noinspection JSValidateTypes,JSUnresolvedVariable
        if (typeof iterable === 'function' && typeof iterable().next === 'function' || typeof iterable.next === 'function') {
            //noinspection JSValidateTypes,JSUnresolvedVariable
            var iterator = typeof iterable.next === 'function' ? iterable : iterable()
            var iteration
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            while (!(iteration = iterator.next()).done && !canceled)
                each(iteration.value)
        } else if ('length' in iterable && iterable.length > 0)
            for (var i = 0; i < iterable.length && !canceled; i++)
                each(iterable[i])
        else resolve()
    })
}

//noinspection SpellCheckingInspection
/**
 * Useful for callback functions
 *
 * NOT STANDARD FUNCTION
 * @param {Function} fn
 * @param {Number} [argumentCount] - The amount of parameters the function will have
 * @param {Boolean} [hasErrorPar=true] - If the callback has error in callback
 * @returns {Function}
 * @since 1.0
 * @public
 * @static
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
 * Make asynchronous code look like synchronous with es6 generators.
 * Pass arguments the the first execution of the
 * generator after the first parameter.
 *
 * NOT STANDARD FUNCTION
 * @since 1.0
 * @param {Generator|Function} generator
 * @returns {Lofte}
 * @public
 * @static
 */
Lofte.flow = function (generator) {
    var args = Array.prototype.splice.call(arguments, 1)
    if (typeof generator === 'function') //noinspection JSUnresolvedFunction
        generator = generator.apply(this, args)
    function iterate(iteration) {
        //noinspection JSUnresolvedVariable
        if (iteration.done) return Lofte.resolve(iteration.value)
        var value = iteration.value
        var promise
        if (typeof value.then === 'function')
            promise = value
        else if ((typeof value === 'function' && typeof value().next === 'function' || typeof value.next === 'function') ||
            ('length' in value && value.length > 0 && value.length - 1 in value))
            promise = Lofte.all(value)
        else promise = Lofte.resolve(value)
        return promise.then(exec('next'), exec('throw'))
    }
    function exec(action) {
        return function (value) {
            iterate(generator[action](value))
        }
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
