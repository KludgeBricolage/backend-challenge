var boom = require('boom');
var request = require('request');
var cheerio = require('cheerio');


var getUser = function (username, callback) {
    // get api param `username`
    if (!username) return callback(boom.badRequest("Missing `username` parameter."));

    // GitHub user profile page
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
            console.log(data);
            return callback(data)
        } else {
            if (response.statusCode == "404") {
                return callback(boom.notFound("User not found."));
            }
            else if (response.statusCode == "401")
                return callback(boom.unauthorized("User not found."));
            else {
                var error = new Error('Something went wrong');
                return callback(boom.boomify(error, res.statusCode));
            }
        }
    });
};

module.exports = getUser;