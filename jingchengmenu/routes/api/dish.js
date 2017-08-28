/**
 * Created by Brisy on 2017/6/12.
 */
'use strict';
var router = require('express').Router();
var dishtool = require('../../utils/dishtool.js');
var blobtool = require('../../utils/blobtool.js');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var redistool = require('../../utils/redistool');
const httpCode = 400;
const secret = 'edd5d75564a18fa78a32c7305e0335b9';
var jwt = require('jsonwebtoken');



// 获取指定menu_id 菜品列表
router.get('/list/:menu_id', function (req, res, next) {
    var params = req.params;
    var menu_id = params.menu_id;
    if (!menu_id) res.status(httpCode).json({error: 'menu_id can not be empty.'});
    var promise = dishtool.getDishListByMenu_id(menu_id);
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
});



// 获取所有菜品列表, 用于搜索
router.get('/list/restaurant/:restaurant_id', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be nil'});
    var params = req.params;
    var restaurant_id = params.restaurant_id;
    var promise = dishtool.getDishListByRestaurant_id(restaurant_id);
    promise.then(function (results) {
        if (results) res.json(results);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});


// 获取指定餐厅推荐菜品列表
router.get('/recommend', function (req, res) {
    var promise = dishtool.recommend();
    promise.then(function (results) {
        if (results) res.json(results);
    }).catch(function (err) {
        if (err) res.status(httpCode).json({error: err.message});
    });
});


// 停用菜品
router.post('/stop', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be nil'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var body = req.body;
            var isStop = body.isStop;
            if (isStop == null) res.status(httpCode).json({error: 'isStop can not be null'});
            var dish_id = body.dish_id;
            if (!dish_id) res.status(httpCode).json({error: err.message});
            var promise = dishtool.stopDish(dish_id, isStop);
            promise.then(function (result) {
                if (result) res.json(result);
            }).catch(function (err) {
                if (err) res.status(httpCode).json({error: err.message});
            });
        } else {
            next();
        }
    });
});



// 向指定menu_id 添加菜品
router.post('/add', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: err.message});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var args = req.body;
            var promise = dishtool.addDishToMenu(args);
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




// 更新菜品信息
router.post('/update', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var queryParam = req.query;
            var dish_id = queryParam.dish_id;
            if (!dish_id) res.status(httpCode).json({error: 'dish_id can not be empty.'});
            var args = req.body;
            var promise = dishtool.updateDish(dish_id, args);
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



// 根据dish_id 查询菜品
router.get('/dish_id/:dish_id', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var params = req.params;
            var dish_id = params.dish_id;
            if (!dish_id) {
                res.status(500).json({
                    error: err.message
                });
            }
            var promise = dishtool.getDishByDish_id(dish_id);
            promise.then(function (result) {
                res.json(result);
            }).catch(function (err) {
                if (err) {
                    res.status(500).json({
                        error: err.message
                    });
                }
            });
        } else {
            next();
        }
    });
});



// 根据dish_id删除菜品
router.post('/delete/:dish_id', function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var params = req.params;
            var dish_id = params.dish_id;
            if (!dish_id) {
                var err = new Error('dish_id is required param.');
                res.status(httpCode).json({
                    error: err.message
                });
            }

            var promise = dishtool.deleteDishByDish_id(dish_id);
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



// 上传菜品图片
router.post('/upload', multipartMiddleware, function(req, res, next){
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var filePath = req.files.file.path;
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
        } else {
            next();
        }
    });
});


// 上传菜品并保存至数据库
router.post('/add/upload', multipartMiddleware, function (req, res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null.'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var thumbnail_url = req.files.thumbnail_url.path;
            if (!thumbnail_url) res.status(httpCode).json({error: 'thumbnail can not be null'});
            var img_large_url = req.files.img_large_url.path;
            if (!img_large_url) res.status(httpCode).json({error: 'img_large_url can not be null'});
            var args = req.body;
            var menu_id = args.menu_id;
            if (!menu_id) res.status(httpCode).json({error: 'menu_id can not be null'});
            var name = args.name;
            if (!name) res.status(httpCode).json({error: 'name can not be null'});
            var price = args.price;
            if (!price) res.status(httpCode).json({error: 'price can not be null'});
            var promise = dishtool.uploadFileThenSaveDishToDataBase(img_large_url, thumbnail_url, args);
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

// 有图更新
router.post('/upload/update', multipartMiddleware, function (req ,res, next) {
    var token = req.header('token');
    if (!token) res.status(httpCode).json({error: 'token can not be null'});
    jwt.verify(token, secret, function (err, decoded) {
        if (err) res.status(httpCode).json({error: err.message});
        if (decoded.user) {
            var smallFilePath = req.files.smallFilePath.path;
            if (!smallFilePath) res.status(httpCode).json({error: 'smallFilePath can not be null'});
            var largeFilePath = req.files.largeFilePath.path;
            if (!largeFilePath) res.status(httpCode).json({error: 'largeFilePath can not be null'});
            var args = req.body;
            var dish_id = args.dish_id;
            if (!dish_id) res.status(httpCode).json({error: 'dish_id can not be null'});
            var promise = dishtool.uploadFileThenUpdateDataBase(smallFilePath, largeFilePath, args);
            promise.then(function (result) {
                if (result) res.json(result);
            }).catch(function (err) {
                if (err) res.status(httpCode).json({error: err.message});
            });
        } else {
            next();
        }
    });
});












module.exports = router;