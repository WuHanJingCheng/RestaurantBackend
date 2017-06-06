/**
 * Created by Brisy on 2017/6/5.
 */
function mysqltool() {

}



mysqltool.prototype = {


    // 配置
    config: function () {
        console.log('开始接入数据库');
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : 'test2sql.database.windows.net',
            user     : 'zhangxu',
            password : 'zx13797190236*',
            database : 'test1DB'
        });


        connection.connect();

        connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
            if (error) throw error;
            console.log('连接成功');
            console.log('The solution is: ', results[0].solution);
        });
    },


    // 创建表



}


mysqltool.prototype.constructor = mysqltool;
module.exports = new mysqltool();