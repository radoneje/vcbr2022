const humanizeDuration = require("humanize-duration");
const moment = require("moment");
const fs = require('fs')


var end=moment(new Date('2022-04-12T06:30:00Z'))


function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}
async function setTime(){
    var start=moment()

    var dur=moment.duration(end-start);
    var d=dur.days();

    if(d>5)
        d=d+ " дней";
    if(d==4 || d==3 || d==2 )
        d=d+ " дня";
    if(d==1 )
        d=d+ " дeнь";
    if(d==0)
        d="";

    var text=(d+ " " +pad(dur.hours(),2)+":"+pad(dur.minutes(),2)+":"+pad(dur.seconds(),2));
    fs.writeFileSync('/tmp/dateBuf.txt', text)
    fs.renameSync('/tmp/dateBuf.txt', '/tmp/date.txt')
    setTimeout(setTime,500);
}

setTime();
