/**
 * Created by Brisy on 2017/6/12.
 */

var mysqltool = require('./mysqltool');
var sqltool = require('./sqltool');
var async = require('async');


function restauranttool() {

}



restauranttool.prototype = {

    /********************************餐厅部分******************************************/
    // 增加餐厅
    addRestaurant: function (args) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                function (callback) {
                    var sql = sqltool.insertSql('restaurant', args);
                    var params = sqltool.sqlParams(args);
                    mysqltool.queryParam(sql, params, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, result.insertId);
                    });
                },
                function (insertId, callback) {
                    // 获取增加的餐厅数据
                    var sql = sqltool.selectSql('restaurant', 'restaurant_id', insertId);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results) callback(null, results[0]);
                    });
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            });
        });
    },



    // 更新餐厅所有信息
    updateRestaurant: function (restaurant_id, args) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                function (callback) {
                    var sql = sqltool.updateSql('restaurant', args, 'restaurant_id');
                    var params = sqltool.sqlParams(args);
                    params.push(restaurant_id);
                    mysqltool.queryParam(sql, params, function (err, result) {
                        if (err) callback(err, null);
                        if (result) callback(null, restaurant_id);
                    });
                },
                function (restaurant_id, callback) {
                    var sql = sqltool.selectSql('restaurant', 'restaurant_id', restaurant_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err);
                        if (results && results.length > 0) callback(null, results[0]);
                    });
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            });
        });
    },


    // 根据ID查询餐厅
    queryRestaurantById: function (restaurant_id) {
        return new Promise(function (resolved, rejected) {
            var sql = sqltool.selectSql('restaurant', 'restaurant_id', restaurant_id);
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results && results.length > 0) resolved(results[0]);
            });
        });
    },

    // 根据ID删除餐厅
    deleteRestaurantById: function (restaurant_id) {
        return new Promise(function (resolved, rejected) {
            async.waterfall([
                // 执行查询SQL, 先判断表中是否有对应ID的餐厅
                function (callback) {
                    var sql = sqltool.selectSql('restaurant', 'restaurant_id', restaurant_id);
                    mysqltool.query(sql, function (err, results) {
                        if (err) callback(err, null);
                        if (results) callback(null, results);
                    });
                },
                // 在判断是否执行删除操作
                function (results, callback) {
                    if (results.length == 0) {
                        var err = new Error('can not find restaurant_id equalTo ' + restaurant_id);
                        callback(err, null);
                    } else {
                        var sql = sqltool.deleteSql('restaurant', 'restaurant_id', restaurant_id);
                        mysqltool.query(sql, function (err, result) {
                            if (err) callback(err, null);
                            if (result) callback(null, {restaurant_id: restaurant_id});
                        });
                    }
                }
            ], function (err, result) {
                if (err) rejected(err);
                if (result) resolved(result);
            });
        });
    },


    // 获取餐厅列表
    getRestaurantList: function () {
        return new Promise(function (resolved, rejected) {
            var sql = 'SELECT * FROM restaurant';
            mysqltool.query(sql, function (err, results) {
                if (err) rejected(err);
                if (results) resolved(results);
            });
        });
    }

}




















restauranttool.prototype.constructor = restauranttool;
module.exports = new restauranttool();