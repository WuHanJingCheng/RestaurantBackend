/**
 * Created by Brisy on 2017/6/30.
 */
'use strict';
var router = require('express').Router();
var admintool = require('../../utils/admintool');
var util = require('../../utils/util');
var blobtool = require('../../utils/blobtool');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const httpCode = 400;



// 注册
router.post('/register', function (req, res) {
    var body = req.body;
    var promise = admintool.register(body);
    promise.then(function (result) {
        if (result) res.json(result);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});


// 管理员登录
router.post('/login', function (req, res) {
    var query = req.query;
    var account = query.account;
    if (!account) res.status(httpCode).json({error: 'account can not be null.'});
    var password = query.password;
    if (!password) res.status(httpCode).json({error: 'password can not be null.'});
    var promise = admintool.loginWithAdmin(account, password);
    promise.then(function (result) {
        if (result) res.json(result);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});



// 获取子账号列表
router.get('/subaccount/list', function (req, res) {
    var query = req.query;
    var admin_id = query.admin_id;
    var promise = admintool.subAccountList(admin_id);
    promise.then(function (results) {
        if (results) res.json(results);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});



// 发送短信接口
router.post('/requestSmsCode', function (req, res) {
    var query = req.query;
    var mobilePhoneNumber = query.mobilePhoneNumber;
    var op = query.op;
    var promise = admintool.requestSmsCode(mobilePhoneNumber, op);
    promise.then(function (result) {
        if (result) res.json(result);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});


// 校验验证码
router.post('/verifySmsCode', function (req, res) {
    var query = req.query;
    var mobilePhoneNumber = query.mobilePhoneNumber;
    if (!mobilePhoneNumber) res.status(httpCode).json({error: 'mobilePhoneNumber can not be empty.'});
    var smsCode = query.smsCode;
    if (!smsCode) res.status(httpCode).json({error: 'smsCode can not be null.'});
    var promise = admintool.verifySmsCode(mobilePhoneNumber, smsCode);
    promise.then(function (result) {
        if (result) res.json(result);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});


// 初始化密码
router.post('/password/reset', function (req, res) {
    var query = req.query;
    var mobilePhoneNumber = query.mobilePhoneNumber;
    if (!mobilePhoneNumber) res.status(httpCode).json({error: 'mobilePhoneNumber can not be null.'});
    var promise = admintool.resetPassword(mobilePhoneNumber);
    promise.then(function (result) {
        if (result) res.json(result);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});


// 修改密码
router.post('/password/modify', function (req, res) {
    var body = req.body;
    var admin_id = body.admin_id;
    if (!admin_id) res.status(400).json({error: 'admin_id can not be null.'});
    var password = body.password;
    if (!password) res.status(httpCode).json({error: 'password can not be null.'});
    var promise = admintool.modifyPassword(admin_id, password);
    promise.then(function (result) {
        if (result) res.json(result);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});


// 更换手机号
router.post('/changeMobilePhone', function (req, res) {
    var query = req.query;
    var mobilePhoneNumber = query.mobilePhoneNumber;
    if (!mobilePhoneNumber) res.status(httpCode).json({error: 'mobilePhoneNumber can not be null.'});
    var account = query.account;
    if (!account) res.status(httpCode).json({error: 'account can not be null.'});
    var promise = admintool.changeMobilePhone(account, mobilePhoneNumber);
    promise.then(function (result) {
        if (result) res.json(result);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});




// 上传营业执照
router.post('/upload', multipartMiddleware, function(req, res){
    var filePath = req.files.imageFile.path;
    if (!filePath) {
        var err = new Error('file param is requested.');
        res.status(httpCode).json({
            error: err.message
        });
    }
    // 上传文件至blob容器
    var promise = blobtool.uploadFileToBlob(filePath);
    promise.then(function (result) {
        if (result) {
            res.json(result);
        }
    }).catch(function (err) {
        if (err) {
            res.status(httpCode).json({
                error: err.message
            });
        }
    });
});




module.exports = router;