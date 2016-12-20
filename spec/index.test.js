var Lofte = require('../')

function timeoutRes(value, ms) {
    return new Lofte(function (resolve) {
        setTimeout(function () {
            resolve(value)
        }, ms)
    })
}
function timeoutRej(value, ms) {
    return new Lofte(function (resolve, reject) {
        setTimeout(function () {
            reject(value)
        }, ms)
    })
}

describe('Lofte tests for things since version', function () {
    describe('1.0.*:', function () {
        describe('instantiation', function () {
            it('constructs fine', function (done) {
                new Lofte(function (resolve, reject) {
                    expect(resolve).toBeDefined()
                    expect(reject).toBeDefined()
                    done()
                })
            })
        })
        describe('method then', function () {
            it('works normally', function (done) {
                var spyRes = jasmine.createSpy('res')
                var spyRej = jasmine.createSpy('rej')
                Lofte.resolve('a value').then(spyRes, spyRej).then(function () {
                    expect(spyRes).toHaveBeenCalledWith('a value')
                    expect(spyRej.calls.any()).toBeFalsy()
                    done()
                })
            })
            it('works with rejection', function (done) {
                var spyRes = jasmine.createSpy('res')
                var spyRej = jasmine.createSpy('rej')
                Lofte.reject('an error').then(spyRes, spyRej).then(function () {
                    expect(spyRes.calls.any()).toBeFalsy()
                    expect(spyRej).toHaveBeenCalledWith('an error')
                    done()
                })
            })
            it('rejects if then function of a 3rd party throws', function (done) {
                Lofte.resolve({
                    then: function () {
                        throw 'then error'
                    }
                }).then(null, function (reason) {
                    expect(reason).toBe('then error')
                    done()
                })
            })
        })
        describe('method catch', function () {
            it('handles rejection', function (done) {
                var spyRej = jasmine.createSpy('rej')
                Lofte.reject('an error').catch(spyRej).then(function () {
                    expect(spyRej).toHaveBeenCalledWith('an error')
                    done()
                })
            })
        })
        describe('internal handler', function () {
            it('rejects when then handler throws', function (done) {
                Lofte.resolve().then(function () {
                    throw 'error'
                }).catch(function (reason) {
                    expect(reason).toBe('error')
                    done()
                })
            })
            it('works even if onResolved is not a function', function (done) {
                Lofte.resolve().then({}).then(function () {
                    done()
                })
            })
            it('works even if onRejected is not a function', function (done) {
                Lofte.reject().catch({}).catch(function () {
                    done()
                })
            })
        })
        describe('function resolve', function () {
            it('resolves a promise', function (done) {
                Lofte.resolve().then(function () {
                    done()
                })
            })
            it('resolves a promise with value', function (done) {
                var value = 'test'
                Lofte.resolve(value).then(function (result) {
                    expect(result).toBe(value)
                    done()
                })
            })
        })
        describe('function reject', function () {
            it('rejects a promise', function (done) {
                Lofte.reject().catch(function () {
                    done()
                })
            })
            it('rejects a promise with value', function (done) {
                var value = 'error'
                Lofte.reject(value).catch(function (reason) {
                    expect(reason).toBe(value)
                    done()
                })
            })
        })
        describe('function all', function () {
            it('returns a array of 1, 0, "test" and false in order', function (done) {
                var p1 = timeoutRes(1, 100)
                var p2 = timeoutRes(0, 600)
                var p3 = timeoutRes('test', 400)
                var p4 = timeoutRes(false, 800)

                Lofte.all([p1, p2, p3, p4]).then(function (values) {
                    expect(values).toEqual([1, 0, 'test', false])
                    done()
                })
            })
            it('resolves to [3, 1275, "foo"]', function (done) {
                var p1 = Lofte.resolve(3)
                var p2 = 1275
                var p3 = timeoutRes("foo", 100)

                Lofte.all([p1, p2, p3]).then(function (values) {
                    expect(values).toEqual([3, 1275, "foo"])
                    done()
                })
            })
            it('tests to see if it has fail-fast behavior', function (done) {
                var p1 = timeoutRes("one", 100)
                var p2 = timeoutRes("two", 200)
                var p3 = timeoutRes("three", 300)
                var p4 = timeoutRes("four", 400)
                var p5 = Lofte.reject("reject")

                Lofte.all([p1, p2, p3, p4, p5]).catch(function (reason) {
                    expect(reason).toBe('reject')
                    done()
                })
            })
            it('resolves empty', function (done) {
                Lofte.all([]).then(function () {
                    done()
                })
            })
            describe('with generators', function () {
                it('returns a array of 1, 0, "test" and false in order', function (done) {
                    function* gen() {
                        yield timeoutRes(1, 100)
                        yield timeoutRes(0, 600)
                        yield timeoutRes('test', 400)
                        yield timeoutRes(false, 800)
                    }

                    Lofte.all(gen).then(function (values) {
                        expect(values).toEqual([1, 0, 'test', false])
                        done()
                    })
                })
                it('resolves to [3, 1275, "foo"]', function (done) {
                    function* gen() {
                        yield Lofte.resolve(3)
                        yield 1275
                        yield timeoutRes("foo", 100)
                    }

                    Lofte.all(gen).then(function (values) {
                        expect(values).toEqual([3, 1275, "foo"])
                        done()
                    })
                })
                it('tests to see if it has fail-fast behavior', function (done) {
                    function* gen() {
                        yield timeoutRes("one", 100)
                        yield timeoutRes("two", 200)
                        yield timeoutRes("three", 300)
                        yield timeoutRes("four", 400)
                        yield Lofte.reject("reject")
                    }

                    Lofte.all(gen).catch(function (reason) {
                        expect(reason).toBe('reject')
                        done()
                    })
                })
                it('resolves empty', function (done) {
                    function* gen() {
                    }

                    Lofte.all(gen).then(function () {
                        done()
                    })
                })
            })
            describe('with generator instances', function () {
                it('returns a array of 1, 0, "test" and false in order', function (done) {
                    function* gen() {
                        yield timeoutRes(1, 100)
                        yield timeoutRes(0, 600)
                        yield timeoutRes('test', 400)
                        yield timeoutRes(false, 800)
                    }

                    const promises = gen()

                    Lofte.all(promises).then(function (values) {
                        expect(values).toEqual([1, 0, 'test', false])
                        done()
                    })
                })
                it('resolves to [3, 1275, "foo"]', function (done) {
                    function* gen() {
                        yield Lofte.resolve(3)
                        yield 1275
                        yield timeoutRes("foo", 100)
                    }

                    const promises = gen()

                    Lofte.all(promises).then(function (values) {
                        expect(values).toEqual([3, 1275, "foo"])
                        done()
                    })
                })
                it('tests to see if it has fail-fast behavior', function (done) {
                    function* gen() {
                        yield timeoutRes("one", 100)
                        yield timeoutRes("two", 200)
                        yield timeoutRes("three", 300)
                        yield timeoutRes("four", 400)
                        yield Lofte.reject("reject")
                    }

                    const promises = gen()

                    Lofte.all(promises).catch(function (reason) {
                        expect(reason).toBe('reject')
                        done()
                    })
                })
                it('resolves empty', function (done) {
                    function* gen() {
                    }

                    const promises = gen()

                    Lofte.all(promises).then(function () {
                        done()
                    })
                })
            })
        })
        describe('function race', function () {
            it('resolves the first promise to be done', function (done) {
                var p1 = timeoutRes("one", 500)
                var p2 = timeoutRes("two", 100)

                Lofte.race([p1, p2]).then(function (value) {
                    expect(value).toBe("two")
                    done()
                })
            })
            it('can also reject the first one', function (done) {
                var p1 = timeoutRej("one", 100)
                var p2 = timeoutRes("two", 500)

                Lofte.race([p1, p2]).catch(function (reason) {
                    expect(reason).toBe("one")
                    done()
                })
            })
            it('resolves empty', function (done) {
                Lofte.race([]).then(function () {
                    done()
                })
            })
            describe('with generators', function () {
                it('resolves the first promise to be done', function (done) {
                    function* gen() {
                        yield timeoutRes("one", 500)
                        yield timeoutRes("two", 100)
                    }

                    Lofte.race(gen).then(function (value) {
                        expect(value).toBe("two")
                        done()
                    })
                })
                it('can also reject the first one', function (done) {
                    function* gen() {
                        yield timeoutRej("one", 100)
                        yield timeoutRes("two", 500)
                    }

                    Lofte.race(gen).catch(function (reason) {
                        expect(reason).toBe("one")
                        done()
                    })
                })
                it('resolves empty', function (done) {
                    function* gen() {
                    }

                    Lofte.race(gen).then(function () {
                        done()
                    })
                })
            })
            describe('with generator instances', function () {
                it('resolves the first promise to be done', function (done) {
                    function* gen() {
                        yield timeoutRes("one", 500)
                        yield timeoutRes("two", 100)
                    }

                    const promises = gen()

                    Lofte.race(promises).then(function (value) {
                        expect(value).toBe("two")
                        done()
                    })
                })
                it('can also reject the first one', function (done) {
                    function* gen() {
                        yield timeoutRej("one", 100)
                        yield timeoutRes("two", 500)
                    }

                    const promises = gen()

                    Lofte.race(promises).catch(function (reason) {
                        expect(reason).toBe("one")
                        done()
                    })
                })
                it('resolves empty', function (done) {
                    function* gen() {
                    }

                    const promises = gen()

                    Lofte.race(promises).then(function () {
                        done()
                    })
                })
            })
        })
        describe('synchronous state checking', function () {
            it('is pending', function (done) {
                var p = timeoutRes(null, 100)
                expect(p.isPending()).toBeTruthy()
                done()
            })
            it('is not pending', function (done) {
                var p1 = Lofte.resolve()
                var p2 = Lofte.reject()
                expect(p1.isPending()).toBeFalsy()
                expect(p2.isPending()).toBeFalsy()
                done()
            })
            it('is resolved', function (done) {
                var p = Lofte.resolve()
                expect(p.isResolved()).toBeTruthy()
                done()
            })
            it('is not resolved', function (done) {
                var p1 = timeoutRes(null, 100)
                var p2 = Lofte.reject()
                expect(p1.isResolved()).toBeFalsy()
                expect(p2.isResolved()).toBeFalsy()
                done()
            })
            it('is rejected', function (done) {
                var p = Lofte.reject()
                expect(p.isRejected()).toBeTruthy()
                done()
            })
            it('is not resolved', function (done) {
                var p1 = timeoutRes(null, 100)
                var p2 = Lofte.resolve()
                expect(p1.isRejected()).toBeFalsy()
                expect(p2.isRejected()).toBeFalsy()
                done()
            })
        })
        describe('method callback', function () {
            it('crates a callback from a resolved promise', function (done) {
                Lofte.resolve('a value').callback(function (error, value) {
                    expect(error).toBeNull()
                    expect(value).toBe('a value')
                    done()
                })
            })
            it('crates a callback from a rejected promise', function (done) {
                Lofte.reject('an error').callback(function (error, value) {
                    expect(error).toBe('an error')
                    expect(value).toBeUndefined()
                    done()
                })
            })
        })
        describe('method delay', function () {
            it('delays the function by 100ms', function (done) {
                var spy = jasmine.createSpy('delay')
                var value = 'hi'
                Lofte.resolve(value).delay(100).then(spy)
                setTimeout(function () {
                    expect(spy.calls.any()).toBeFalsy()
                }, 90)
                setTimeout(function () {
                    expect(spy).toHaveBeenCalledWith(value)
                    done()
                }, 110)
            })
        })
        describe('method promisify', function () {
            it('constructs a promise returning function that resolves', function (done) {
                var spy = jasmine.createSpy('promisify[1]')

                function fn(value, callback) {
                    callback(null, value)
                }

                var value = 'some value'
                var fnp = Lofte.promisify(fn)
                fnp(value).then(spy).then(function () {
                    expect(spy).toHaveBeenCalledWith(value)
                    done()
                })
            })
            it('constructs a promise returning function that rejects', function (done) {
                var spy = jasmine.createSpy('promisify[2]')

                function fn(value, callback) {
                    callback(value)
                }

                var value = 'some error'
                var fnp = Lofte.promisify(fn)
                fnp(value).catch(spy).then(function () {
                    expect(spy).toHaveBeenCalledWith(value)
                    done()
                })
            })
            it('directly resolves promise returning function', function (done) {
                var spy = jasmine.createSpy('promisify[3]')

                function fn(value) {
                    return Lofte.resolve(value)
                }

                var value = 'some value'
                var fnp = Lofte.promisify(fn)
                fnp(value).then(spy).then(function () {
                    expect(spy).toHaveBeenCalledWith(value)
                    done()
                })
            })
            it('takes no more than the expected amount of arguments', function (done) {
                var spy = jasmine.createSpy('promisify[4]')

                function fn(value, callback) {
                    callback(value)
                }

                var value = 'some value'
                var fnp = Lofte.promisify(fn, { hasErrorArg: false, argumentCount: 1 })
                fnp(value, 'ignored').then(spy).then(function () {
                    expect(spy).toHaveBeenCalledWith(value)
                    done()
                })
            })
            it('makes due with more callback values', function (done) {
                var spy = jasmine.createSpy('promisify[5]')

                function fn(v1, v2, error, callback) {
                    callback(error, v1, v2)
                }

                var v1 = 'first value'
                var v2 = 'second value'
                var fnp = Lofte.promisify(fn, { moreCBValues: true, argumentCount: 3 })
                fnp(v1, v2).then(spy).then(function () {
                    expect(spy).toHaveBeenCalledWith([v1, v2])
                    done()
                })
            })
            it('makes due with more callback values with no error arg', function (done) {
                var spy = jasmine.createSpy('promisify[6]')

                function fn(v1, v2, callback) {
                    callback(v1, v2)
                }

                var v1 = 'first value'
                var v2 = 'second value'
                var fnp = Lofte.promisify(fn, { moreCBValues: true, hasErrorArg: false })
                fnp(v1, v2).then(spy).then(function () {
                    expect(spy).toHaveBeenCalledWith([v1, v2])
                    done()
                })
            })
            it('makes due with more callback values and can error', function (done) {
                var spy = jasmine.createSpy('promisify[7]')

                function fn(v1, v2, error, callback) {
                    callback(error, v1, v2)
                }

                var v1 = 'first value'
                var v2 = 'second value'
                var error = 'a error'
                var fnp = Lofte.promisify(fn, { moreCBValues: true })
                fnp(v1, v2, error).catch(spy).then(function () {
                    expect(spy).toHaveBeenCalledWith(error)
                    done()
                })
            })
        })
    })
    describe('1.1.*:', function () {
        describe('instantiation', function () {
            it('constructs fine', function (done) {
                new Lofte(function (resolve, reject, onCancel) {
                    expect(resolve).toBeDefined()
                    expect(reject).toBeDefined()
                    expect(onCancel).toBeDefined()
                    done()
                })
            })
        })
        describe('synchronous state checking', function () {
            it('is canceled', function (done) {
                var spy = jasmine.createSpy('cancel')
                var lofte = Lofte.resolve()
                lofte.cancel()
                expect(lofte.isCanceled()).toBeTruthy()
                done()
            })
            it('is not canceled', function (done) {
                var spy = jasmine.createSpy('cancel')
                var lofte = Lofte.resolve()
                expect(lofte.isCanceled()).toBeFalsy()
                done()
            })
        })
        describe('function race', function () {
            it('(not in spec) can be canceled normally', function (done) {
                var lofte = new Lofte(function () {
                })
                lofte.cancel()
                expect(lofte.isCanceled()).toBeTruthy()
                done()
            })
            it('(not in spec) can be canceled with special function', function (done) {
                var spy = jasmine.createSpy('cancel')
                var lofte = new Lofte(function (resolve, reject, onCancel) {
                    onCancel(spy)
                })
                lofte.cancel()
                expect(spy).toHaveBeenCalled()
                expect(lofte.isCanceled()).toBeTruthy()
                done()
            })
        })
    })
    describe('1.2.*:', function () {
        describe('instantiation', function () {
            it('constructs fine with notify', function (done) {
                new Lofte(function (resolve, reject, onCancel, notify) {
                    expect(resolve).toBeDefined()
                    expect(reject).toBeDefined()
                    expect(onCancel).toBeDefined()
                    expect(notify).toBeDefined()
                    done()
                })
            })
        })
        describe('notifications', function () {
            it('registers a listener and gets fired on progress event', function (done) {
                var spy1 = jasmine.createSpy('progression')
                var spy2 = jasmine.createSpy('complete')
                new Lofte(function (resolve, reject, onCancel, notify) {
                    setTimeout(notify, 250, 25)
                    setTimeout(notify, 500, 50)
                    setTimeout(notify, 750, 75)
                    setTimeout(resolve, 1000, 'done')
                }).onNotify(spy1).then(spy2).then(function () {
                    expect(spy1.calls.count()).toEqual(3)
                    expect(spy1).toHaveBeenCalledWith(25)
                    expect(spy1).toHaveBeenCalledWith(50)
                    expect(spy1).toHaveBeenCalledWith(75)
                    expect(spy2).toHaveBeenCalledWith('done')
                    done()
                })
            })
        })
    })
})
