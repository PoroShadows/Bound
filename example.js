var Lofte = require("lofte")

Lofte.resolve("Promises")
    .then(function (text) {
        return text + " are awesome"
    })
    .then(console.log)