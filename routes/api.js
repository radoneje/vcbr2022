var express = require('express');
var moment = require('moment');
var router = express.Router();
//var geoip = require('geoip-lite');


/* GET home page. */
router.get('/depatments', async (req, res, next) => {
    res.json(await req.knex.select("*").from("t_departments").orderBy("sort"));
});
router.post('/depatments', checkAdmin,async (req, res, next) => {
    var id=req.body.id;
    delete req.body.id
    await req.knex("t_departments").update(req.body).where({id:id})
    res.json(await req.knex.select("*").from("t_departments").orderBy("sort"));
});
router.post("/likeQ",async (req, res,next)=>{
    if(!req.session["user"])
        return res.sendStatus(404);
    if(!Number.isInteger(req.body.qid))
        return res.sendStatus(403);

    console.log(req.body.qid, req.body.qid);
    await req.knex.raw("update t_q SET likes=likes+1 where id="+req.body.qid );
    res.json("ok")
})
router.post('/login', async (req, res, next) => {
    let code = parseInt(req.body.code);
    if (isNaN(code))
        return res.json({error: true});

    let dep = parseInt(req.body.dep);
    if (isNaN(dep))
        return res.json({error: true});

    let users = await req.knex.select("*").from("t_users").where({code: parseInt(req.body.code)});

    if (users.length == 0)
        return res.json({error: true});
    let user = users[0];
    if (
        normalizeString(user.f) === normalizeString(req.body.f) &&
        normalizeString(user.i) === normalizeString(req.body.i)
    ) {

       if (req.users.filter(u => {
            return u.id == user.id
        }).length > 0) {
            return res.json({error: true, doubleLogin: true});
        }
        var ip= req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      //  var geo = geoip.lookup(ip);
        var info = "";
        info += (" " + req.headers["user-agent"]);
        info += (" " + req.headers["accept-language"]);
       // info += (" Country: " + (geo ? geo.country : "Unknown"));
       // info += (" Region: " + (geo ? geo.region : "Unknown"));


        var r = await req.knex("t_logins").insert({
            userId: user.id,
            dep: dep,
            ip: (req.headers['x-forwarded-for'] || req.socket.remoteAddress),
            Descr: info
        }, "*")
        await req.knex("t_users").update({deptid: dep}, "*").where({id: user.id});
        delete user.code;
        req.session["user"] = user;
        req.updateUser(user)

        return res.json({success: true});
    }
    res.json({error: true});
});

function normalizeString(str) {
    str = str.toLowerCase();
    str.trim();
    str = str.replace(/\s/gi, "");
    str = str.replace(/ё/gi, "е");
    return str;
}

function checkAdmin(req, res, next) {
    if (!req.session["admin"])
        return res.send(401);
    next();
}

function checkLogin(req, res, next) {

    if (!req.session["user"])
        return res.send(401);
    var find = false;
    req.users.forEach(u => {
        if (u.id == req.session["user"].id) {
            u.time = moment().unix();
            find = true;
        }
    })
    if (!find)
        req.users.push({id: req.session["user"].id, time: moment().unix()});
    next();
}

router.get("/status", checkLogin, (req, res, next) => {
    res.json({chat: [], q: [], vote: [], user: req.session["user"]})
})
router.get("/logout",/*checkLogin,*/(req, res, next) => {
    req.clearUser(req.session["user"].id);
    console.log("logout", req.users);
    req.session["user"] = null;
    res.json({success: true});
})
router.post("/chatSend", checkLogin, async (req, res, next) => {

    var r = await req.knex("t_chat").insert({text: req.body.text, userid: req.session["user"].id}, "*");
    var dt = await req.knex.select("*").from("v_chat").where({id: r[0].id})
    console.log(dt[0],r)
    res.json(dt[0]);
})

router.post("/qSend", checkLogin, async (req, res, next) => {
    var r = await req.knex("t_q").insert({text: req.body.text, userid: req.session["user"].id}, "*");
    var dt = await req.knex.select("*").from("v_q").where({id: r[0].id})
    res.json(dt[0]);
})
router.post("/qDelete", checkAdmin, async (req, res, next) => {
    var r = await req.knex("t_q").update({isDeleted: true}, "*").where({id: req.body.id});

    res.json(r[0].id);
})
router.post("/chatDelete", checkAdmin, async (req, res, next) => {
    var r = await req.knex("t_chat").update({isDeleted: true}, "*").where({id: req.body.id});
    res.json(r[0].id);
})
router.get("/users", checkAdmin, async (req, res, next) => {

    res.json(await getUsers(req));
})
async function getUsers(req){
    var r = await req.knex.select("*").from("t_users").orderBy("f").orderBy("i")
    for (let user of r) {
        user.logins = await req.knex.select("*").from("v_logins").where({userId: user.id}).orderBy("id")
    }
    return r;
}

router.get("/newUserCode", checkAdmin, async (req, res, next) => {
    var e = await createCode(randomIntFromInterval(10000, 99999))
    res.json(e);


    async function createCode(candidate) {
        var r = await req.knex.select("*").from("t_users").where({code: candidate});
        if (r.length == 0)
            return candidate;
        return (await createCode(randomIntFromInterval(10000, 99999)));
    }

    function randomIntFromInterval(min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
})
router.post("/addUser", checkAdmin, async (req, res, next) => {
r=await req.knex("t_users").insert(req.body, "*");
    res.json({id:r[0].id, list:await getUsers(req)});
});
router.post("/addVote", checkAdmin, async (req, res, next) => {
    r=await req.knex("t_vote").insert(req.body, "*");
    res.json({id:r[0].id, list:await getVotes(req)});
});
router.post("/addRaiting", checkAdmin, async (req, res, next) => {
    r=await req.knex("t_raiting").insert( req.body,"*");
    res.json({id:r[0].id, list:await getRaiting(req)});
});

async function getVotes(req){
    var r= await req.knex.select("*").from("t_vote").where({isDeleted:false}).orderBy("id");
    return r;
}
async function getRaiting(req) {
    var r= await req.knex.select("*").from("t_raiting").where({isDeleted:false}).orderBy("id");
}
router.post("/deleteVote", checkAdmin, async (req, res, next) => {
    let r=await req.knex("t_vote").update({isDeleted:true},"*").where({id:req.body.id});
    res.json({id:r[0].id});
});

router.post("/deleteRaiting", checkAdmin, async (req, res, next) => {
    let r=await req.knex("t_raiting").update({isDeleted:true},"*").where({id:req.body.id});
    res.json({id:r[0].id});
});


router.post("/startVote", checkAdmin, async (req, res, next) => {
    let r=await req.knex("t_vote").update({isactive:req.body.isactive},"*").where({id:req.body.id});
    res.json(r[0]);
});
router.post("/startRaiting", checkAdmin, async (req, res, next) => {
    let r=await req.knex("t_raiting").update({isactive:req.body.isactive},"*").where({id:req.body.id});
    res.json(r[0]);
});
router.post("/resultVote", checkAdmin, async (req, res, next) => {
    let r=await req.knex("t_vote").update({iscompl:req.body.iscompl},"*").where({id:req.body.id});
    res.json(r[0]);
});

router.post("/resultRaiting", checkAdmin, async (req, res, next) => {
    let r=await req.knex("t_raiting").update({iscompl:req.body.iscompl},"*").where({id:req.body.id});
    res.json(r[0]);
});
router.get("/votes", checkAdmin, async (req, res, next) => {
    let r=await req.knex.select("*").from("t_vote").where({isDeleted:false}).orderBy("id");
    for(let item of r){
         item.answers=await( req.knex.select("*").from("t_voteanswers").where({voteid:item.id, isDeleted:false}).orderBy("id"));
    }
    res.json(r);
});
router.get("/raiting", checkAdmin, async (req, res, next) => {
    let r=await req.knex.select("*").from("t_raiting").where({isDeleted:false}).orderBy("id");
    for(let item of r){
        item.answers=await( req.knex.select("*").from("t_raitinganswers").where({raitingid:item.id, isDeleted:false}).orderBy("id"));
    }
    res.json(r);
});

router.post("/addAnswer", checkAdmin, async (req, res, next) => {
    let r = await req.knex("t_voteanswers").insert({voteid:req.body.id}, "*");
    res.json(r[0])
})

router.post("/addRaitingAnswer", checkAdmin, async (req, res, next) => {
    let r = await req.knex("t_raitinganswers").insert({raitingid:req.body.id}, "*");
    res.json(r[0])
})
router.post("/changeAnswer", checkAdmin, async (req, res, next) => {
    let r = await req.knex("t_voteanswers").update({title:req.body.title}, "*").where({id:req.body.id});
    res.json(r[0])
})

router.post("/answRaitingChange", checkAdmin, async (req, res, next) => {
    let r = await req.knex("t_raitinganswers").update({title:req.body.title}, "*").where({id:req.body.id});
    res.json(r[0])
})
router.post("/deleteAnswer", checkAdmin, async (req, res, next) => {
    let r = await req.knex("t_voteanswers").update({isDeleted:true}, "*").where({id:req.body.id});
    res.json(r[0])
})

router.post("/deleteRaitingAnswer", checkAdmin, async (req, res, next) => {
    let r = await req.knex("t_raitinganswers").update({isDeleted:true}, "*").where({id:req.body.id});
    res.json(r[0])
})

router.post("/aVote", checkAdmin, async (req, res, next) => {
    let r = await req.knex.select("*").from("t_voteanswers").where({id:req.body.id});

     r= await req.knex("t_voteanswers").update({count:(r[0].count+1)}, "*").where({id:req.body.id});
    res.json(r[0])
})
router.post("/raitingVote", async (req, res, next) => {
   for(let a of req.body.arr){
       //console.log("update t_raitinganswers set count=count+"+a.value+" where id="+a.id)
       let r=await req.knex.raw("update t_raitinganswers set count=count+"+a.value+" where id="+a.id)
   }

  res.json("ok");
})


router.post("/rVote", checkAdmin, async (req, res, next) => {
    let r = await req.knex.select("*").from("t_raitinganswers").where({id:req.body.id});

    r= await req.knex("t_raitinganswers").update({count:(r[0].count+1)}, "*").where({id:req.body.id});
    res.json(r[0])
})
router.post("/changeChatAnswer", checkAdmin, async (req, res, next) => {
    let r= await req.knex("t_chat").update({answer:req.body.answer}, "*").where({id:req.body.id});
    res.json(r[0])
})

router.post("/reVote", checkLogin, async (req, res)=>{
    try {
        let r = await req.knex.select("*").from("t_voteanswers").where({id: req.body.id});
        let count=r[0].count - 1;

        if(count<0)
            count =0;
        r = await req.knex("t_voteanswers").update({count:count }, "*").where({id: req.body.id});
        res.json(r[0])
    }
    catch (e){
        console.warn(e);
        res.json("error");
    }
})
router.post("/vote", checkLogin, async (req, res)=>{
    try {
       /* let r = await req.knex.select("*").from("t_voteanswers").where({id: req.body.id});
        let count=r[0].count + 1;
        r = await req.knex("t_voteanswers").update({count:count }, "*").where({id: req.body.id});

        */
        try {
            let r = await req.knex.raw("UPDATE t_voteanswers SET count=count+1 WHERE id=" + req.body.id)
            res.json(r[0])
        }catch (e){
            res.sendStatus(404)
        }
    }
    catch (e){
        console.warn(e);
        res.json("error");
    }
})

router.post("/changeStatus", checkAdmin, async (req, res, next) => {

    let r= await req.knex("t_status").update(req.body, "*");
    console.log(req.body, r[0]);
    res.json(r[0])
})
router.post("/stat", async (req, res, next) => {
    return res.json(299);

    if (!req.session["user"])
        return res.sendStatus(401);
    req.updateUser(req.session["user"]);
    return res.json(299);
});

router.get("/logs" , checkAdmin, async (req, res, next) => {
   var r= await req.knex.select("date", "count").from("t_log").orderBy("id","desc").limit(200);

   return res.json({users:req.users, logs:r});
});
router.get("/iframe" , checkLogin, async (req, res, next) => {
    return res.render("iframe");
});

router.post("/changeQApproved", checkAdmin, async (req, res, next) => {

    let r= await req.knex("t_q").update({isApproved:req.body.isApproved},"*").where({id:req.body.id});
    res.json(r[0])
})
router.post("/changeQSpk", checkAdmin, async (req, res, next) => {

    let r= await req.knex("t_q").update({isSpk:req.body.isSpk},"*").where({id:req.body.id});
    res.json(r[0])
})









module.exports = router;
