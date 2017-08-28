/**
 * Created by Brisy on 2017/6/25.
 */


function util() {

}



util.prototype = {

    // 生成指定长度的字符串
    randomStr: function (a) {
        var d,
            e,
            b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            c = "";
        for (d = 0; a > d; d += 1)
            e = Math.random() * b.length, e = Math.floor(e), c += b.charAt(e);
        return c
    },


    // 设置时间格式
    formatDate: function(now)   {
        var s = '';
        var   year=now.getFullYear();
        var   month=now.getMonth()+1;
        if (parseInt(month) < 10) {
            month = '0' + month;
        }
        var   date=now.getDate();
        if (parseInt(date) < 10) {
            date = '0' + date;
        }
        var   hour=now.getHours();
        if (parseInt(hour) < 10) {
            hour = '0' + hour;
        }
        var   minute=now.getMinutes();
        if (parseInt(minute) < 10) {
            minute = '0' + minute;
        }
        var   second=now.getSeconds();
        if(parseInt(second)<10){
            second = '0'+second;
        }
        return s + year + month + date + hour + minute + second;
    }
}









util.prototype.constructor = util;
module.exports = new util();