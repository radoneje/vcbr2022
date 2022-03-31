var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/test', function(req, res, next) {
  if(!req.session["user"])
    return res.render('login')
  res.render('index', { title: 'Express' });
});

module.exports = router;
