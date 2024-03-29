(() => {
    let app = new Vue({
        el: "#app",
        data: {
            activeSect: 1,
            q: [],
            chat: [],
            qText: "",
            chatText: [],
            users: [],
            isLoading: false,
            userF: "",
            userI: "",
            userCode: 0,
            votes: [],
            voteTitle: "",
            status:{id:1,q:false},
            logs:{users:[], logs:[]},
            isLogShow:false,
            dept:[],
            raiting:[],
            raitingTitle:""
        },
        methods: {
            changeQApproved:async function(item){
                item.isApproved=!item.isApproved;
                var r =await axios.post("/api/changeQApproved", item);
                this.q.forEach(q=>{
                    if(q.id==item.id)
                        item=r.data;
                })
            },
            changeQSpk:async function(item){
                item.isSpk=!item.isSpk;
                var r =await axios.post("/api/changeQSpk", item);
                this.q.forEach(q=>{
                    if(q.id==item.id)
                        item=r.data;
                })
            },
            changeStatus:async function(item){
                var r =await axios.post("/api/changeStatus", item);
                this.status=r.data;
            },
            changeChatAnswer:async function(item){
                await axios.post("/api/changeChatAnswer", {id: item.id, answer:item.answer});
            },
            aVote: async function (item) {
                var r = await axios.post("/api/aVote", {id: item.id});
                this.votes.forEach(v => {
                    if (v.id == r.data.voteid)
                        v.answers.forEach(a => {
                            if (a.id == r.data.id)
                                a.count = r.data.count;
                        })
                })
            },

            rVote: async function (item) {
                var r = await axios.post("/api/rVote", {id: item.id});
                this.raiting.forEach(v => {
                    if (v.id == r.data.voteid)
                        v.answers.forEach(a => {
                            if (a.id == r.data.id)
                                a.count = r.data.count;
                        })
                })
            },
            deleteAnswer: async function (item) {
                var r = await axios.post("/api/deleteAnswer", {id: item.id});
                this.votes.forEach(v => {
                    if (v.id == r.data.voteid)
                        v.answers = v.answers.filter(a => a.id != r.data.id);
                })
            },
            deleteRaitingAnswer: async function (item) {
                var r = await axios.post("/api/deleteRaitingAnswer", {id: item.id});
                this.raiting.forEach(v => {
                    if (v.id == r.data.raitingid)
                        v.answers = v.answers.filter(a => a.id != r.data.id);
                })
            },
            answChange: async function (item,) {
                await axios.post("/api/changeAnswer", {id: item.id, title: item.title});

            },
            answRaitingChange: async function (item,) {
                await axios.post("/api/answRaitingChange", {id: item.id, title: item.title});

            },
            getAnswProc: function (item, count) {

                var total = 0;
                item.answers.forEach(a => {
                    total += a.count
                });
                if (total == 0)
                    return "0%"
                var perc = (parseFloat(count) / parseFloat(total) * 100);
                return perc.toPrecision(4) + "%"

            },
            addAnswer: async function (item) {
                var r = await axios.post("/api/addAnswer", {id: item.id});
                item.answers.push(r.data);
            },
            addRaitingAnswer: async function (item) {
                var r = await axios.post("/api/addRaitingAnswer", {id: item.id});
                item.answers.push(r.data);
            },
            resultVote: async function (item) {
                var r = await axios.post("/api/resultVote", {iscompl: !item.iscompl, id: item.id});
                item.iscompl = r.data.iscompl;
            },

            resultRaiting: async function (item) {
                var r = await axios.post("/api/resultRaiting", {iscompl: !item.iscompl, id: item.id});
                item.iscompl = r.data.iscompl;
            },
            startVote: async function (item) {
                var r = await axios.post("/api/startVote", {isactive: !item.isactive, id: item.id});
                item.isactive = r.data.isactive;
            },

            startRaiting: async function (item) {
                var r = await axios.post("/api/startRaiting", {isactive: !item.isactive, id: item.id});
                item.isactive = r.data.isactive;
            },
            deleteVote: async function (item) {
                if (!confirm("Удалить голосование?"))
                    return;
                var r = await axios.post("/api/deleteVote", {id: item.id});
                this.votes = this.votes.filter(v => v.id != r.data.id);
            },
            deleteRaiting: async function (item) {
                if (!confirm("Удалить рейтинг?"))
                    return;
                var r = await axios.post("/api/deleteRaiting", {id: item.id});
                this.raiting = this.raiting.filter(v => v.id != r.data.id);
            },
            addVote: async function () {
                if (this.voteTitle.length == 0)
                    return;
                var r = await axios.post("/api/addVote", {title: this.voteTitle});
                this.votes = r.data.list;
                console.log(this.votes);
                setTimeout(() => {
                    var elem = document.getElementById("vote" + r.data.id);
                    console.log(elem, elem.offsetTop);
                    elem.parentNode.scrollTop = elem.offsetTop - 60 - elem.clientHeight;
                    this.voteTitle = "";
                }, 0)
            },
            addRaiting: async function () {

                var r = await axios.post("/api/addRaiting",{title:this.raitingTitle});
                this.raiting = r.data.list;
                console.log(this.raiting);
                setTimeout(() => {
                    var elem = document.getElementById("raiting" + r.data.id);
                    elem.parentNode.scrollTop = elem.offsetTop - 60 - elem.clientHeight;
                    this.raitingTitle=""
                }, 0)
            },
            addUser: async function () {

                if (this.userF.length == 0 || this.userI.length == 0)
                    return;
                var r = await axios.post("/api/addUser", {f: this.userF, i: this.userI, code: this.userCode});
                this.users = r.data.list;
                this.userF = ""
                this.userI = ""
                setTimeout(() => {
                    var elem = document.getElementById("user" + r.data.id);
                    console.log(elem, elem.offsetTop);
                    elem.parentNode.scrollTop = elem.offsetTop - 60 - elem.clientHeight;

                }, 0)
            },
            deleteAllQ: async function (item) {
                for (let item of this.q)
                    await this.deleteQ(item);
            },
            deleteQ: async function (item) {
                var r = await axios.post("/api/qDelete", {id: item.id});
                this.q = this.q.filter(c => c.id != r.data)
            },
            deleteAllchat: async function (item) {
                for (let item of this.chat)
                    await this.deleteChat(item);
            },
            deleteChat: async function (item) {
                var r = await axios.post("/api/chatDelete", {id: item.id});
                this.chat = this.chat.filter(c => c.id != r.data)
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
                    var d = await axios.get("/vcbr/status/");

                    this.status = d.data.status;
                    var inserted = false;
                    var focused = false;
                    document.querySelectorAll(".qItem textarea").forEach(e => {
                        if (document.activeElement == e)
                            focused = true;
                    })
                    if (!focused) {
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
                        this.chat = this.chat.filter(cc => {
                            return !cc.isDeleted
                        })
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
                        return !cc.isDeleted
                    })

                    focused = false;
                    document.querySelectorAll(".qVoteAnswerWr input").forEach(e => {
                        if (document.activeElement == e)
                            focused = true;
                    })
                    if (!focused)
                        this.votes = (await axios.get("/api/votes")).data;
                    ////////////

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
                        return !cc.isDeleted
                    })

                    focused = false;
                    document.querySelectorAll(".qVoteAnswerWr input").forEach(e => {
                        if (document.activeElement == e)
                            focused = true;
                    })
                    if (!focused)
                        this.votes = (await axios.get("/api/votes")).data;

                    focused = false;
                    document.querySelectorAll(".qRaitingAnwerItem input").forEach(e => {
                        if (document.activeElement == e)
                            focused = true;
                    })
                    if (!focused)
                        this.raiting = (await axios.get("/api/raiting")).data;
                    ////////////
                } catch(e){
                    console.warn(e);
                }

                setTimeout(() => {
                    this.updateStatus();
                }, 5 * 1000)
            },
            updateUsers: async function () {
                this.users = (await axios.get("/api/users")).data;
                console.log(this.users);
            },
            updateDept:async function(){
                var r= await axios.get("/api/depatments");
                this.dept=r.data;
            },
            updateRaiting:async function(){
                var r= await axios.get("/api/raiting");
                this.raiting=r.data;
            },
            changeDept:async function(item){
                var r= await axios.post("/api/depatments", item);

            },
            updateLogs:async function(){
                var r= await axios.get("/api/logs");
                this.logs=r.data;
                document.getElementById("chart").innerHTML="";
                var chart = anychart.line();
                var data=[];

                r.data.logs.reverse().forEach(v=>{
                    data.push([moment(v.date).format("HH:mm"), v.count])
                });
                // set the data
                chart.data(data);
                // set chart title
                chart.title("статистика");
                // set the container element
                chart.container("chart");
                // initiate chart display
                chart.draw();
            }
        },
        watch: {

            activeSect: async function (val) {
                if (val == 4) {
                    this.updateUsers();
                    this.userCode = (await axios.get("/api/newUserCode")).data;
                }
                if (val == 5) {
                    this.updateLogs();

                }
                if (val == 6) {
                    this.updateDept();

                }
                if (val == 7) {
                    this.updateRaiting();

                }
            }
        },
        mounted: function () {
            console.log("isWorked");
            document.getElementById("chatInput").addEventListener("keyup", (e) => {
                if (e.code == "Enter")
                    this.chatSend();
            })
            document.getElementById("qInput").addEventListener("keyup", (e) => {
                if (e.code == "Enter")
                    this.qSend();
            })
            this.updateStatus();
        }
    });


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


