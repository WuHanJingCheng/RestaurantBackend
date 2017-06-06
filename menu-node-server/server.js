'use strict';

var app = require('./app');


var PORT = process.env.PORT || 1337;


app.listen(PORT, function (err) {
    console.log('Node app is running on port:', PORT);

    // 注册全局未捕获异常处理器
    process.on('uncaughtException', function(err) {
        console.error("Caught exception:", err.stack);
    });
    process.on('unhandledRejection', function(reason, p) {
        console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason.stack);
    });
});


//
//var http = require('http');
//
//var server = http.createServer(function(request, response) {
//
//    response.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
//    response.end("武汉精诚文化传播有限公司");
//
//});
//
//var port = process.env.PORT || 1337;
//server.listen(port);
//
//console.log("Server running at http://localhost:%d", port);
