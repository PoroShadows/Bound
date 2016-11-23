
/**
 * Bound is a Promise polyfill
 *
 * The function onCancel takes a function that runs when the promise is canceled
 *
 * @param {function(resolve, reject, onCancel)} resolver
 * @returns {Bound}
 * @public
 * @constructor
 */
function Bound(resolver) {
    /**
     * @callback then
     * @param {*} value
     * @returns {*|void}
     */
    /**
     * @callback catch
     * @param {Error|String|*} reason
     * @returns {*|void}
     */
    /**
     * @callback callback
     * @param {(null|Error|String|*)} [error]
     * @param {*} [value]
     */
    var state = 'pending'
    var value
    var deferred
    var cancellationFunction

    //noinspection JSUnusedGlobalSymbols
    /**
     * If the promise has fulfilled
     *
     * @returns {Boolean}
     * @public
     */
    this.isFulfilled = function () {
        return state == 'fulfilled'
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * If the promise is pending
     *
     * @returns {Boolean}
     * @public
     */
    this.isPending = function () {
        return state == 'pending'
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * If the promise has rejected
     *
     * @returns {Boolean}
     * @public
     */
    this.isRejected = function () {
        return state == 'rejected'
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * If the promise has resolved
     *
     * @returns {Boolean}
     * @public
     */
    this.isResolved = function () {
        return state == 'resolved'
    }
    /**
     * Returns if the promise is cancelable
     *
     * @returns {Boolean}
     */
    this.isCancelable = function () {
        return cancellationFunction != undefined
    }

    /**
     * Specify the function called when the promise is canceled.
     * If this is not called then the promise is not cancellable.
     *
     * @param {Function} fn - The function called upon promise cancellation
     * @returns {void}
     * @public
     */
    function onCancel(fn) {
        cancellationFunction = fn
    }

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
            state = 'resolved'
            value = newValue

            if (deferred)
                handle(deferred)
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
        state = 'rejected'
        value = reason

        if (deferred)
            handle(deferred)
    }

    function handle(handler) {
        if (state === 'pending')
            return deferred = handler
        if (typeof process !== 'undefined')
            process.nextTick(exec)
        else
            setTimeout(exec, 1)

        function exec() {
            var isResolved = state === 'resolved',
                handlerFN = isResolved ? handler.onResolved : handler.onRejected

            if (!handlerFN)
                return handler[isResolved ? 'resolve' : 'reject'](value)

            var ret
            try {
                ret = handlerFN(value)
                if (state !== 'fulfilled')
                    handler.resolve(ret)
            } catch (e) {
                if (state !== 'fulfilled')
                    handler.reject(e)
            }
            state = 'fulfilled'
        }
    }

    /**
     * Resolve what to do with the value
     *
     * @param {then} [onResolved]
     * @param {catch} [onRejected]
     * @returns {Bound}
     * @public
     */
    this.then = function (onResolved, onRejected) {
        return new Bound(function (resolve, reject) {
            handle({
                onResolved: onResolved,
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
            })
        })
    }
    /**
     * Can be useful for error handling in your promise
     * composition.
     *
     * The Error type is not a standard parameter!!!
     * Catch only if it is a specific error *.catch(type, onRejected)
     *
     * @param {catch} [onRejected]
     * @returns {Bound}
     * @public
     */
    this.catch = function (onRejected) {
        return new Bound(function (resolve, reject) {
            handle({
                onResolved: undefined,
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
            })
        })
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * NOT STANDARD
     * Do not expect this to work in other Promise libraries.
     *
     * Ensure error catch handles by the onRejected function
     *
     * @param {then} [onResolved]
     * @param {catch} [onRejected]
     * @returns {Bound}
     * @public
     */
    this.try = function (onResolved, onRejected) {
        return this.then(onResolved).catch(onRejected)
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
        if (this.isCancelable()) {
            cancellationFunction()
            state = 'canceled'
        } else console.error(new ReferenceError('Tried to cancel non cancellable promise'))
    }
    function arrayWrapper(fn, ctx, func) {
        var temp = value
        if (!isArray(value))
            temp = [value]
        temp = temp[func](fn, ctx)
        value = isArray(temp) && temp.length == 1 ? temp[0] : temp
        function isArray() {
            return Array.isArray(value) || typeof value === 'object' && 'length' in value && typeof length === 'number' && value.length - 1 in value
        }
    }

    /**
     * NOT STANDARD
     * Do not expect this to work in other Promise libraries.
     *
     * Same as Array.prototype.map
     *
     * @param {Function} fn
     * @param {*} [ctx]
     * @returns {Bound}
     * @public
     */
    this.map = function (fn, ctx) {
        arrayWrapper(fn, ctx, 'map')
        return this
    }
    /**
     * NOT STANDARD
     * Do not expect this to work in other Promise libraries.
     *
     * Same as Array.prototype.reduce
     *
     * @param {Function} fn
     * @param {*} [ctx]
     * @returns {Bound}
     * @public
     */
    this.reduce = function (fn, ctx) {
        arrayWrapper(fn, ctx, 'reduce')
        return this
    }
    /**
     * NOT STANDARD
     * Do not expect this to work in other Promise libraries.
     *
     * Same as Array.prototype.filter
     *
     * @param {Function} fn
     * @param {*} [ctx]
     * @returns {Bound}
     * @public
     */
    this.filter = function (fn, ctx) {
        arrayWrapper(fn, ctx, 'filter')
        return this
    }
    /**
     * NOT STANDARD
     * Do not expect this to work in other Promise libraries.
     *
     * Same as Array.prototype.some
     *
     * @param {Function} fn
     * @param {*} [ctx]
     * @returns {Bound}
     * @public
     */
    this.some = function (fn, ctx) {
        arrayWrapper(fn, ctx, 'some')
        return this
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * NOT STANDARD
     * Do not expect this to work in other Promise libraries.
     *
     * Delay the execution by x amount of milliseconds.
     *
     * @param {Number} ms
     * @returns {Bound}
     * @public
     */
    this.delay = function (ms) {
        return new Bound(function (resolve) {
            setTimeout(function () {
                resolve(this)
            }, ms)
        })
    }

    //noinspection JSCheckFunctionSignatures
    resolver(resolve, reject, onCancel)
}

/**
 * Bound.all passes an array of values from
 * all the promises in the array object that it was
 * passed. The array of values maintains the order of the
 * original iterable object, not the order that the
 * promises were resolved in. If something passed in the
 * iterable array is not a promise, it's converted to one
 * by {@see Bound.resolve}.
 *
 * If any of the passed in promises rejects, the all
 * Bound immediately rejects with the value of the
 * promise that rejected, discarding all the other promises
 * whether or not they have resolved. If an empty array is
 * passed, then this method resolves immediately.
 *
 * @param {Array<Bound|*>|Generator|Function|Iterator} iterable
 * @returns {Bound}
 * @public
 * @static
 */
Bound.all = function (iterable) {
    return new Bound(function (resolve, reject) {
        var each = (function () {
            function res(value) {
                values[this] = value
                resolved.push(this)
                if (values.length === resolved.length)
                    resolve(values)
            }
            return function (value) {
                //noinspection JSCheckFunctionSignatures
                Bound.resolve(value).then(res.bind(idx++)).catch(reject)
            }
        })()
        var values = [], resolved = []
        var idx = 0

        if (typeof iterable === 'function' && typeof iterable().next === 'function' || typeof iterable.next === 'function') {
            var iterator = typeof iterable.next === 'function' ? iterable : iterable()
            var iteration
            //noinspection JSUnresolvedVariable
            while (!(iteration = iterator.next()).done)
                each(iteration.value)
        }
        for (var i = 0; i < iterable.length; i++)
            each(iterable[i])
    })
}
/**
 * The race function returns a Bound that is settled
 * the same way as the first passed water stream to settle.
 * It resolves or rejects, whichever happens first.
 *
 * @param {Array<Bound|*>|Generator|Function|Iterator} iterable
 * @returns {Bound}
 * @since 1.0
 * @public
 * @static
 */
Bound.race = function (iterable) {
    return new Bound(function (resolve, reject) {
        //noinspection JSValidateTypes
        if (typeof iterable === 'function' && typeof iterable().next === 'function' || typeof iterable.next === 'function') {
            //noinspection JSValidateTypes
            var iterator = typeof iterable.next === 'function' ? iterable : iterable()
            var iteration
            //noinspection JSUnresolvedVariable
            while (!(iteration = iterator.next()).done)
                each(iteration.value)
        }
        for (var i = 0; i < iterable.length; i++)
            each(iterable[i])
        function each(value) {
            //noinspection JSCheckFunctionSignatures
            Bound.resolve(value).then(resolve).catch(reject)
        }
    })
}
/**
 * Returns a Bound that is rejected. For debugging purposes
 * and selective error catching, it is useful to make reason
 * an instanceof {@see Error}.
 *
 * @param {Error|String|*} [reason]
 * @returns {Bound}
 * @since 1.0
 * @public
 * @static
 */
Bound.reject = function (reason) {
    return new Bound(function (resolve, reject) {
        reject(reason)
    })
}
/**
 * Returns a Bound that is resolved.
 *
 * @param {*|Bound} [value]
 * @returns {Bound}
 * @since 1.0
 * @public
 * @static
 */
Bound.resolve = function (value) {
    return new Bound(function (resolve) {
        resolve(value)
    })
}
//noinspection SpellCheckingInspection
/**
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
Bound.promisify = function (fn, argumentCount, hasErrorPar) {
    argumentCount = argumentCount || Infinity
    hasErrorPar = hasErrorPar || true
    return function () {
        const self = this
        const args = Array.prototype.slice.call(arguments)
        return new Bound(function (resolve, reject) {
            while (args.length && args.length > argumentCount) args.pop()
            args.push(function (err, res) {
                if (!hasErrorPar)//noinspection JSUnresolvedFunction
                    resolve.apply(Array.prototype.slice.call(arguments))
                else if (err) reject(err)
                else resolve(res)
            })
            const result = fn.apply(self, args)
            if (result) resolve(result)
        });
    }
}
/**
 * Make asynchronous code look like synchronous with es6 generators.
 * Pass arguments the the first execution of the
 * generator after the first parameter.
 *
 * @param {Generator|Function} generator
 * @returns {Bound}
 * @public
 */
Bound.flow = function (generator) {
    var args = Array.prototype.splice.call(arguments, 1)
    if (typeof generator === 'function') //noinspection JSUnresolvedFunction
        generator = generator.apply(this, args)
    var iterate = function (iteration) {
        //noinspection JSUnresolvedVariable
        if (iteration.done) return Bound.resolve(iteration.value)
        return Bound[Array.isArray(iteration.value) ? 'all' : 'resolve'](iteration.value)
            .then(exec.bind('next'))
            .catch(exec.bind('throw'))
    }
    function exec(val) {
        return iterate(generator[this](val))
    }
    return iterate(generator.next())
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Bound
else//noinspection JSUnresolvedVariable
if (typeof define === 'function' && define.amd) //noinspection JSUnresolvedFunction,JSCheckFunctionSignatures
    define('Bound', [], function () {
        return Bound
    })
else window.Bound = Bound