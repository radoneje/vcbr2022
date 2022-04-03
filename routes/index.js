var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session["user"])
    return res.render('login');
  var user=req.session["user"];

  res.render('index', { user: req.session["user"] });
});
router.get("/vcbr/status", async (req, res)=>{
  let chat=await req.knex.select("*").from("v_chat").orderBy("date", );
  let q=await req.knex.select("*").from("v_q").orderBy("date", );

  let count=50-chat.length;
  if(count<0)
    chat=chat.slice(count);

   count=50-q.length;
  if(count<0)
    q=q.slice(count);

  res.json({chat, q});
})

module.exports = router;
