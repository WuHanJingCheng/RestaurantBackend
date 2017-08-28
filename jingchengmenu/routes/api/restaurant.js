/**
 * Created by Brisy on 2017/6/7.
 */
'use strict';
var router = require('express').Router();
var restauranttool = require('../../utils/restauranttool');
const httpCode = 400;
var redistool = require('../../utils/redistool');



// 增加餐厅, 返回增加的餐厅信息
router.post('/add', function (req, res) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    redistool.get(token, function (err, reply) {
        if (err) res.status(httpCode).json({error: err.message});
        if (reply) {
            var body = req.body;
            var promise = restauranttool.addRestaurant(body);
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
            var err = new Error('can not find token equalTo ' + token);
            res.status(httpCode).json({error: err.message});
        }
    });
});



// 更新餐厅所有信息, 更新成功后,返回更新后的餐厅信息
router.post('/update', function (req, res) {
    var  token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    redistool.get(token, function (err, reply) {
        if (err) res.status(httpCode).json({error: err.message});
        if (reply) {
            var queryParam = req.query;
            var restaurant_id = queryParam.restaurant_id;
            if (!restaurant_id) res.status(500).json({error: 'restaurant_id can not be empty.'});
            var body = req.body;
            var promise = restauranttool.updateRestaurant(restaurant_id, body);
            promise.then(function (result) {
                if (result) {
                    res.json(result);
                }
            }).catch(function (err) {
                if (err) {
                    res.status(500).json({
                        error: err.message
                    });
                }
            });
        } else {
            var err = new Error('can not find token equalTo ' + token);
            res.status(httpCode).json({error: err.message});
        }
    })
});


// 获取餐厅列表
router.get('/list', function (req, res) {
    var promise = restauranttool.getRestaurantList();
    promise.then(function (results) {
        if (results) {
            res.json(results);
        }
    });
});

// 查询id 查询餐厅, 返回餐厅JSON数据
router.get('/restaurant_id/:restaurant_id', function (req, res) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    redistool.get(token, function (err, reply) {
        if (err) res.status(httpCode).json({error: err.message});
        if (reply) {
            var params = req.params;
            var restaurant_id = params.restaurant_id;
            if (!restaurant_id) res.status(500).json({error: 'restaurant_id can not be empty.'});
            var promise = restauranttool.queryRestaurantById(restaurant_id);
            promise.then(function (result) {
                if (result) {
                    res.json(result);
                }
            }).catch(function (err) {
                if (err) {
                    res.status(500).json({
                        error: err.message
                    });
                }
            });
        } else {
            var err = new Error('can not find token equalTo ' + token);
            res.status(httpCode).json({error: err.message});
        }
    })
});


// 根据ID删除餐厅, 删除后返回删除ID
router.post('/delete/:restaurant_id', function (req, res) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: err.message});
    redistool.get(token, function (err, reply) {
        if (err) res.status(httpCode).json({error: err.message});
        if (reply) {
            var params = req.params;
            var restaurant_id = params.restaurant_id;
            if (!restaurant_id) res.status(httpCode).json({error: 'restaurant_id can not be empty.'});
            var promise = restauranttool.deleteRestaurantById(restaurant_id);
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
            var err = new Error('can not find token equalTo ' + token);
            res.status(httpCode).json({error: err.message});
        }
    })
});

















module.exports = router;