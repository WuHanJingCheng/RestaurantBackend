/**
 * Created by Brisy on 2017/6/25.
 */
var sqltool = require('./sqltool');
var mysqltool = require('./mysqltool');
var async = require('async');
var util = require('./util');


function redistool() {

}



redistool.prototype = {

    set: function (key, value, user_id, expire, callback) {
        // 先查找对应的session是否存在
        var sql = sqltool.selectSql('redis', 'user_id', user_id);
        mysqltool.query(sql, function (err, results) {
            if (err) callback(err, null);
            if (results && results.length > 0) {
                // 如果存在, 更新session
                var temp = results[0];
                var args = {
                    token: key,
                    session: value,
                    expires_in: temp.expires_in,
                    timestamp: temp.timestamp
                }
                async.waterfall([
                    function (callback) {
                        var sql = sqltool.updateSql('redis', args, 'user_id');
                        var params = sqltool.sqlParams(args);
                        params.push(user_id);
                        mysqltool.queryParam(sql, params, function (err, result) {
                            if (err) callback(err, null);
                            if (result) callback(null, user_id);
                        });
                    },
                    function (user_id, callback) {
                        var sql = sqltool.selectSql('redis', 'user_id', user_id);
                        mysqltool.query(sql, function (err, results) {
                            if (err) callback(err, null);
                            if (results && results.length > 0) callback(null, results[0]);
                        });
                    }
                ], function (err, result) {
                    if (err) callback(err, null);
                    if (result) callback(null, result);
                });
            } else {
                // 如果不存在, 添加新的session
                var timestamp = parseInt(new Date().getTime()/1000).toString();
                var args = {
                    token: key,
                    session: value,
                    expires_in: 604800,
                    timestamp: timestamp,
                    user_id: user_id
                }
                var sql = sqltool.insertSql('redis', args);
                var params = sqltool.sqlParams(args);
                mysqltool.queryParam(sql, params, function (err, result) {
                    if (err) callback(err, null);
                    if (result) callback(null, args);
                });
            }
        });
    },

    get: function (key, callback) {
        var now = parseInt(new Date().getTime()/1000).toString();
        var sql = sqltool.selectSql('redis', 'token', key);
        mysqltool.query(sql, function (err, results) {
            if (err) callback(err, null);
            if (results && results.length > 0) {
                var session = results[0];
                var expires_in = parseInt(session.expires_in);
                var timestamp = parseInt(session.timestamp);
                var delta = now - timestamp;
                if (delta > expires_in) {
                    // 过期
                    var err = new Error('token is expire');
                    callback(err, null);
                } else {
                    // 没有过期
                    callback(null, 'OK');
                }
            }
        });
    },

    // 刷新token
    update: function (user_id, args, callback) {
        async.waterfall([
            function (callback) {
                var sql = sqltool.updateSql('redis', args, 'user_id');
                var params = sqltool.sqlParams(args);
                params.push(user_id);
                mysqltool.queryParam(sql, params, function (err, result) {
                    if (err) callback(err, null);
                    if (result) callback(null, user_id);
                });
            },
            function (user_id, callback) {
                var sql = sqltool.selectSql('redis', 'user_id', user_id);
                mysqltool.query(sql, function (err, results) {
                    if (err) callback(err, null);
                    if (results) callback(null, results[0]);
                });
            }
        ], function (err, result) {
            if (err) callback(err, null);
            if (result) callback(null, result);
        })
    },



    // 验证token是否有效
    tokenIsValid: function(user_id) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                function (callback) {
                    var sql = sqltool.selectSql('redis', 'user_id', user_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) callback(null, results[0]);
                    });
                },
                function (args, callback) {
                    delete args.session;
                    var timestamp = parseInt(new Date().getTime()/1000);
                    var expires_in = args.expires_in;
                    var delta = timestamp - args.timestamp;
                    if (delta > expires_in) {
                        // 过期, 刷新token
                        args.token = util.randomStr(128);
                        args.timestamp = timestamp;
                        var sql = sqltool.updateSql('redis', args, 'user_id');
                        var params = sqltool.sqlParams(args);
                        params.push(args.user_id);
                        mysqltool.queryParam(sql, params, function (err, result) {
                            if (err) callback(err, null);
                            if (result) callback(null, args);
                        })
                    } else {
                        // 没有过期
                        callback(null, args);
                    }
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            })
        });
    }
}















redistool.prototype.constructor = redistool;
module.exports = new redistool();