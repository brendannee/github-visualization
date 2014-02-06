var cronJob = require('cron').CronJob
  , models = require('./models/models')
  , users = require('./lib/users')
  , request = require('request');

module.exports = function(app){
  var User = app.set('db').model('user')
    , githubApi = 'https://api.github.com/';

  //drop records and update github data 5 seconds after launch
  setTimeout(function(){
    User.remove({}, updateGithubData);
  }, 5*1000);
  //update github data once per day
  new cronJob('00 42 1 * * *', updateGithubData, null, true);

  function updateGithubData () {
    console.log('<<<<<<<<  Updating github data');
    users.forEach(function(batch){
      batch.users.forEach(function(user){
        user = user.toLowerCase();
        //fetch user info from github
        request.get({
            url: githubApi + 'users/' + user
          , headers: { 'User-Agent': 'Hacker-School-Github-Visualization' }
          , qs: { access_token: app.set('githubToken') }
          , json: true
        }, function(e, response, body) {
          if(!body.message) {
            body.batch_id = batch.batch_id;
            body.login_lower = user.toLowerCase();
            User.update({login_lower: user}, body, {upsert: true}, function(e, count, item){});

            request.get({
                url: githubApi + 'users/' + user + '/repos'
              , headers: { 'User-Agent': 'Hacker-School-Github-Visualization' }
              , qs: {
                    access_token: app.set('githubToken')
                }
              , json: true
            }, function(e, response, body) {
              User.update({login_lower: user}, {$set: {repos: body}}, function(e, count, item){});
            });
          } else {
            console.log(body.message);
          }
        });
      });
    });
  }
}