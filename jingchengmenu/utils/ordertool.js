/**
 * Created by Brisy on 2017/6/12.
 */

var mysqltool = require('./mysqltool');
var sqltool = require('./sqltool');
var async = require('async');
var dishtool = require('./dishtool');
var util = require('./util');
var request = require('request');
var jpushtool = require('./jpushtool');
const leanAppId = 'siAIt9R7uO9RSoHIXJU9SQpN-gzGzoHsz';
const leanAppKey = 'hKEIFUiCBdWWAYHj6d3u2dgF';
var md5 = require('md5');



function ordertool() {

}




ordertool.prototype = {

    // 下单
    add: function (args) {
        return new Promise(function (resolved, rejected) {
            // 先判断每道菜是否都存在
            var dish_list = args.dish_list;
            // 先判断每道菜是否存在,防止用户点了已被删除的菜
            if (!dish_list) rejected(new Error('dish_list can not be null.'));
            var promises = [];
            dish_list.map(function (model) {
                var dish_id = model.dish_id;
                var promise = dishtool.getDishByDish_id(dish_id);
                promises.push(promise);
            });
            // 如果存在,就去下单
            Promise.all(promises).then(function (results) {
                if (results) {
                    async.waterfall([
                        // 判断restaurant_id 是否存在
                        function (callback) {
                            var sql = sqltool.selectSql('restaurant', 'restaurant_id', args.restaurant_id);
                            mysqltool.query(sql, function (err, results) {
                                if (err) callback(err, null);
                                if (results) callback(null, results);
                            });
                        },
                        // 保存订单
                        function (results, callback) {
                            if (results && results.length > 0) {
                                var temp = md5(new Date().getTime()).toLowerCase();
                                var order_id = temp.substring(0, temp.length-14);
                                args.order_id = order_id;
                                args.dish_list = JSON.stringify(dish_list);
                                var timestamp = parseInt(new Date().getTime()/1000).toString();
                                args.timestamp = timestamp;
                                var transaction_id = util.formatDate(new Date()) + parseInt(Math.random() * 1000);
                                args.transaction_id = transaction_id;
                                var sql = sqltool.insertSql('order', args);
                                var params = sqltool.sqlParams(args);
                                mysqltool.queryParam(sql, params, function (err, result) {
                                    if (err) callback(err, null);
                                    if (result) callback(null, order_id);
                                });
                            } else {
                                var err = new Error('can not find restaurant_id equalTo ' + args.restaurant_id);
                                callback(err, null);
                            }
                        },
                        // 推送消息给商户端,通知商户端及时出单
                        function (order_id, callback) {
                            jpushtool.pushMessage('你有新的订单了,请及时出单!').then(function (result) {
                                if (result) callback(null, order_id);
                            }).catch(function (err) {
                                if (err) callback(err, null);
                            });
                        },
                        // 推送消息发出后, 将下单结果反馈给客户端
                        function (order_id, callback) {
                            var sql = sqltool.selectSql('order', 'order_id', order_id);
                            mysqltool.query(sql, function (err, results) {
                                if (err) callback(err, null);
                                if (results) {
                                    callback(null, results[0]);
                                } else {
                                    var err = new Error('can not find order_id equalTo ' + order_id);
                                    callback(err, null);
                                }
                            });
                        }
                    ], function (err, result) {
                        if (err) rejected(err);
                        if (result) resolved(result);
                    });
                }
            }).catch(function (err) {
                if (err) rejected(err);
            });
        });
    },


    // 通过order_id 查询订单
    getOrderByOrder_id: function(order_id) {
        return new Promise(function (resolved, rejected) {
            var sql = sqltool.selectSql('order', 'order_id', order_id);
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results && results.length > 0) {
                    var result = results[0];
                    var dish_list = result.dish_list;
                    result.dish_list = JSON.parse(dish_list);
                    resolved(result);
                } else {
                    var err = new Error('can not find order_id equalTo ' + order_id);
                    rejected(err);
                }
            });
        });
    },


    // 修改支付状态
    updateOrderByOrder_id: function (isPay, order_id) {
        return new Promise(function (resolved, rejected) {
            mysqltool.pool.getConnection(function (err, connection) {
                if (err) {
                    rejected(err);
                }
                // 开启事物
                connection.beginTransaction(function (err) {
                    if (err) {
                        // 释放连接池
                        connection.release();
                        rejected(err);
                    }
                    async.series({
                        one: function (callback) {
                            var timestamp = parseInt(new Date().getTime()/1000).toString();
                            var args = {isPay: isPay, timestamp: timestamp};
                            var sql = sqltool.updateSql('order', args, 'order_id');
                            var params = sqltool.sqlParams(args);
                            params.push(order_id);
                            connection.query(sql, params, function (err, result) {
                                if (err) callback(err, null);
                                if (result) callback(null, result);
                            });
                        },
                        two: function (callback) {
                            var sql = sqltool.selectSql('order', 'order_id', order_id);
                            connection.query(sql, function (err, results) {
                                if (err) callback(err, null);
                                if (results && results.length > 0) {
                                    callback(null, results[0]);
                                } else {
                                    var err = new Error('can not find order_id equalTo ' + order_id);
                                    callback(err, null);
                                }
                            });
                        }
                    }, function (err, result) {
                        if (err) {
                            return connection.rollback(function () {
                                // 释放连接
                                connection.release();
                                rejected(err);
                            })
                        }
                        if (result) {
                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function () {
                                        // 释放连接
                                        connection.release();
                                        rejected(err);
                                    })
                                }
                                // 释放连接池
                                connection.release();
                                var order = result.two;
                                order.dish_list = JSON.parse(order.dish_list);
                                resolved(order);
                            })
                        }
                    });
                });
            });
        });
    },


    // 获取订单列表
    getOrderList: function (restaurant_id) {
        return new Promise(function (resolved, rejected) {
            var sql = sqltool.selectSql('order', 'restaurant_id', restaurant_id);
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results) {
                    results.map(function (model) {
                        model.dish_list = JSON.parse(model.dish_list);
                    });
                    resolved(results);
                } else {
                    var err = new Error('can not find order record');
                    rejected(err);
                }
            });
        });
    },


    // 获取订单列表(已完成订单, 未完成订单)
    getOrderListByIsPay: function (restaurant_id, isPay) {
        return new Promise(function (resolved, rejected) {
            var sql = 'SELECT * FROM `order` WHERE restaurant_id=' + parseInt(restaurant_id) + ' && isPay=' + isPay + ' ORDER BY timestamp DESC LIMIT 12;';
            console.log(sql);
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results && results.length > 0) {
                    results.map(function (model) {
                        model.dish_list = JSON.parse(model.dish_list);
                    });
                    var result = {
                        results: results,
                        lastTime: results[results.length-1].timestamp
                    }
                    resolved(result);
                } else {
                    var err = new Error('can not find order record');
                    rejected(err);
                }
            });
        });
    },


    // 获取更多订单
    getMoreOrderListByIsPay: function (restaurant_id, isPay, lastTime) {
        return new Promise(function (resolved, rejected) {
            var sql = 'SELECT * FROM `order` WHERE restaurant_id=' + parseInt(restaurant_id) + ' && isPay=' + isPay + ' && timestamp<\"' + lastTime + '\" ORDER BY timestamp DESC LIMIT 12;';
            console.log(sql);
            mysqltool.query(sql, function (err, results) {
                console.log(err);
                console.log(results);
                if (err) rejected(err);
                if (results && results.length > 0) {
                    results.map(function (model) {
                        model.dish_list = JSON.parse(model.dish_list);
                    });
                    var result = {
                        results: results,
                        lastTime: results[results.length-1].timestamp
                    }
                    resolved(result);
                } else {
                    var err = new Error('can not find order record');
                    rejected(err);
                }
            });
        });
    },


    // 删除订单
    deleteOrderByOrder_id: function (order_id) {
        return new Promise(function (resolved, rejected) {
            mysqltool.pool.getConnection(function (err, connection) {
                if (err) rejected(err);
                // 开启事物
                connection.beginTransaction(function (err) {
                    if (err) {
                        // 释放连接
                        connection.release();
                        rejected(err);
                    }
                    async.series({
                        one: function (callback) {
                            var sql = sqltool.selectSql('order', 'order_id', order_id);
                            connection.query(sql, function (err, results) {
                                if (err) callback(err, null);
                                if (results && results.length > 0) {
                                    callback(null, results[0]);
                                } else {
                                    var err = new Error('can not find order_id equalTo ' + order_id);
                                    callback(err, null);
                                }
                            });
                        },
                        two: function (callback) {
                            var sql = sqltool.deleteSql('order', 'order_id', order_id);
                            connection.query(sql, function (err, result) {
                                if (err) callback(err, null);
                                if (result) callback(null, {order_id: order_id});
                            });
                        }
                    }, function (err, result) {
                        if (err) {
                            return connection.rollback(function () {
                                // 释放连接池
                                connection.release();
                                rejected(err);
                            })
                        }
                        if (result) {
                            // 提交事物
                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function () {
                                        // 释放连接
                                        connection.release();
                                        rejected(err);
                                    })
                                }
                                // 释放连接
                                connection.release();
                                resolved(result.two);
                            })
                        }
                    });
                });
            });
        });
    },
    
    
    // 批量删除
    batchDelete: function(orders) {
        var that = this;
        return new Promise(function (resolved, rejected) {
            // 获取连接
            mysqltool.pool.getConnection(function (err, connection) {
                if (err) {
                    rejected(err);
                }
                // 开启事物
                connection.beginTransaction(function (err) {
                    if (err) {
                        // 释放连接
                        connection.release();
                        rejected(err);
                    }
                    var promises = [];
                    orders.map(function (order_id) {
                        var promise = that.deleteOrder(connection, order_id);
                        promises.push(promise);
                    });
                    Promise.all(promises).then(function (results) {
                        if (results) {
                            // 提交事物
                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function () {
                                        // 释放连接
                                        connection.release();
                                        rejected(err);
                                    })
                                }
                                // 释放连接
                                connection.release();
                                resolved(results);
                            })
                        }
                    }).catch(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                // 释放连接
                                connection.release();
                                rejected(err);
                            })
                        }
                    });
                })
            });
        });
    },


    // 按order_id 删除订单
    deleteOrder: function (connection, order_id) {
        return new Promise(function (resolved, rejected) {
            async.series({
                one: function (callback) {
                    var sql = sqltool.selectSql('order', 'order_id', order_id);
                    connection.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) {
                            callback(null, results[0]);
                        } else {
                            var err = new Error('can not find order_id equalTo ' + order_id);
                            callback(err, null);
                        }
                    });
                },
                two: function (callback) {
                    var sql = sqltool.deleteSql('order', 'order_id', order_id);
                    connection.query(sql, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, {order_id: order_id});
                    });
                }
            }, function (err, result) {
                if (err) {
                    return connection.rollback(function () {
                        // 释放连接
                        connection.release();
                        rejected(err);
                    })
                }
                if (result) resolved(result.two);
            });
        });
    },


    // 标记菜品上桌状态
    markedDishStatus: function (order_id, dish_id, isMarked) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                // 查找订单
                function (callback) {
                    var sql = sqltool.selectSql('order', 'order_id', order_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) callback(null, results[0]);
                    })
                },
                // 修改订单
                function (order, callback) {
                    var dish_list = order.dish_list;
                    dish_list = JSON.parse(dish_list);
                    dish_list.map(function (model) {
                        if (model.dish_id == dish_id) {
                            model.isMarked = isMarked;
                        }
                    });
                    var args = {dish_list: JSON.stringify(dish_list)};
                    var sql = sqltool.updateSql('order', args, 'order_id');
                    var params = sqltool.sqlParams(args);
                    params.push(order_id);
                    mysqltool.queryParam(sql, params, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, result);
                    })
                },
                // 返回更新后的信息
                function (updateResult, callback) {
                    var sql = sqltool.selectSql('order', 'order_id', order_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results && results.length > 0) {
                            var order = results[0];
                            var dish_list = JSON.parse(order.dish_list);
                            order.dish_list = dish_list;
                            callback(null, order);
                        }
                    })
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            })
        });
    }

}










ordertool.prototype.constructor = ordertool;
module.exports = new ordertool();