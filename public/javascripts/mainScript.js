(() => {
    let app = new Vue({
        el: "#app",
        data: {
            isQActive: true,
            q: [],
            chat: [],
            qText: "",
            chatText: [],
            isLoading: false,
            vote: [],
            raiting: [],
            status: {},
            isLoaded: false,
            timeout: 20,
            logTimeout: 60
        },
        methods: {
            chekLikeQ: function(item){

                if(localStorage.getItem("likeQ"+item.id))
                    return false
                else
                    return true;
            },
            like:async function(item){
                if(localStorage.getItem("likeQ"+item.id))
                    return false
                item.likes++;
                localStorage.setItem("likeQ"+item.id, true)
                await axios.post("/api/likeQ",{qid:item.id});
                this.q=this.q.filter(()=>{return true})

            },
            sortRaiting: function (arr) {


            },
            getCalcPercent: function (total, count) {

                var perc = getPercent(total, count);
                return 'calc(100% - ' + perc + ')';
            },
            getPercent: function (total, count) {
                if (total == 0)
                    return "0%"
                var perc = (parseFloat(count) / parseFloat(total) * 100);
                return perc.toPrecision(4) + "%"
            },
            changeRaitingAnsf: function (raitingid, e) {

                e.target.classList.remove("error")
                let box=document.querySelector("#rating"+raitingid);
                var arr=[];
                document.querySelectorAll("#rating"+raitingid+" select").forEach(s=>{
                    console.log("in query ",s.value)
                    if(parseInt(s.value)>0) {
                        arr.push(s.value);
                    }
                })
                box.querySelectorAll("option").forEach(option=>{
                    option.removeAttribute("disabled")
                })
                box.querySelectorAll("option").forEach(option=>{
                    //if(option.value==e.target.value)
                      //  option.setAttribute("disabled","disabled")
                    arr.forEach(a=>{
                        if(option.value==a)
                            option.setAttribute("disabled","disabled")
                    })
                })

            },
            raitingVote: async function (item, $event) {
                var store = localStorage.getItem("raiting" + item.id);
                let box = document.getElementById("rating" + item.id)
                if (store) {
                    return;
                }
                let btn = box.querySelector(".raitingRowButton")
                if (box.classList.contains("active"))
                    return;

                let error = false;
                box.querySelectorAll("select").forEach(elem => {
                    console.log(elem.value)
                    if (parseInt(elem.value) < 0) {
                        elem.classList.add("error")
                        elem.focus();
                        error = true;
                    } else
                        elem.classList.remove("error")
                })
                if (error)
                    return;
                let txt = $event.target.innerHTML;
                let arr = [];
                box.querySelectorAll("select").forEach(elem => {
                    arr.push({
                        id: elem.getAttribute("raiting"),
                        value: elem.value
                    });
                })

                //btn.innerHTML = "Ваш голос учтен";
                btn.classList.add("active")
                box.querySelectorAll("select option").forEach(elem => {
                    elem.setAttribute("disabled", true)
                });
                await axios.post("/api/raitingVote", {id: item.id, arr});
                this.raiting=this.raiting.filter(()=>{return true});
                localStorage.setItem("raiting" + item.id, JSON.stringify(arr));
            },
            voiting: async function (item) {

                var store = localStorage.getItem("vote" + item.voteid);
                if (store == item.id)
                    return

                if (store) {

                    await axios.post("/api/reVote", {id: store});
                }
                await axios.post("/api/Vote", {id: item.id});
                localStorage.setItem("vote" + item.voteid, item.id);
                this.vote = this.vote.filter(v => {
                    return true
                });


            },
            checkVote: function (item) {
                var store = localStorage.getItem("vote" + item.voteid);
                return store == item.id;
            },
            chatSend: async function () {
                if (this.chatText.length < 1)
                    return;
                this.isLoading = true;
                try {
                    var r = await axios.post("/api/chatSend", {text: this.chatText});
                    this.chat.push(r.data);
                    var objDiv = document.getElementById("chatBox");
                    if (objDiv)
                        setTimeout(function () {
                            objDiv.scrollTop = objDiv.scrollHeight;
                        }, 0)
                    this.chatText = "";
                } catch (e) {
                    console.warn(e);
                } finally {
                    setTimeout(() => {
                        this.isLoading = false;
                    }, 2000)

                }

            },
            qSend: async function () {
                if (this.qText.length < 1)
                    return;
                this.isLoading = true;
                try {
                    var r = await axios.post("/api/qSend", {text: this.qText});
                    this.q.push(r.data);
                    var objDiv = document.getElementById("qBox");
                    if (objDiv)
                        setTimeout(function () {
                            objDiv.scrollTop = objDiv.scrollHeight;
                        }, 0)
                    this.qText = "";
                } catch (e) {
                    console.warn(e);
                } finally {
                    setTimeout(() => {
                        this.isLoading = false;
                    }, 2000)

                }

            },
            updateStatus: async function () {
                try {
                    let  d = await axios.get("https://front.sber.link/vcbr/status/");
                    //let d = await axios.get("/status/");
                    this.isLoaded = true;
                    this.status = d.data.status;
                    if(!this.status.q)
                        this.isQActive=false;
                    var to = parseInt(d.data.timeout);
                    if (Number.isInteger(to) && to > 5 && to < 300)
                        this.timeout = to;
                    var inserted = false;
                    d.data.chat.forEach(c => {

                        if (this.chat.filter(cc => cc.id == c.id).length == 0) {
                            this.chat.push(c);
                            inserted = true;
                        }
                    });
                    this.chat.forEach(cc => {
                        if (d.data.chat.filter(c => cc.id == c.id).length == 0) {
                            cc.isDeleted = true;
                        }
                    })
                    this.chat.forEach(cc => {
                        d.data.chat.forEach(c => {
                            if (c.id == cc.id) {
                                cc.answer = c.answer
                            }
                        });


                    })

                    this.chat = this.chat.filter(cc => {
                        return !cc.isDeleted && cc.userid == user.id
                    })

                    if (inserted) {
                        var objDiv1 = document.getElementById("chatBox");
                        if (objDiv1)
                            setTimeout(function () {
                                objDiv1.scrollTop = objDiv1.scrollHeight;
                            }, 0)
                    }
                    /////////////

                    inserted = false;

                    d.data.q.forEach(c => {

                        if (this.q.filter(cc => cc.id == c.id).length == 0) {
                            this.q.push(c);
                            inserted = true;
                        }
                    });
                    this.q.forEach(cc => {
                        if (d.data.q.filter(c => cc.id == c.id).length == 0) {
                            cc.isDeleted = true;
                        }
                    })
                    this.q = this.q.filter(cc => {
                        return !cc.isDeleted || cc.userid == user.id
                    })
                    this.q.forEach(q => {
                        d.data.q.forEach(c => {
                            if (q.id == c.id) {
                                q.isApproved = c.isApproved;
                                q.likes = c.likes;
                            }
                        })
                    })
                    this.q = this.q.filter(cc => {
                        return (cc.isApproved || cc.userid == user.id) && !cc.isDeleted;
                    })


                    if (inserted) {
                        var objDiv2 = document.getElementById("qBox");
                        if (objDiv2)
                            setTimeout(function () {
                                objDiv2.scrollTop = objDiv2.scrollHeight;
                            }, 10)
                    }
                    console.log(this.q)
                    ////////////
                    this.vote = d.data.vote
                    let tmp = d.data.raiting;
                    tmp.forEach((item) => {
                        if (item.iscompl) {
                            item.answers.sort((a, b) => {
                                return a.count - b.count
                            });
                        }
                    });
                    this.raiting=tmp;

                    setTimeout(() => {
                        this.raiting.forEach((item) => {
                            if (!item.iscompl)
                            {

                                var store = localStorage.getItem("raiting" + item.id);

                                let box = document.getElementById("rating" + item.id)
                                if (store && box) {
                                    store = JSON.parse(store);
                                    let btn = box.querySelector(".raitingRowButton")
                                    console.log(btn)
                                    if (btn) {
                                        //btn.innerHTML = "Ваш голос учтен2";
                                        btn.classList.add("active")
                                    }
                                    box.querySelectorAll("select option").forEach(elem => {

                                        elem.setAttribute("disabled", true)
                                    });

                                    store.forEach(s => {
                                        // if()
                                        let select = box.querySelectorAll("select").forEach(ss => {
                                            if (s.id == ss.getAttribute("raiting")) {
                                                ss.value = s.value;
                                            }
                                        })

                                    })
                                    // return;
                                }

                            }
                        })
                    }, 100)
                    /////
                } catch (e) {
                    console.warn(e);
                }

                setTimeout(() => {
                    this.updateStatus();
                }, this.timeout * 1000)
            },
            setRaitingText:function(item){
                var store = localStorage.getItem("raiting" + item.id);
                return store?"Ваш голос учтен":"Голосовать"

            },
            checkRaitingLast:function(item){
                var store = localStorage.getItem("raiting" + item.id);
                if(store)
                    return true
                else
                    return false;
            },
            stat: async function () {
                try {

                    var d = await axios.post("/api/stat");

                    var to = parseInt(d.data.timeout);
                    if (Number.isInteger(to) && to > 5 && to < 300)
                        this.logTimeout = to;

                } catch (e) {
                    console.warn(e)
                }
                console.log("setLogTimeout", this.logTimeout)
                setTimeout(() => {
                    this.stat();
                }, this.logTimeout * 1000);
            }
        },
        watch: {
            status: function (val) {
                //  if(!val.q)
                //     this.isQActive=false

            },
            isQActive: function (val) {
                var objDiv1 = document.getElementById("chatBox");
                if (objDiv1)
                    setTimeout(function () {
                        objDiv1.scrollTop = objDiv1.scrollHeight;
                    }, 0)
                var objDiv2 = document.getElementById("qBox");
                if (objDiv2)
                    setTimeout(function () {
                        objDiv2.scrollTop = objDiv2.scrollHeight;
                    }, 0)
            }
        },
        mounted: function () {
            document.getElementById("chatInput").addEventListener("keyup", (e) => {
                // if (e.code == "Enter")
                //     this.chatSend();
            })
            // document.getElementById("qInput").addEventListener("keyup", (e) => {
            // if (e.code == "Enter")
            //    this.qSend();
            // })

            this.updateStatus();
            this.stat();
        }
    });
    document.querySelector(".up").addEventListener("click", () => {
        //document.body.scrollTop = document.documentElement.scrollTop = 0;
        window.scrollTo({top: 0, behavior: 'smooth'});
    })


    var observer = new IntersectionObserver((entries, observer) => {
        if (entries[0].isIntersecting)
            document.querySelector('.up').classList.add('hidden')
        else
            document.querySelector('.up').classList.remove('hidden')
    }, {root: null, rootMargin: '10px', threshold: [0.0, 0.0]});
    observer.observe(document.querySelector('.headerBox'));

})();

async function logout() {
    var dt = await axios.get("/api/logout");
    if (dt.data.success)
        window.location.reload();
}

function scrollToElement(elemId) {
    var elem = document.getElementById(elemId);
    scrollToSmoothly(elem.offsetTop, 600);
}

function scrollToSmoothly(pos, time) {
    var currentPos = window.pageYOffset;
    var start = null;
    if (time == null) time = 500;
    pos = +pos, time = +time;
    window.requestAnimationFrame(function step(currentTime) {
        start = !start ? currentTime : start;
        var progress = currentTime - start;
        if (currentPos < pos) {
            window.scrollTo(0, ((pos - currentPos) * progress / time) + currentPos);
        } else {
            window.scrollTo(0, currentPos - ((currentPos - pos) * progress / time));
        }
        if (progress < time) {
            window.requestAnimationFrame(step);
        } else {
            window.scrollTo(0, pos);
        }
    });
}

function downloadFile(src, name) {
    console.log(src)
    var link = document.createElement('a');
    link.style.display = "none"
    link.href = src;
    link.download = name;
    link.dispatchEvent(new MouseEvent('click'));

}


