var config = require('./config')
  , cron = require('./cron')
  , routes = require('./routes');

module.exports = function boot(app){

  config(app);

  cron(app);

  routes(app);

  return app;

}
