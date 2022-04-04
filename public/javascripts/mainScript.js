
(()=>{
let app=new Vue({
    el:"#app",
    data:{
        isQActive:false,
        q:[],
        chat:[],
        qText:"",
        chatText:[],
        isLoading:false
    },
    methods:{
        chatSend:async function(){
            this.isLoading=true;
            try{
                var r=await axios.post("/api/chatSend",{text:this.chatText});
                this.chat.push(r.data);
                var objDiv = document.getElementById("chatBox");
                if (objDiv)
                    setTimeout(function () {
                        objDiv.scrollTop = objDiv.scrollHeight;
                    }, 0)
                this.chatText="";
            }
            catch (e){
                console.warn(e);
            }
            finally {
                setTimeout(()=>{this.isLoading=false;},2000)

            }

        },
        qSend:async function(){
            this.isLoading=true;
            try{
                var r=await axios.post("/api/qSend",{text:this.qText});
                this.q.push(r.data);
                var objDiv = document.getElementById("qBox");
                if (objDiv)
                    setTimeout(function () {
                        objDiv.scrollTop = objDiv.scrollHeight;
                    }, 0)
                this.qText="";
            }
            catch (e){
                console.warn(e);
            }
            finally {
                setTimeout(()=>{this.isLoading=false;},2000)

            }

        },
        updateStatus:async function(){
            var d=await axios.get("/vcbr/status/");

            var inserted=false;
            d.data.chat.forEach(c=>{

                if(this.chat.filter(cc=>cc.id==c.id).length==0) {
                    this.chat.push(c);
                    inserted=true;
                }
            });
            this.chat.forEach(cc=>{
                if(d.data.chat.filter(c=>cc.id==c.id).length==0)
                {
                    cc.isDeleted=true;
                }
            })
            this.chat= this.chat.filter(cc=>{return !cc.isDeleted || cc.userid==user.id})
            if(inserted)
                var objDiv = document.getElementById("chatBox");
            if (objDiv)
                setTimeout(function () {
                    objDiv.scrollTop = objDiv.scrollHeight;
                }, 0)
            /////////////

            inserted=false;
            d.data.q.forEach(c=>{

                if(this.q.filter(cc=>cc.id==c.id).length==0) {
                    this.q.push(c);
                    inserted=true;
                }
            });
            this.q.forEach(cc=>{
                if(d.data.q.filter(c=>cc.id==c.id).length==0)
                {
                    cc.isDeleted=true;
                }
            })
            this.q= this.q.filter(cc=>{return !cc.isDeleted || cc.userid==user.id})
            if(inserted)
                var objDiv = document.getElementById("qBox");
            if (objDiv)
                setTimeout(function () {
                    objDiv.scrollTop = objDiv.scrollHeight;
                }, 0)
            ////////////

            setTimeout(()=>{
               this.updateStatus();
            }, 20*1000)
        }
    },
    mounted:function (){
        console.log("isWorked");
        document.getElementById("chatInput").addEventListener("keyup", (e)=>{
            if(e.code=="Enter")
                this.chatSend();
        })
        document.getElementById("qInput").addEventListener("keyup", (e)=>{
            if(e.code=="Enter")
                this.qSend();
        })
        this.updateStatus();
    }
});
document.querySelector(".up").addEventListener("click",()=>{
    //document.body.scrollTop = document.documentElement.scrollTop = 0;
    window.scrollTo({top: 0, behavior: 'smooth'});
})


    var observer = new IntersectionObserver((entries, observer)=>
        {if(entries[0].isIntersecting)
            document.querySelector('.up').classList.add('hidden')
        else
            document.querySelector('.up').classList.remove('hidden')
        }, {root: null, rootMargin: '10px', threshold: [0.0, 0.0]});
    observer.observe(document.querySelector('.headerBox'));

})();

async function logout(){
    var dt=await axios.get("/api/logout");
    if(dt.data.success)
        window.location.reload();
}
function scrollToElement(elemId){
    var elem=document.getElementById(elemId);
    scrollToSmoothly(elem.offsetTop,600);
}
function scrollToSmoothly(pos, time) {
    var currentPos = window.pageYOffset;
    var start = null;
    if(time == null) time = 500;
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


