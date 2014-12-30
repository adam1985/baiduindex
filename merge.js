/**
 * 使用命令
 *  node merge [filename, filename,...]
 *
 */

var sys = require('sys'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    path = require('path'),
    tools = require('./module/tools'),
    readJson = require('./module/readJson');



/**
 * 处理参数
 * @type {Array}
 */

var args = process.argv.splice(2),
    taskName = args[0],
    filelists = args.slice(1),
    filetype = ['baiduindex', 'noneres', 'success'];
    isMerge = args.length;

var dirPath = './create/',
    backupPath = './backup/',
    isComplete = false;

    if( tools.inArray(filetype, taskName)  ) {
        filelists = args;
    } else {
        dirPath += taskName + '/';
    }

var inArray = function(arr, val){
        var _inArray = false;
        arr.forEach(function(v){
            if( val.indexOf( v ) != -1 ) {
                _inArray = true;
            }
        });

    return _inArray;
};


var dirExp = /create\W(?:\w+\W)?\d+\Wdata/;

function mergeInterface (dirname, filelists, cb) {
    var index1 = 0, index2 = 0, index3 = 0, len1 = 0, len2 = 0, len3 = 0;
    filelists.forEach(function(v){
        if( fs.existsSync(dirPath + v + '.txt') ) {
            fs.unlinkSync(dirPath + v + '.txt');
        }
    });

    fs.readdir(dirname, function(err, basenames) {
        var basenamesCache = basenames.concat();
        basenames = [];

        tools.each(basenamesCache, function(i, v){
            if( /^\d{1,3}$/.test(v)) {
                basenames.push(v);
            }
        });
        len1 = basenames.length;
        index1 = 0;
        if (len1 > 0 ) {
            (function(){
                var arg1 = arguments;
                if( index1 < len1 ) {
                    var filename = path.join(dirname, basenames[index1]);
                    fs.stat(filename, function (err, stats) {
                        if (err) throw err;

                        if (stats.isDirectory()){
                            var dataPath = path.normalize(filename + '/data/');

                            fs.readdir(dataPath, function(err, flists) {
                                len2 = flists.length;
                                index2 = 0;
                                if (len2 > 0) {
                                    (function(){
                                        var arg2 = arguments;
                                        if( index2 < len2 ) {
                                            var targetfile = flists[index2],
                                                innerFileName = path.join(dataPath, flists[index2]);
                                            fs.stat(innerFileName, function (err, innerstats) {
                                                if (err) throw err;
                                                if (innerstats.isFile()) {
                                                    if (dirExp.test(dataPath) && inArray(filelists, targetfile)) {
                                                        if (/baiduindex/.test(innerFileName)) {
                                                            readJson(innerFileName, function (list) {
                                                                list.forEach(function (v) {
                                                                    if (fs.existsSync(dirPath + targetfile)) {
                                                                        fs.appendFileSync(dirPath + targetfile, v + '\r\n');
                                                                    } else {
                                                                        fs.writeFileSync(dirPath + targetfile, v + '\r\n');
                                                                    }
                                                                });
                                                                index2++;
                                                                arg2.callee();

                                                            });
                                                        } else {

                                                            readJson(innerFileName, function (targetList) {

                                                                targetList.forEach(function (v, i) {
                                                                    if (!fs.existsSync(dirPath + targetfile)) {
                                                                        fs.writeFileSync(dirPath + targetfile, JSON.stringify(v) + '\r\n');
                                                                    } else {
                                                                        fs.appendFileSync(dirPath + targetfile, JSON.stringify(v) + '\r\n');
                                                                    }
                                                                });

                                                                index2++;
                                                                arg2.callee();

                                                            }, 'json');

                                                        }
                                                    } else {
                                                        index2++;
                                                        arg2.callee();
                                                    }
                                                } else {
                                                    index2++;
                                                    arg2.callee();
                                                }
                                            });
                                        } else {
                                            index1++;
                                            arg1.callee();
                                        }
                                    }());
                                }
                            });
                        }

                    });
                } else {
                    var sortlists = ["success", "noneres"];
                    len3 = sortlists.length;
                    index3 = 0;
                    (function(){
                        var arg3 = arguments;
                        if( index3 < len3 ) {
                            var v = sortlists[index3];
                            if( !/baiduindex/i.test(v)){
                                var path = dirPath + v + '.txt';
                                if( fs.existsSync(path) ) {
                                    readJson(path, function(targetList){
                                        targetList = targetList.sort(function(a, b){
                                            return a.index - b.index;
                                        });
                                        targetList.forEach(function(v, i){
                                            if( i == 0 ){
                                                fs.writeFileSync(path, JSON.stringify(v) + '\r\n');
                                            } else {
                                                fs.appendFileSync(path, JSON.stringify(v) + '\r\n');
                                            }
                                        });

                                        index3++;
                                        arg3.callee();

                                    }, 'json');
                                }
                            }
                        } else {
                            cb && cb();

                        }
                    }());
                }
            }());
        }
    });

}

console.log('开始合并接口文件');
mergeInterface(dirPath, filelists, function(){
    console.log('接口文件排序完成!');
});















