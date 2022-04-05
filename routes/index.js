var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session["user"])
    return res.render('login');
  var user=req.session["user"];

  res.render('index', { user: req.session["user"] });
});
router.get('/admin', function(req, res, next) {
  if(!req.session["admin"])
    return res.render('adminLogin', {msg:""});
  var user=req.session["admin"];

  res.render('admin', { user: req.session["user"] });
});
router.post('/admin', function(req, res, next) {
  if(req.body.l!="editor" && req.body.l!="dfczgegrby")
  {
    return res.render('adminLogin', {msg:"неверный логин или пароль", name:req.body.l});
  }
  req.session["admin"]="editor"
  res.render('admin', );
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

  let vote=await req.knex.select("*").from("t_vote").where({isDeleted:false, isactive:true}).orderBy("id");

  for(let item of vote){
    item.answers=await( req.knex.select("*").from("t_voteanswers").where({voteid:item.id, isDeleted:false}).orderBy("id"));
    let total=0;
    item.answers.forEach(a=>{total+=a.count});
    item.total=total;
  }
  let status=(await req.knex.select("*").from("t_status"))[0]

  res.json({chat, q, vote, status});
})

module.exports = router;
