/**
 * Created by Brisy on 2017/6/12.
 */
'use strict';
var router = require('express').Router();
var ordertool = require('../../utils/ordertool.js');
var redistool = require('../../utils/redistool');
const httpCode = 400;
const secret = 'edd5d75564a18fa78a32c7305e0335b9';
var jwt = require('jsonwebtoken');




// 下单
router.post('/add', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var body = req.body;
            var promise = ordertool.add(body);
            promise.then(function (result) {
                if (result) {
                    res.json(result);
                }
            }).catch(function (err) {
                if (err) res.status(httpCode).json({error: err.message});
            });
        } else {
            next();
        }
    });
});



// 通过order_id 查询订单
router.get('/order_id/:order_id', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var params = req.params;
            var order_id = params.order_id;
            if (!order_id) res.status(httpCode).json({error: err.message});
            var promise = ordertool.getOrderByOrder_id(order_id);
            promise.then(function (results) {
                if (results) res.json(results);
            }).catch(function (err) {
                if (err) res.status(httpCode).json({error: err.message});
            });
        } else {
            next();
        }
    });
});




// 修改支付状态
router.post('/update', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var queryParams = req.query;
            var order_id = queryParams.order_id;
            if (!order_id) res.status(httpCode).json({error: 'order_id can not be null.'});
            var isPay = queryParams.isPay;
            if (!isPay) res.status(httpCode).json({error: 'isPay can not be null.'});
            var promise = ordertool.updateOrderByOrder_id(isPay, order_id);
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



// 获取指定餐厅订单列表
router.get('/list/:restaurant_id', function (req, res) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var params = req.params;
            var restaurant_id = params.restaurant_id;
            if (!restaurant_id) res.status(httpCode).json({error: 'restaurant_id can not be null.'});
            var promise = ordertool.getOrderList(restaurant_id);
            promise.then(function (results) {
                if (results) {
                    res.json(results);
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



// 获取指定餐厅订单列表(已完成订单, 未完成订单)
router.get('/list', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var query = req.query;
            var restaurant_id = query.restaurant_id;
            if (!restaurant_id) res.status(httpCode).json({error: 'restaurant_id can not be null.'});
            var isPay = query.isPay;
            if (!isPay) res.status(httpCode).json({error: 'isPay can not be null'});
            var promise = ordertool.getOrderListByIsPay(restaurant_id, isPay);
            promise.then(function (results) {
                if (results) {
                    res.json(results);
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


// 获取更多订单(已完成订单, 未完成订单)
router.get('/morelist', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var query = req.query;
            var restaurant_id = query.restaurant_id;
            if (!restaurant_id) res.status(httpCode).json({error: 'restaurant_id can not be null.'});
            var isPay = query.isPay;
            if (!isPay) res.status(httpCode).json({error: 'isPay can not be null'});
            var lastTime = query.lastTime;
            if (!lastTime) res.status(httpCode).json({error: 'lastTime can not be null'});
            var promise = ordertool.getMoreOrderListByIsPay(restaurant_id, isPay, lastTime);
            promise.then(function (results) {
                if (results) {
                    res.json(results);
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



// 删除订单
router.post('/delete/:order_id', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be empty.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var params = req.params;
            var order_id = params.order_id;
            if (!order_id) res.status(httpCode).json({error: 'order_id can not be null.'});
            var promise = ordertool.deleteOrderByOrder_id(order_id);
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



// 批量删除
router.post('/batch/delete', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var body = req.body;
            var orders = body.orders;
            if (!orders) res.status(httpCode).json({error: 'orders can not be null'});
            var promise = ordertool.batchDelete(orders);
            promise.then(function (results) {
                if (results) res.json(results);
            }).catch(function (err) {
                if (err) res.status(httpCode).json({error: err.message});
            });
        } else {
            next();
        }
    });
});



// 修改菜品上桌状态
router.post('/dish/mark', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null'});
    jwt.verify(token, secret, function (err, decoded) {
        if (decoded.user) {
            var body = req.body;
            var order_id = body.order_id;
            if (!order_id) res.status(httpCode).json('order_id can not be null');
            var dish_id = body.dish_id;
            if (!dish_id) res.status(httpCode).json('dish_id can not be null');
            var isMarked = body.isMarked;
            if (!isMarked) res.status(httpCode).json('isMarked can not be null');
            var promise = ordertool.markedDishStatus(order_id, dish_id, isMarked);
            promise.then(function (result) {
                if (result) res.json(result);
            }).catch(function (err) {
                console.log(err);
                if (err) res.status(httpCode).json({error: err.message});
            });
        }
    });
});






module.exports = router;