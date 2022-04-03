var express = require('express');
var moment = require('moment');
var router = express.Router();

/* GET home page. */
router.get('/depatments', async (req, res,next)=>{
  res.json(await req.knex.select("*").from("t_departments").orderBy("title"));
});
router.post('/login', async (req, res,next)=>{
  let code=parseInt(req.body.code);
  if(isNaN(code))
    return res.json({error:true});

  let dep=parseInt(req.body.dep);
  if(isNaN(dep))
    return res.json({error:true});

  let users=await req.knex.select("*").from("t_users").where({code:parseInt(req.body.code)});

  if(users.length==0)
    return res.json({error:true});
  let user=users[0];
  if(
      normalizeString(user.f)===normalizeString(req.body.f) &&
      normalizeString(user.i)===normalizeString(req.body.i)
  ) {
    console.log(req.users)
    if(req.users.filter(u=>{return u.id==user.id}).length>0)
    {
      return res.json({error:true, doubleLogin:true});
    }
    var r = await req.knex("t_logins").insert({userId: user.id, dep: dep}, "*")
    await req.knex("t_users").update({deptid: dep}, "*").where({id:user.id});
    delete user.code;
    req.session["user"]=user;
    //req.users=req.users.filter(u=>{return u.id!==user.id});
    req.users.push({id:user.id, time:moment().unix()});
    return res.json({success:true});
  }
  res.json({error:true});
});
router.get("/users",(req,res)=>{
  res.json(req.users);

});
function normalizeString(str){
  str=str.toLowerCase();
  str.trim();
  str=str.replace(/\s/gi,"");
  str=str.replace(/ё/gi,"е");
  return str;
}
function checkLogin(req, res,next) {

  if(!req.session["user"])
    return res.send(401);
  var find=false;
  req.users.forEach(u=>{
    if(u.id==req.session["user"].id)
    {
      u.time=moment().unix();
      find=true;
    }
  })
  if(!find)
    req.users.push({id:req.session["user"].id, time:moment().unix()});
  next();
}
router.get("/status", checkLogin,(req,res,next)=>{
  res.json({chat:[],q:[],vote:[],user:req.session["user"]})
})
router.get("/logout",/*checkLogin,*/(req,res,next)=>{
  req.clearUser(req.session["user"].id);
  console.log("logout", req.users);
  req.session["user"]=null;
  res.json({success:true});
})
router.post("/chatSend", checkLogin, async (req,res,next)=>{

  var r= await req.knex("t_chat").insert({text:req.body.text, userid:req.session["user"].id}, "*");
  var dt=await req.knex.select("*").from("v_chat").where({id:r[0].id})
  res.json(dt[0]);
})

router.post("/qSend", checkLogin, async (req,res,next)=>{
  var r= await req.knex("t_q").insert({text:req.body.text, userid:req.session["user"].id}, "*");
  var dt=await req.knex.select("*").from("v_q").where({id:r[0].id})
  res.json(dt[0]);
})

module.exports = router;
