/**
 * Created by Brisy on 2017/6/12.
 */
var mysqltool = require('./mysqltool');
var sqltool = require('./sqltool');
var async = require('async');
var blobtool = require('./blobtool');


function dishtool() {

}



dishtool.prototype = {

    /********************************菜品部分******************************************/
    // 获取指定menu_id 的菜品列表
    getDishListByMenu_id: function(menu_id) {
        return new Promise(function (resolved, rejected) {
            var sql = sqltool.selectSql('dish', 'menu_id', menu_id) + ' ORDER BY dish_id DESC';
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results) {
                    resolved(results);
                } else {
                    var err = new Error('can not find menu_id equalTo ' + menu_id + ' in dish.');
                    rejected(err);
                }
            });
        });
    },


    // 获取餐厅所有菜品
    getDishListByRestaurant_id: function (restaurant_id) {
        var that = this;
        return new Promise(function (resolved, rejected) {
            var sql = sqltool.selectSql('menu', 'restaurant_id', restaurant_id);
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results) {
                    var promises = [];
                    results.map(function (model) {
                        var promise = that.getDishListByMenu_id(model.menu_id);
                        promises.push(promise);
                    });
                    Promise.all(promises).then(function (results) {
                        if (results) {
                            var arr = [];
                            results.map(function (tempArr) {
                               arr = arr.concat(tempArr);
                            });
                            resolved(arr);
                        }
                    }).catch(function (err) {
                        if (err) rejected(err);
                    })
                } else {
                    var err = new Error('can not find menu');
                    rejected(err);
                }
            })
        });
    },


    // 推荐菜品列表
    recommend: function () {
        return new Promise(function (resolved, rejected) {
            var sql = 'SELECT * FROM dish ORDER BY dish_id DESC';
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results) resolved(results);
            });
        });
    },


    // 停用菜品
    stopDish: function (dish_id, isStop) {
      return new Promise(function (resolved, rejected) {
          async.waterfall([
              function (callback) {
                  var args = {isStop: isStop};
                  var sql = sqltool.updateSql('dish', args, 'dish_id');
                  var params = sqltool.sqlParams(args);
                  params.push(dish_id);
                  mysqltool.queryParam(sql, params, function (err, result) {
                      if (err) callback(err, null);
                      if (result) callback(null, dish_id);
                  })
              },
              function (dish_id, callback) {
                  var sql = sqltool.selectSql('dish', 'dish_id', dish_id);
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



    // 向指定menu_id 中添加菜品
    addDishToMenu: function(args) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                function (callback) {
                    var sql = sqltool.selectSql('dish', 'menu_id', args.menu_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results) callback(null, results);
                    });
                },
                function (results, callback) {
                    if (results && results.length > 0) {
                        var sql = sqltool.insertSql('dish', args);
                        var params = sqltool.sqlParams(args);
                        mysqltool.queryParam(sql, params, function (err, result) {
                            if (err) callback(err, null);
                            if (result) callback(null, result.insertId);
                        });
                    } else {
                        var err = new Error('can not find menu_id equalTo ' + args.menu_id);
                        callback(err, null);
                    }
                },
                function (insertId, callback) {
                    var sql = sqltool.selectSql('dish', 'dish_id', insertId);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) callback(null, results[0]);
                        var err = new Error('insert fail, can not find dish_id equalTo ' + insertId);
                        callback(err, null);
                    });
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            });
        });
    },



    // 更新菜品信息
    updateDish: function (dish_id, args) {
        return new Promise(function (resolved, rejected) {
            async.series({
                one: function(callback) {
                    var sql = sqltool.updateSql('dish', args, 'dish_id');
                    var params = sqltool.sqlParams(args);
                    params.push(dish_id);
                    mysqltool.queryParam(sql, params, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, result);
                    });
                },
                two: function(callback) {
                    var sql = sqltool.selectSql('dish', 'dish_id', dish_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0){
                            callback(null, results[0]);
                        } else {
                            var err = new Error('can not find dish_id equalTo ' + dish_id);
                            callback(err, null);
                        }
                    });
                }
            }, function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result.two);
            });
        });
    },



    // 根据dish_id 查询菜品
    getDishByDish_id: function (dish_id) {
        return new Promise(function (resolved, rejected) {
            var sql = sqltool.selectSql('dish', 'dish_id', dish_id);
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results && results.length > 0) {
                    resolved(results[0]);
                } else {
                    var err = new Error('can not find dish_id equalTo ' + dish_id);
                    rejected(err);
                }
            });
        });
    },



    // 删除菜品
    deleteDishByDish_id: function (dish_id) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                // 先查找菜品是否存在
                function (callback) {
                    var sql = sqltool.selectSql('dish', 'dish_id', dish_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results) callback(null, results);
                    });
                },
                // 如果存在,执行删除操作
                function (results, callback) {
                    if (results && results.length > 0) {
                        var sql = sqltool.deleteSql('dish', 'dish_id', dish_id);
                        mysqltool.query(sql, function (err, result) {
                            if (err) callback(err, null);
                            if (result) callback(null, {dish_id: parseInt(dish_id)});
                        });
                    } else {
                        var err = new Error('can not find dish_id equalTo ' + dish_id + ', so delete dish fail.');
                        callback(err, null);
                    }
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            })
        });
    },


    // 先上传图片,然后保存至数据库
    uploadFileThenSaveDishToDataBase: function (img_large_url, thumbnail_url, args) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                // 先上传大图片至blob容器
                function (callback) {
                    blobtool.uploadFileToBlob(img_large_url).then(function (result) {
                        if (result) {
                            args.img_large_url = result;
                            callback(null, result);
                        }
                    }).catch(function (err) {
                        if (err) callback(err, null);
                    });
                },
                // 上传小图
                function (largeUrl, callback) {
                    blobtool.uploadFileToBlob(thumbnail_url).then(function (result) {
                        if (result) {
                            args.thumbnail_url = result;
                            callback(null, result);
                        }
                    });
                },
                // 然后将获取到的URL,一起保存至数据库
                function (smallUrl, callback) {
                    var sql = sqltool.insertSql('dish', args);
                    var params = sqltool.sqlParams(args);
                    mysqltool.queryParam(sql, params, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, result.insertId);
                    })
                },
                // 最后获取新增加的菜品数据
                function (insertId, callback) {
                    var sql = sqltool.selectSql('dish', 'dish_id', insertId);
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
    },


    // 先上传图片, 然后修改数据库
    uploadFileThenUpdateDataBase: function (smallFilePath, largeFilePath, args) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                // 先上传大图
                function (callback) {
                    blobtool.uploadFileToBlob(largeFilePath).then(function (result) {
                        if (result) {
                            args.img_large_url = result;
                            callback(null, result);
                        }
                    }).catch(function (err) {
                        if (err) callback(err, null);
                    });
                },
                // 在上传小图
                function (largeUrl, callback) {
                    blobtool.uploadFileToBlob(smallFilePath).then(function (result) {
                        if (result) {
                            args.thumbnail_url = result;
                            callback(null, result);
                        }
                    }).catch(function (err) {
                        if (err) callback(err, null);
                    });
                },
                // 然后修改数据库
                function (smallUrl, callback) {
                    var dish_id = args.dish_id;
                    delete args.dish_id;
                    var sql = sqltool.updateSql('dish', args, 'dish_id');
                    var params = sqltool.sqlParams(args);
                    params.push(dish_id);
                    mysqltool.queryParam(sql, params, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, dish_id);
                    });
                },
                // 然后将更新后的信息返回给客户端
                function (dish_id, callback) {
                    var sql = sqltool.selectSql('dish', 'dish_id', parseInt(dish_id));
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
    }

}

















dishtool.prototype.constructor = dishtool;
module.exports = new dishtool();