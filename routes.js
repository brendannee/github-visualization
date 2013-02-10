var models = require('./models/models')
  , async = require('async')
  , _ = require('underscore')
  , request = require('request')
  , users = require('./lib/users');


module.exports = function routes(app){
  var User = app.set('db').model('user');

  app.get('/api/students', function(req, res){
    User.find({}, function(err, docs){
        res.json(docs);
      });
   
  });

  app.get('/api/batches', function(req, res){
    res.json(users);   
  });

  //Nothing specified
  app.all('*', function notFound(req, res) {
    res.send('Not Found');
  });

}

