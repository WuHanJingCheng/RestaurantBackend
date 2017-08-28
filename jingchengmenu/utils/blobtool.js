/**
 * Created by Brisy on 2017/6/12.
 */
var azure = require('azure-storage');
var md5 = require('md5');



// 连接字符串
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=menublob;AccountKey=0yUIHb4ePP9dfv+kZb/KNRzbG7Pi1GhXMVMBs2vO3TCijQS4Mf76LdOSug61J0SpkgHQB8hLHD6QXFB1FdjXkQ==;EndpointSuffix=core.chinacloudapi.cn';
// 创建一个BlobService对象
var blobSvc = azure.createBlobService(connectionString);
// 创建一个容器
blobSvc.createContainerIfNotExists('images', {publicAccessLevel : 'blob'}, function(error, result, response){
    if(!error){
        // Container exists and is private
        var err = new Error('Container exists and is private');
    }
    if (result) {
        if (result.created == true) {
            console.log('create a new container success');
        } else {
            console.log('container exists');
        }
    }

});


function blobtool() {

}





blobtool.prototype = {

    // 上传文件至blob容器
    uploadFileToBlob: function (path) {
        return new Promise(function (resolved, rejected) {
            var timestramp = parseInt(new Date().getTime()/1000).toString();
            var filename = timestramp + parseInt(Math.random() * 100).toString();
            filename = md5(filename) + '.jpg';
            blobSvc.createBlockBlobFromLocalFile('localcontainer', 'dishs/' + filename, path, function(error, result, res){
                if (error) rejected(error);
                if (res.statusCode == 200 || res.statusCode == 201) {
                    var url = blobSvc.host.primaryHost + 'localcontainer/dishs/' + filename;
                    resolved(url);
                } else {
                    var newErr = new Error('upload file fail.');
                    rejected(newErr);
                }
            });
        });
    }


}



















blobtool.prototype.constructor = blobtool;
module.exports = new blobtool();