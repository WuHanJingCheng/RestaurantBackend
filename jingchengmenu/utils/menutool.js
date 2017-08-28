/**
 * Created by Brisy on 2017/6/12.
 */

var mysqltool = require('./mysqltool');
var sqltool = require('./sqltool');
var async = require('async');


function menutool() {

}



menutool.prototype = {


    /********************************菜单部分******************************************/
    // 通过restaurant_id 获取menu 列表
    getMenuListByRestaurant_id: function (restaurant_id) {
        return new Promise(function (resolved, rejected) {
            var sql = sqltool.selectSql('menu', 'restaurant_id', restaurant_id) + ' ORDER BY menu_id DESC;';
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results) {
                    resolved(results);
                } else {
                    var err = new Error('can not find restaurant_id equalTo ' + restaurant_id + ' in menu.');
                    rejected(err);
                }
            });
        });
    },


    // 向指定餐厅增加菜单
    addMenuToRestaurantByRestaurant_id: function(args) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                // 先判断restaurant_id 是否存在
                function (callback) {
                    var sql = sqltool.selectSql('restaurant', 'restaurant_id', args.restaurant_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results) callback(null, results);
                    });
                },
                function (results, callback) {
                    // 如果restaurant_id 存在, 添加菜单
                    if (results && results.length > 0) {
                        var sql = sqltool.insertSql('menu', args);
                        var params = sqltool.sqlParams(args);
                        mysqltool.queryParam(sql, params, function (err, result) {
                            if (err) callback(err, null);
                            if (result) callback(null, result.insertId);
                        });
                    } else {
                        // 如果不存在, 直接报错
                        var err = new Error('can not find restaurant_id equalTo ' + args.restaurant_id + ' in restaurant.');
                        callback(err, null);
                    }
                },
                function (insertId, callback) {
                    // 插入成功后, 查询插入的结果, 并返回
                    var sql = sqltool.selectSql('menu', 'menu_id', insertId);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) callback(null, results[0]);
                    });
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            });
        });
    },


    // 修改指定菜单
    updateMenuByMenu_id: function (menu_id, args) {
        return new Promise(function (resolved, rejected) {
            async.series({
                one: function (callback) {
                    var sql = sqltool.updateSql('menu', args, 'menu_id');
                    var params = sqltool.sqlParams(args);
                    params.push(menu_id);
                    mysqltool.queryParam(sql, params, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, result);
                    });
                },
                two: function (callback) {
                    var sql = sqltool.selectSql('menu', 'menu_id', menu_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) callback(null, results[0]);
                    });
                }
            }, function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result.two);
            });
        });
    },


    // 通过menu_id 查询菜单
    queryMenuByMenu_id: function(menu_id) {
        return new Promise(function (resolved, rejected) {
            var sql = sqltool.selectSql('menu', 'menu_id', menu_id);
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results && results.length > 0) {
                    resolved(results[0]);
                } else {
                    var err = new Error('can not find menu_id equalTo ' + menu_id);
                    rejected(err);
                }
            });
        });
    },



    // 通过menu_id 删除菜单
    deleteMenuByMenu_id: function (menu_id) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                // 先判断menu_id 是否存在
                function (callback) {
                    var sql = sqltool.selectSql('menu', 'menu_id', menu_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err ,null);
                        if (results) callback(null, results);
                    });
                },
                function (results, callback) {
                    // 如果存在, 删除
                    if (results && results.length > 0) {
                        var sql = sqltool.deleteSql('menu', 'menu_id', menu_id);
                        mysqltool.query(sql, function (err, result) {
                            if (err) callback(err, null);
                            if (result) callback(null, {menu_id: parseInt(menu_id)});
                        });
                    } else {
                        // 如果不存在, 报错
                        var err = new Error('can not find menu_id equalTo ' + menu_id);
                        callback(err, null);
                    }
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            });
        });
    },


    deleteMenu: function (menu_id) {
        var that = this;
        return new Promise(function (resolved, rejected) {
            mysqltool.pool.getConnection(function (err, connection) {
                if (err) rejected(err);
                // 开启事物
                connection.beginTransaction(function (err) {
                    if (err) {
                        // 释放连接池
                        connection.release();
                        rejected(err);
                    }
                    var sql = sqltool.selectSql('menu', 'menu_id', menu_id);
                    connection.query(sql, function (err, results) {
                        if (err) {
                            return connection.rollback(function () {
                                // 释放连接池
                                connection.release();
                                rejected(err);
                            })
                        }
                        if (results && results.length > 0) {
                            var sql = sqltool.deleteSql('menu', 'menu_id', menu_id);
                            connection.query(sql, function (err, result) {
                                if (err) {
                                    return connection.rollback(function () {
                                        // 释放连接池
                                        connection.release();
                                        rejected(err);
                                    })
                                }
                                if (result) {
                                    var sql = sqltool.selectSql('dish', 'menu_id', menu_id);
                                    connection.query(sql, function (err, results) {
                                        if (err) {
                                            return connection.rollback(function () {
                                                // 释放连接池
                                                connection.release();
                                                rejected(err);
                                            })
                                        }
                                        if (results) {
                                            var promises = [];
                                            results.map(function (model) {
                                                var dish_id = model.dish_id;
                                                var promise = that.deleteDish(dish_id, connection);
                                                promises.push(promise);
                                            });
                                            Promise.all(promises).then(function (results) {
                                                if (results) {
                                                    // 提交事物
                                                    connection.commit(function (err) {
                                                        if (err) {
                                                            return connection.rollback(function () {
                                                                // 释放连接池
                                                                connection.release();
                                                                rejected(err);
                                                            })
                                                        }
                                                        // 释放连接池
                                                        connection.release();
                                                        resolved({menu_id: parseInt(menu_id)});
                                                    })
                                                }
                                            }).catch(function (err) {
                                                if (err) {
                                                    // 释放连接池
                                                    connection.release();
                                                    rejected(err);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                })
            });
        });
    },


    // 菜品批量删除
    deleteDish: function (dish_id, connection) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                function (callback) {
                    var sql = sqltool.selectSql('dish', 'dish_id', dish_id);
                    connection.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) {
                            callback(null, dish_id);
                        }
                    });
                },
                function (dish_id, callback) {
                    var sql = sqltool.deleteSql('dish', 'dish_id', dish_id);
                    connection.query(sql, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, {dish_id: dish_id});
                    });
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            })
        });
    }
}














menutool.prototype.constructor = menutool;
module.exports = new menutool();