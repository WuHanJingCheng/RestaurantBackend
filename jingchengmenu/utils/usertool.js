/**
 * Created by Brisy on 2017/6/25.
 */
var sqltool = require('./sqltool');
var mysqltool = require('./mysqltool');
var request = require('request');
var async = require('async');
var md5 = require('md5');


function usertool() {

}




usertool.prototype = {


    // 注册
    register: function (args) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                function (callback) {
                    var temp = md5(new Date().getTime()).toLowerCase();
                    var user_id = temp.substring(0, temp.length-14);
                    console.log(user_id);
                    args.user_id = user_id;
                    var sql = sqltool.insertSql('user', args);
                    var params = sqltool.sqlParams(args);
                    mysqltool.queryParam(sql, params, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, user_id);
                    });
                },
                function (insertId, callback) {
                    var sql = sqltool.selectSql('user', 'user_id', insertId);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) {
                            var user = results[0];
                            callback(null, user);
                        }
                    });
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            });
        });
    },



    // 账号登录
    loginWithAccount: function (account, password) {
        return new Promise(function (resolved, rejected) {
            var sql = 'SELECT * FROM user WHERE account=\"' + account + '\" && password=\"' + password + '\";';
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results && results.length > 0) {
                    resolved(results[0]);
                } else {
                    var err = new Error('login fail.');
                    rejected(err);
                }
            });
        });
    },


    // 删除子账号
    deleteSubAccount: function (user_id) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                function (callback) {
                    var sql = sqltool.selectSql('user', 'user_id', user_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results) callback(null, results);
                    })
                },
                function (results, callback) {
                    if (results && results.length > 0) {
                        var sql = sqltool.deleteSql('user', 'user_id', user_id);
                        mysqltool.query(sql, function (err, result) {
                            if (err) callback(err, null);
                            if (result) callback(null, {user_id: user_id});
                        });
                    } else {
                        var err = new Error('can not find account user_id equalTo ' + user_id);
                        callback(err, null);
                    }
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            })
        });
    },


    // 根据账号查找用户
    getUser: function (account) {
        return new Promise(function (resolved, rejected) {
            async.series({
                one: function (callback) {
                    var sql = sqltool.selectSql('user', 'account', account);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results.length == 0) {
                            callback(null, {result: 'available'});
                        } else if (results.length > 0) {
                            callback(null, {result: 'unavailable'});
                        } else {
                            var err = new Error('can not find account equalTo ' + account);
                            callback(err, null);
                        }
                    });
                },
                two: function (callback) {
                    var sql = sqltool.selectSql('admin', 'account', account);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results.length == 0) {
                            callback(null, {result: 'available'});
                        } else if (results.length > 0) {
                            callback(null, {result: 'unavailable'});
                        } else {
                            var err = new Error('can not find account equalTo ' + account);
                            callback(err, null);
                        }
                    });
                }
            }, function (err, result) {
                if (err) rejected(err);
                if (result.one.result === 'available' && result.two.result === 'available') {
                    resolved({result: 'available'});
                } else if (result.one.result === 'available' || result.two.result === 'available') {
                    resolved({result: 'unavailable'});
                } else {
                    rejected(err);
                }
            })
        });
    }
}










usertool.prototype.constructor = usertool;
module.exports = new usertool();