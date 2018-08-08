var routes = function(app) {
    app.get('/', function(req, res) {
        var url = req.get('host') + req.originalUrl;
        res.status(200).send("Use API routes: " + url + "user_profile or " + url + "user_profile_continue");
    });

    app.get('/user_profile', function(req, res, next) {
        var boom = require('boom');
        var request = require('request');
        var cheerio = require('cheerio');

        const username = req.query.username;
        if (!username) {
            return next(boom.badRequest("Missing `username` parameter."));
        }
        request('https://github.com/' + username, function (err, response, html) {
            if (!err & response.statusCode == 200) {
                var $ = cheerio.load(html);
                var data = {
                    data: {
                        username: $('span.vcard-username').text(),
                        fullName: $('span.vcard-fullname').text(),
                        imageUrl: $('a.u-photo img.avatar').attr('src'),
                        followers: $('a[title="Followers"] span.Counter').text().trim(),
                        following: $('a[title="Following"] span.Counter').text().trim()
                    }
                }

                res.status(200).send(data);
            } else {
                if (response.statusCode == "404") {
                    return next(boom.notFound("User not found."));
                } else if (response.statusCode == "401") {
                    return next(boom.unauthorized("User not found."));
                } else {
                    var error = new Error('Something went wrong');
                    return next(boom.boomify(error, res.statusCode));
                }
            }
        });
    });

    app.use(function (err, req, res, next) {
        return res.status(err.output.statusCode).json(err.output.payload);
    })
}

module.exports = routes;