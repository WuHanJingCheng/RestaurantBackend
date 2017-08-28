/**
 * Created by Brisy on 2017/6/30.
 */
var sqltool = require('./sqltool');
var mysqltool = require('./mysqltool');
var async = require('async');
var request = require('request');
const leanAppId = 'siAIt9R7uO9RSoHIXJU9SQpN-gzGzoHsz';
const leanAppKey = 'hKEIFUiCBdWWAYHj6d3u2dgF';
var md5 = require('md5');


function admintool() {

}




admintool.prototype = {


    // 注册
    register: function (args) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                function (callback) {
                    var temp = md5(new Date().getTime());
                    var admin_id = temp.substring(0, temp.length-14);
                    args.admin_id = admin_id;
                    var sql = sqltool.insertSql('admin', args);
                    var params = sqltool.sqlParams(args);
                    mysqltool.queryParam(sql, params, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, admin_id);
                    });
                },
                function (insertId, callback) {
                    var sql = sqltool.selectSql('admin', 'admin_id', insertId);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) {
                            var admin = results[0];
                            // 屏蔽掉密码
                            delete admin.password;
                            callback(null, admin);
                        }
                    });
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            });
        });
    },


    // 管理员登录
    loginWithAdmin: function (account, password) {
        return new Promise(function (resolved, rejected) {
            var sql = 'SELECT * FROM admin WHERE account=\"' + account + '\" && password=\"' + password + '\";';
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results && results.length > 0) {
                    var admin = results[0];
                    delete admin.password;
                    resolved(admin);
                } else {
                    var err = new Error('login fail.');
                    rejected(err);
                }
            });
        });
    },


    // 获取子账号列表
    subAccountList: function (admin_id) {
        return new Promise(function (resolved, rejected) {
            var sql = sqltool.selectSql('user', 'admin_id', admin_id);
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results) {
                    resolved(results);
                } else {
                    var err = new Error('return empty.');
                    rejected(err);
                }
            });
        });
    },


    // 获取验证码
    requestSmsCode: function (mobilePhoneNumber, op) {
        return new Promise(function (resolved, rejected) {
            var url = 'https://api.leancloud.cn/1.1/requestSmsCode';
            var json = {
                mobilePhoneNumber: mobilePhoneNumber,
                ttl: 10,
                name: '精诚点餐',
                op: op
            }
            request({
                url: url,
                json: json,
                method: 'POST',
                headers: {
                    'X-LC-Id': leanAppId,
                    'X-LC-Key': leanAppKey,
                    'Content-type': 'application/json'
                }
            }, function (err, response, result) {
                if (err) rejected(err);
                if (response.statusCode == 200) {
                    resolved({code: 'success'});
                } else {
                    var err = new Error('send sms fail.');
                    rejected(err);
                }
            });
        });
    },


    // 校验验证码
    verifySmsCode: function (mobilePhoneNumber, smsCode) {
        return new Promise(function (resolved, rejected) {
            var url = 'https://api.leancloud.cn/1.1/verifySmsCode/' + smsCode + '?mobilePhoneNumber=' + mobilePhoneNumber;
            request({
                url: url,
                method: 'POST',
                headers: {
                    'X-LC-Id': leanAppId,
                    'X-LC-Key': leanAppKey,
                    'Content-type': 'application/json'
                }
            }, function (err, response, result) {
                if (err) rejected(err);
                if (response.statusCode == 200) {
                    resolved({code: 'success'});
                } else {
                    var err = new Error('verify smsCode fail.');
                    rejected(err);
                }
            });
        });
    },



    // 重置密码
    resetPassword: function (mobilePhoneNumber) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                function (callback) {
                    var sql = sqltool.selectSql('admin', 'mobilePhoneNumber', mobilePhoneNumber);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results) callback(null, results);
                    });
                },
                function (results, callback) {
                    if (results && results.length > 0) {
                        var admin = results[0];
                        var args = {
                            password: '000000'
                        }
                        var sql = sqltool.updateSql('admin', args, 'admin_id');
                        var params = sqltool.sqlParams(args);
                        params.push(admin.admin_id);
                        mysqltool.queryParam(sql, params, function (err, result) {
                            if (err) callback(err, null);
                            if (result) callback(null, result);
                        });
                    } else {
                        var err = new Error('can not find account include mobilePhoneNumber equalTo ' + mobilePhoneNumber);
                        callback(err, null);
                    }
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved({code: 'password reset success.'});
            })
        });
    },


    // 修改密码
    modifyPassword: function (admin_id, password) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                function (callback) {
                    var args = {
                        password: password
                    };
                    var sql = sqltool.updateSql('admin', args, 'admin_id');
                    var params = sqltool.sqlParams(args);
                    params.push(admin_id);
                    mysqltool.queryParam(sql, params, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, admin_id);
                    });
                },
                function (admin_id, callback) {
                    var sql = sqltool.selectSql('admin', 'admin_id', admin_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) callback(null, results[0]);
                    })
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            })
        });
    },



    // 更换手机号
    changeMobilePhone: function (account, mobilePhoneNumber) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                function (callback) {
                    var args = {mobilePhoneNumber: mobilePhoneNumber};
                    var sql = sqltool.updateSql('admin', args, 'account');
                    var params = sqltool.sqlParams(args);
                    params.push(account);
                    mysqltool.queryParam(sql, params, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, result);
                    });
                },
                function (result, callback) {
                    var sql = sqltool.selectSql('admin', 'account', account);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) callback(null, results[0]);
                    });
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            })
        });
    }
}















admintool.prototype.constructor = admintool;
module.exports = new admintool();