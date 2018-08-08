var boom = require('boom');
var getUser = require('./user');
var kue = require('kue-scheduler'),
    Queue = kue.createQueue();

const schedTwoMins = '*/2 * * * *' // https://crontab.guru/every-2-minutes
var job = Queue.createJob('userCont')
            .attempts(10).removeOnComplete('true');

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

    // Kue scheduler job execute ever 2 minutes
    app.get('/user_profile_continue', function (req, res, next) {
        const username = req.query.username;
        var count = 0;
        getUser(username, (data) => {
            data.isBoom ? next(data) : res.status(200).send(data);
            Queue.process('userCont', function (job, done) {
                console.log('After 2 minutes...');
                console.log(data);
                count++;
                done();
            })
        });

        Queue.on('schedule success', function(job) {
            if(count==10) Queue.remove(job.id, (err, res) => console.log("Job Terminated.")); 
        });

        Queue.every(schedTwoMins, job);
    })

    // Error handler
    app.use(function (err, req, res, next) {
        return res.status(err.output.statusCode).json(err.output.payload);
    })
}

module.exports = routes;