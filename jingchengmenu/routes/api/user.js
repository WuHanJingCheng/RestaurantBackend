/**
 * Created by Brisy on 2017/6/25.
 */
'use strict';
var router = require('express').Router();
var usertool = require('../../utils/usertool');
var util = require('../../utils/util');
const httpCode = 400;
const expires_in = 10 * 24 * 3600;
const secret = 'edd5d75564a18fa78a32c7305e0335b9';
var jwt = require('jsonwebtoken');


// 注册
router.post('/register', function (req, res) {
    var body = req.body;
    var promise = usertool.register(body);
    promise.then(function (result) {
        if (result) res.json(result);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});





// 账号登录
router.post('/login', function (req, res) {
    var body = req.body;
    var account = body.account;
    if (!account) res.status(httpCode).json({error: 'account can not be null.'});
    var password = body.password;
    if (!password) res.status(httpCode).json({error: 'password can not be null.'});
    var promise = usertool.loginWithAccount(account, password);
    promise.then(function (result) {
        if (result) {
            // 生成token
            var token = jwt.sign({
                user: result
            },secret,{expiresIn: expires_in});
            // 返回token给客户端
            res.json({
                user_id: result.user_id,
                restaurant_id: result.restaurant_id,
                access_token: token,
                expires_in: expires_in
            });
        } else {
            var err = new Error('login fail.');
            res.status(httpCode).json({error: err.message});
        }
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});



// 验证token 是否有效
router.post('/token/verify', function (req, res) {
    var token = req.body.token;
    if (!token) res.status(httpCode).json({error: 'token can not be nil'});
    jwt.verify(token, secret, function(err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var timestamp = parseInt(new Date().getTime()/1000) + 3 * 24 * 3600;
            var exp = decoded.exp;
            if (timestamp > exp) {
                // 过期, 刷新新的token
                var new_token = jwt.sign({
                    user: decoded.user
                },secret,{expiresIn: expires_in});
                // 返回新的token
                res.json({token: new_token});
            } else {
                res.json({token: token});
            }
        }
    });
});



// 删除子账号
router.post('/delete/:user_id', function (req, res) {
    var params = req.params;
    var user_id = params.user_id;
    var promise = usertool.deleteSubAccount(user_id);
    promise.then(function (result) {
        if (result) res.json(result);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});




// 判断账号是否已存在
router.get('/exist', function (req, res) {
    var query = req.query;
    var account = query.account;
    if (!account) res.status(httpCode).json({error: 'account can not be null'});
    var promise = usertool.getUser(account);
    promise.then(function (result) {
        if (result) res.json(result);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});










module.exports = router;