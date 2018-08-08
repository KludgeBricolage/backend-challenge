var boom = require('boom');
var getUser = require('./user');

var routes = function(app) {
    // View message on /
    app.get('/', function(req, res) {
        var url = req.get('host') + req.originalUrl;
        res.status(200).send("Use API routes: " + url + "user_profile or " + url + "user_profile_continue");
    });

    // Cheerio crawl for GitHub user profile
    app.get('/user_profile', function(req, res, next) {
        const username = req.query.username;
        getUser(username, (data) => {
            data.isBoom ? next(data) : res.status(200).send(data);
        });
    });

    app.use(function (err, req, res, next) {
        return res.status(err.output.statusCode).json(err.output.payload);
    })
}

module.exports = routes;