var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/depatments', async (req, res,next)=>{
  res.json(await req.knex.select("*").from("t_departments").orderBy("title"));
});
router.post('/login', async (req, res,next)=>{
  console.log(req.body)
  let code=parseInt(req.body.code);
  console.log(code)
  if(isNaN(code))
    return res.json({error:true});

  let dep=parseInt(req.body.dep);
  console.log(dep)
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
    var r = await req.knex("t_logins").insert({userId: user.id, dep: dep}, "*")
    req.session["user"]=user;
    return res.json({success:true});
  }
  res.json({error:true});
});
function normalizeString(str){
  str=str.toLowerCase();
  str.trim();
  str=str.replace(/\s/gi,"");
  str=str.replace(/ё/gi,"е");
  return str;
}

module.exports = router;
