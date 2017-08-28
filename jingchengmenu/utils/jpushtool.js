/**
 * Created by Brisy on 2017/7/6.
 */
var request = require('request');

function jpushtool() {

}



jpushtool.prototype = {

    // 推送
    pushMessage: function (message) {
        return new Promise(function (resolved, rejected) {
            var options = {
                method: 'POST',
                url: 'https://api.jpush.cn/v3/push',
                headers:
                {
                    authorization: 'Basic MTdhNTgwNmQ5ZTlhM2ZkODA1YmIzNjM1OmMwMDg2ZjNjZDE1NTE4MDRmY2VhNmZhZA==',
                    'content-type': 'application/json'
                },
                body:
                {
                    "platform": "all",
                    "audience": "all",
                    "notification": {
                        "android": {
                            "alert": message,
                            "title": "Send to Android",
                            "builder_id": 1,
                            "extras": {
                                "newsid": 321
                            }
                        },
                        "ios": {
                            "alert": message,
                            "sound": "default",
                            "badge": "0",
                            "content-available": true,
                            "extras": {
                                "newsid": 321
                            }
                        }
                    },
                    "message": {
                        "msg_content": message,
                        "content_type": "text",
                        "title": "msg",
                        "extras": {
                            "key": "value"
                        }
                    },
                    "sms_message":{
                        "content":"sms msg content",
                        "delay_time":3600
                    },
                    "options": {
                        "time_to_live": 60,
                        "apns_production": false,
                        "apns_collapse_id":"jiguang_test_201706011100"
                    }
                },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                if (response.statusCode == 200) {
                    resolved(body);
                } else {
                    var err = new Error('push error');
                    rejected(err);
                }
            });
        });
    }
}


















jpushtool.prototype.constructor = jpushtool;
module.exports = new jpushtool();