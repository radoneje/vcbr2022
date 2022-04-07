const humanizeDuration = require("humanize-duration");
const moment = require("moment");
const fs = require('fs')
var dayjs = require('dayjs')
require('dayjs/locale/ru')

dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))

dayjs.tz.setDefault("Europe/Moscow")
var relativeTime = require('dayjs/plugin/relativeTime')

//require('dayjs/locale/ru')
var duration = require('dayjs/plugin/duration')
dayjs.extend(duration)
dayjs.extend(relativeTime)

var end=moment(new Date('2022-04-12T06:30:00Z'))

var x = dayjs()
var y = dayjs()

async function setTime(){
    var start=moment(new Date()).unix();

    var mom=moment.utc(moment().diff(end));
    var h=mom.format("d");
    if(h>5)
        h=h+ " дней";
    if(h==4 || h==3 || h==2 )
        h=h+ " дня";
    if(h==1 )
        h=h+ " дeнь";
    if(h==0)
        h="";

    var text=(h+ " " +mom.format("HH:mm:ss"));
    fs.writeFileSync('/tmp/dateBuf.txt', text)
    fs.renameSync('/tmp/dateBuf.txt', '/tmp/date.txt')
    setTimeout(setTime,500);
}

setTime();
