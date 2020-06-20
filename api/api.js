const messengerController = require('../controllers/messenger');

module.exports = function(app) {
    
  
    // todoList Routes
    app
      .get('/sendTest',messengerController.sendTest())

  };