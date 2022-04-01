var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session["user"])
    return res.render('login');
  var user=req.session["user"];

  res.render('index', { user: req.session["user"] });
});

module.exports = router;
