var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

var server = app.listen(port, function () {
    console.log("Listening on port %s...", port)
});