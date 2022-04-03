
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
})();

async function logout(){
    clearTimeout(statusTimeout);
    var dt=await axios.get("/api/logout");
    if(dt.data.success)
        window.location.reload();
}
