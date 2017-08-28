/**
 * Created by Brisy on 2017/6/15.
 */
function sqltool() {

}



sqltool.prototype = {

    // 插入语句
    insertSql: function(tableName, args) {
        var keys = Object.keys(args);
        keys = keys.sort();
        var values = [];
        var tag = '?';
        for (var i=0; i<keys.length; i++) {
            values.push(tag);
        }
        var sql = 'INSERT INTO ' + '`' + tableName + '`' + ' ( ' + keys.toString() + ' )' + ' VALUES ' + '( ' + values.toString() + ' );';
        return sql;
    },


    // sql 参数
    sqlParams: function (args) {
        var keys = Object.keys(args);
        keys = keys.sort()
        var params = [];
        keys.map(function (key) {
            var model = args[key];
            if (key == 'watermark') {
                model = JSON.stringify(model);
            }
            params.push(model);
        })
        return params;
    },


    // 根据主键查询语句
    selectSql: function (tableName, key, value) {
        var type = typeof value;
        var sql;
        if (type == 'number') {
            sql = 'SELECT * FROM ' + '`' + tableName + '`' + ' WHERE ' + key +  '=' + value;
        } else {
            sql = 'SELECT * FROM ' + '`' + tableName + '`' + ' WHERE ' + key +  '='  + '\"'  + value + '\"';
        }
        return sql;
    },


    // 更新SQL语句
    updateSql: function (tableName, args, key) {
        var keys = Object.keys(args);
        keys = keys.sort();
        var tag = '=?';
        var arr = [];
        keys.map(function (item) {
            var model = item + tag;
            arr.push(model);
        })
        var sql = 'UPDATE ' + '`' + tableName + '`' + ' SET ' + arr.toString() + ' WHERE ' + key + tag + ';'
        return sql;
    },


    // 删除SQL
    deleteSql: function (tableName, key, value) {
        var type = typeof key;
        var sql;
        if (type == 'number') {
            sql = 'DELETE FROM ' + '`' + tableName + '`' + ' WHERE ' + key + '=' + value + ';';
        } else {
            sql = 'DELETE FROM ' + '`' + tableName + '`' + ' WHERE ' + key + '=' + '\"' + value + '\"' + ';';
        }

        return sql;
    }

}




















sqltool.prototype.constructor = sqltool;
module.exports = new sqltool();