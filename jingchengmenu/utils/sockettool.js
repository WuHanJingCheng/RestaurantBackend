///**
// * Created by Brisy on 2017/6/13.
// */
//
//
////建立MySQL连接, 根据自己环境修改相应的数据库信息
//var app = require('express')();
//var server = require('http').createServer(app);
//var io = require('socket.io')(server);
//io.on('connection', function(){
//    console.log('哈哈哈');
//});
//server.listen(8080);
//
//
//
//var path = require('path');
//var POLLING_INTERVAL = 1000;
//var pollingTimer;
//var connectionsArray = [];
//var connection;
//
//var mysql = require('mysql');
//const config = {
//    host     : 'menusql.mysqldb.chinacloudapi.cn',
//    port     : 3306,
//    user     : 'menusql%zhangxu',
//    password : 'jingcheng008',
//    charset  : 'utf8mb4_general_ci',
//    database : 'jingchengmenudb'
//}
//
//
//
//function handleDisconnect() {
//    connection = mysql.createConnection(config);
//    connection.connect(function(err) {
//        if(err) {
//            console.log('error when connecting to db:', err.message);
//            setTimeout(handleDisconnect, 2000);
//        }
//    });
//    connection.on('error', function(err) {
//        console.log('db error', err.message);
//        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
//            handleDisconnect();
//        }else{
//            throw err.message;
//        }
//    });
//}
//// mysql 断线重连
//handleDisconnect();
//
//
//
//app.set('views', path.join(__dirname, '/../views'));
//app.set('view engine', 'ejs');
//
//app.use('/', function (req, res) {
//    res.render('index');
//});
//
//
///*
// * 这个就是实现主要功能的方法，间隔3秒去查询数据库表，有更新就推送给客户端
// */
//var pollingLoop = function() {
//
//    // 查询数据库
//    var orders = [];
//    var timestamp = parseInt(new Date().getTime()/1000) - parseInt(3);
//    var sql = 'SELECT * FROM `order` WHERE timestamp>\"' + timestamp.toString + '\" ORDER BY timestamp DESC;';
//    var query = connection.query(sql);
//    // 查询结果监听
//    query.on('error', function (err) {
//        console.log(err);
//        updateSockets(err);
//    }).on('result', function (result) {
//        orders.push(result);
//    }).on('end', function () {
//        if (connectionsArray.length) {
//            pollingTimer = setTimeout(pollingLoop, POLLING_INTERVAL);
//            updateSockets({
//                orders: orders
//            });
//            console.log(orders);
//        }
//    });
//};
//
//
//// 创建一个websocket连接，实时更新数据
//io.sockets.on('connection', function(socket) {
//
//    console.log('当前连接客户端数量:' + connectionsArray.length);
//    // 有客户端连接的时候才去查询，不然都是浪费资源
//    if (!connectionsArray.length) {
//        pollingLoop();
//    }
//
//    socket.on('disconnect', function() {
//        var socketIndex = connectionsArray.indexOf(socket);
//        console.log('socket = ' + socketIndex + ' disconnected');
//        if (socketIndex >= 0) {
//            connectionsArray.splice(socketIndex, 1);
//        }
//    });
//
//    console.log('有新的客户端连接!');
//    connectionsArray.push(socket);
//
//});
//
//var updateSockets = function(data) {
//    // 推送最新的更新信息到连接到服务器的客户端
//    connectionsArray.forEach(function(tmpSocket) {
//        tmpSocket.volatile.emit('notification', data);
//    });
//};
//
