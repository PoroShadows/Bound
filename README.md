# Lofte
A promise library based of Promises/A+ specification and more

[![Build Status][img-travis]][url-travis]
[![NPM version][img-npm]][url-npm]
[![NPM Downloads][img-downloads]][url-downloads]
[![License][img-license]][url-license]
[![codecov][img-cc]][url-cc]


If you do not know anything about promises I recommend you check out the [MDN][url-mdn-promises] article about promises.


## Quick access

1. [A beginning example](#an-example)
2. [Getting installed](#getting-installed)
3. [API](#api)
    - [Synchronous state checks](#synchronous-state-checks)
    - [callback](#method-callback)
    - [delay](#method-delay)
    - [cancel](#method-cancel)
    - [onNotify](#method-onnotify)
    - [promisify](#method-promisify)
    - [flow](#method-flow)

## An example

```js
var Lofte = require("lofte");

Lofte.resolve("Supports")
    .then(function (text) {
        return text + " es5"
    })
    .then(text => `${text} and above`)
    .then(console.log) // output: Supports es5 and above
```
## Getting installed
- Install with NPM: `npm install lofte`
- (Hopefully a cdn release)

## API
Wait there is more than the standards O.O

### Synchronous state checks
With Lofte promises you can synchronously check if it is pending, 
resolved, rejected or canceled.

Takes no parameters and returns a boolean based on if it in that state 
or not.

```js
promise.isPending()
promise.isResolved()
promise.isRejected()
promise.isCanceled()
```
### callback
**.callback(cb)**

If you are so obsessed with callbacks. Here you go. Turn the promise into a callback.

```js
promise.callback(function (error, value) {
    // Just you typical callback function
})
```
### delay
**.delay(ms)**

Delay the execution of the promise by x number of milliseconds.

```js
Lofte.resolve('I am a second late')
    .delay(1000)
    .then(console.log)
```
### cancel
**.cancel()**

Cancel a Lofte promise.

```js
const lofte = new Lofte((reolve, reject, onCancel) => {
    const xhr = new XMLHttpRequest()
    // ...
    
    onCancel(() => {
        xhr.abort()
    })
})
```
### onNotify
**.onNotify(handler, ...)**

The promise can give of notifications/progression values or events.

```js
promise.onNotify(function (value) {
    //...
})
```
### reduce, filter, map
**.reduce(cb, [initialValue])**
**.filter(cb, [thisArg])**
**.map(cb, [thisArg])**

They are exactly like their Array counterparts

### finally
**.finally(fn)**

Called regardless of resolution

```js
promise.finally(function () {
    //...
})
```
### fail, lastly
**.fail(onRejection)** (for catch)
**.lastly(fn)** (for finally)

For enviorments that does not support keywords as function/variable name

### promisify
**Lofte.promisify(fn, [options])**

Turn a function with a callback to a promise returning function.

```js
const readFile = Lofte.promisify(require(fs).readFile)

readFile('anything.txt', 'utf-8').then(console.log)
```
### flow
**Lofte.flow(generator)**

Basically makes coroutines with es6/es2015 generators.

```js
// going of last example
const readFile = Lofte.promisify(require('fs').readFile)

Lofte.flow(function* () {
    try {
        const [file1, file2] = yield Lofte.all([
            readFile('path/to/file1.txt', 'utf-8'),
            readFile('path/to/file2.txt', 'utf-8')
        ])
    } catch (e) {
        console.error(e)
    }
})
```

See [wiki][url-wiki](Not really done yet) for more

[url-wiki]: https://github.com/PoroShadows/Lofte/wiki "Lofte wiki"
[url-mdn-promises]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[url-PA+]: https://promisesaplus.com/
[url-travis]: https://travis-ci.org/PoroShadows/Lofte
[url-npm]: https://npmjs.org/package/lofte
[url-license]: LICENSE.md
[url-downloads]: https://npmjs.org/package/lofte
[url-cc]: https://codecov.io/gh/PoroShadows/Lofte

[img-PA+]: https://promisesaplus.com/assets/logo-small.png "Promises/A+ 1.0 compliant"
[img-travis]: https://img.shields.io/travis/PoroShadows/Lofte.svg?style=flat-square
[img-npm]: https://img.shields.io/npm/v/lofte.svg?style=flat-square
[img-license]: https://img.shields.io/npm/l/lofte.svg?style=flat-square
[img-downloads]: https://img.shields.io/npm/dm/lofte.svg?style=flat-square
[img-meme]: https://i.imgflip.com/1f2lkm.jpg "Wow so original"
[img-cc]: https://img.shields.io/codecov/c/github/PoroShadows/Lofte/experimental.svg?style=flat-square
