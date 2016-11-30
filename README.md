# Lofte
A promise library implementing the Promises/A+ specification and a little more

[![Promises/A+ logo][img-PA+]][url-PA+]
[![Build Status][img-travis]][url-travis]
[![NPM version][img-npm]][url-npm]
[![NPM Downloads][img-downloads]][url-downloads]
[![License][img-license]][url-license]

If you do not know anything about promises I recommend you check out the [MDN][url-mdn-promises] article about promises.

## Quick access

1. [A beginning example](#a-beginning-example)
2. [Getting installed](#getting-installed)
3. [API](#api)
    - [Synchronous checks](#synchronous-checks)
    - [`delay`](#method-delay)
    - [`cancel`](#method-cancel)
    - [`callback`](#method-callback)

## A beginning example
of how it is to work with a promise
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
Wait there is more than the standards O.O. What else could this entail library would this be if it
did not have more than the standard. It wouldn't be as interesting as the rest.

One thing to note is that the `race` method do not get stuck if the 
iterable is empty. It just resolves directly.

![One does not simply meme image][img-meme]

### Synchronous checks
With Lofte promises you can synchronously check if it is pending, resolved, rejected, fulfilled or canceled.

Takes no parameters and returns a boolean based on if it in that state or not.

```js
const lofte = someLoftePromise()

lofte.isPending()
lofte.isResolved()
lofte.isRejected()
lofte.isFulfilled()
lofte.isCanceled()
lofte.isCancelable()
```

### Method `delay`
Delay the execution of the promise by x number of milliseconds

```js
Lofte.resolve('I am a second late').delay(1000).then(console.log)
```

### Method `cancel`
Cancel a Lofte promise


### Method `callback`
If you are so obsessed with callbacks that it is a drug to you. Here you go. Turn the promise into a callback.

```js
someFunctionThatReturnsALoftePromise().callback(function (error, value) {
    // Just you typical callback function
})
```







See ~~[wiki][url-wiki]~~ for more

[url-wiki]: https://github.com/PoroShadows/Lofte/wiki "Lofte wiki"
[url-mdn-promises]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[url-PA+]: https://promisesaplus.com/
[url-travis]: https://travis-ci.org/PoroShadows/Lofte
[url-npm]: https://npmjs.org/package/lofte
[url-license]: LICENSE.md
[url-downloads]: https://npmjs.org/package/lofte

[img-PA+]: https://promisesaplus.com/assets/logo-small.png "Promises/A+ 1.0 compliant"
[img-travis]: https://img.shields.io/travis/PoroShadows/Lofte.svg?style=flat-square
[img-npm]: https://img.shields.io/npm/v/lofte.svg?style=flat-square
[img-license]: http://img.shields.io/npm/l/lofte.svg?style=flat-square
[img-downloads]: http://img.shields.io/npm/dm/lofte.svg?style=flat-square
[img-meme]: https://i.imgflip.com/1f2lkm.jpg "Wow so original"
