var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

/* GET home page. */
router.get('/rest', function(req, res, next) {

res.json(req.users);
});
router.get('/test', function(req, res, next) {
  return res.render('zaglushka', { user: req.session["user"] });
  if(!req.session["user"])
    return res.render('login');
  var user=req.session["user"];

  res.render('index', { user: req.session["user"] });
});
router.get('/qa', function(req, res, next) {
  return res.render('qa');
});
router.get('/', function(req, res, next) {
 return res.render('zaglushka', { user: req.session["user"] });
  if(!req.session["user"])
    return res.render('login');
  var user=req.session["user"];
  res.render('index', { user: req.session["user"] });
 // res.render('zaglushka', { user: req.session["user"] });
});

router.get('/admin', function(req, res, next) {
  if(!req.session["admin"])
    return res.render('adminLogin', {msg:""});
  var user=req.session["admin"];

  res.render('admin', { user: req.session["user"] });
});
router.get('/ipad', function(req, res, next) {
  res.render('ipad', );
});
router.get('/vote', function(req, res, next) {
  res.render('vote', );
})
router.post('/admin', function(req, res, next) {
  if(req.body.l!="editor" && req.body.l!="dfczgegrby")
  {
    return res.render('adminLogin', {msg:"неверный логин или пароль", name:req.body.l});
  }
  req.session["admin"]="editor"
  res.render('admin', );
});
router.get('/depatments2', async (req, res, next) => {
  res.json(await req.knex.select("*").from("t_departments").orderBy("sort"));
});

router.get("/status", async (req, res)=>{
  let chat=[];//=await req.knex.select("*").from("v_chat").orderBy("date", );
  let q=[];//=await req.knex.select("*").from("v_q").orderBy("date", );

  let count=50-chat.length;
  if(chat.length>50)
    chat=chat.slice(-50);

  // count=50-q.length;
  //if(count<0)

  if(q.length>50)
    q=q.slice(-50);

  let vote=[];//=await req.knex.select("*").from("t_vote").where({isDeleted:false, isactive:true}).orderBy("id");

  for(let item of vote){
    item.answers=await( req.knex.select("*").from("t_voteanswers").where({voteid:item.id, isDeleted:false}).orderBy("id"));
    let total=0;
    item.answers.forEach(a=>{total+=a.count});
    item.total=total;
  }
  let raiting=[];//=await req.knex.select("*").from("t_raiting").where({isDeleted:false, isactive:true}).orderBy("id");


  for(let item of raiting){
    item.answers=await( req.knex.select("*").from("t_raitinganswers").where({raitingid:item.id, isDeleted:false}).orderBy("id"));
    let total=0;
    let i=0;
    item.answers.forEach(a=>{
      i++;
      a.i=i;
      total+=a.count
    });
    item.total=total;

  }
  let status=(await req.knex.select("*").from("t_status"))[0]
  var timeout=20;
  try {
    var timeout=parseInt(fs.readFileSync(path.join(__dirname, '../updateTimeout.txt')))
  }
  catch(e){
    console.warn(e)
  }
  res.json({chat, q, vote,raiting, status:status, timeout});
})

module.exports = router;
