/**
 * Created by Brisy on 2017/6/9.
 */
'use strict';
var router = require('express').Router();
var menutool = require('../../utils/menutool.js');
const httpCode = 400;
const secret = 'edd5d75564a18fa78a32c7305e0335b9';
var jwt = require('jsonwebtoken');



// 通过restaurant_id 获取menu 列表
router.get('/list/:restaurant_id', function (req, res, next) {
    var params = req.params;
    var restaurant_id = params.restaurant_id;
    if (!restaurant_id) res.status(httpCode).json({error: 'restaurant_id can not be empty.'});
    var promise = menutool.getMenuListByRestaurant_id(restaurant_id);
    promise.then(function (results) {
        if (results) {
            res.json(results);
        } else {
            next();
        }
    }).catch(function (err) {
        if (err) {
            res.status(httpCode).json({
                error: err.message
            });
        } else {
            next();
        }
    });
});


// 向指定餐厅添加菜单
router.post('/add', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var body = req.body;
            var promise = menutool.addMenuToRestaurantByRestaurant_id(body);
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
        } else {
            next();
        }
    });
});




// 修改指定菜单
router.post('/update', function (req, res) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var queryParam = req.query;
            var menu_id = parseInt(queryParam.menu_id);
            if (!menu_id) res.status(httpCode).json({error: 'menu_id can not be empty.'});
            var body = req.body;
            var name = body.name;
            if (!name) res.status(httpCode).json({error: 'name can not be empty.'});
            // 获取参数
            var args = {name: name};
            var promise = menutool.updateMenuByMenu_id(menu_id, args);
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
        }
    });
});


// 通过menu_id 查找菜单
router.get('/menu_id/:menu_id', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var params = req.params;
            var menu_id = params.menu_id;
            if (!menu_id) res.status(httpCode).json({error: 'menu_id can not be empty.'});
            var promise = menutool.queryMenuByMenu_id(menu_id);
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
        } else {
            next();
        }
    });
});



// 通过menu_id 删除菜单
router.post('/delete/:menu_id', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var params = req.params;
            var menu_id = params.menu_id;
            if (!menu_id) res.status(httpCode).json({error: 'menu_id can not be empty.'});
            var promise = menutool.deleteMenu(menu_id);
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
        } else {
            next();
        }
    });
});



















module.exports = router;