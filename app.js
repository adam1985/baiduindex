
/**
 * 使用命令
 *  node app [startIndex] [excuteType] [taskAmount] [restart]
 *
 */

var sys = require('sys'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    fork = require('child_process').fork,
    os = require('os'),
    path = require('path'),
    dateFormat = require('./module/dateFormat'),
    tools = require('./module/tools'),
    readJson = require('./module/readJson'),
    getAllFilmList = require('./module/getAllFilmList');

var dirPath = './create/',
    backupPath = './backup/',
    filmlistPath = __dirname + '/filmlist/',
    filmNotePath = __dirname + '/conf/filmNote.txt';

/**
 * 处理参数
 * @type {Array}
 */

var arguments = process.argv.splice(2);
if( arguments.length < 3 ){
    throw new Error('至少需要三个参数');
}

var startIndex = parseInt(arguments[0]),
    excuteType = arguments[1],
    taskAmount = parseInt(arguments[2]),
    restart = arguments[3],
    mlistIndex = startIndex;


//备份
dateFormat.format();
var initTime = new Date();
var dateString = initTime.format("yyyyMMddhhmmss");
//spawn('cp', ["-r", dirPath, backupPath + dateString] );
//console.log('成功备份数据');


var startTime = '', endTime = '';

var appendFile = function( path, content ){
    var isexists = fs.existsSync(path);
    if(isexists) {
        fs.appendFileSync(path, content);
    } else {
        fs.writeFileSync(path, content);
    }
};

var appLoger = function( message, data, taskname ){
    data = data || [];
    var copyData = data.concat();
    var now = new Date(), logerPath = dirPath + taskname + '/node.txt';
    copyData.push( now.format("hh:mm:ss") );
    if( fs.existsSync(logerPath) ) {
        fs.appendFileSync(logerPath,  message + ',' + copyData.join(' ') + '\r\n');
    } else {
        fs.writeFileSync(logerPath,  message + ',' + copyData.join(' ') + '\r\n');
    }

};

var interfaceMerge = function(taskName, cb){
    var taskDir = dirPath + taskName + '/';
    var fileList = ['success', 'noneres', 'baiduindex'];
    var isHasFile = ( function(){
        var _isHasFile = false;
        tools.each(fileList, function(i, v){
            if( fs.existsSync(taskDir + v + '.txt') ) {
                _isHasFile = true;
                return false;
            }
        });
        return _isHasFile;
    }());

    if( !isHasFile ) {
        var worker = fork('merge.js', [taskName, 'success', 'noneres', 'baiduindex'], {silent:true});

        // 监听子进程exit事件
        worker.on('exit',function(){
            appLoger('接口文件合并完成', [], taskName);
            console.log('接口文件合并完成');
            cb && cb();
        });

        worker.stdout.on('data', function (stdout) {
            console.log(stdout.toString());
        });
    }
};

//保存被子进程实例数组
var workers = {};
//这里的被子进程理论上可以无限多
var appsPath = {};
var taskState = {};
var completeProcess = {};
var createWorker = function(appPath){

    var len = appPath.args.length;
    //保存fork返回的进程实例
    var worker = fork(appPath.path, appPath.args, {silent:true});

    var taskName = appPath.args[len-1];
    completeProcess[taskName] = [];
    workers[taskName] = {};
    //监听子进程exit事件
    worker.on('exit',function(){
        console.log('worker:' + worker.pid + 'exited');
        appLoger('worker:' + worker.pid + 'exited', appPath.args, taskName );

        if( !taskState[appPath.args[len-2]] ) {
            delete workers[taskName][worker.pid];
            appPath.args[0] = -1;
            createWorker(appPath);
        }

    });

    worker.stdout.on('data', function (stdout) {
        stdout = stdout.toString();
        console.log(stdout);

    });

    worker.on('message', function(res){
        if( res.complete  ){
            var processIndex = appPath.args[len-2];
            taskState[processIndex] = 1;
            appLoger('任务已完成:' + processIndex, appPath.args, taskName);
            delete workers[taskName][worker.pid];
            completeProcess[taskName].push(processIndex);
            if( completeProcess[taskName].length >= taskAmount ) {
                interfaceMerge( taskName, function(){
                    var platform = os.platform();
                    if( !/win/.test(platform) ) {
                        var tarPath = __dirname + '/create/' + taskName + '/';
                        var tarSpawn = spawn('tar', ["jcvf", tarPath + "baiduindex.tar.bz2", "-C", tarPath,  'data/',  'success.txt', 'noneres.txt', 'baiduindex.txt']);
                        tarSpawn.on('exit', function () {
                            var confPath = __dirname + '/conf/';
                            readJson(confPath + 'mail.txt', function(list){
                                if( list.length ){
                                    var maillist = [];
                                    list.forEach(function(v){
                                        if(v.name){
                                            maillist.push(v.mail);
                                        }
                                    });

                                    var now = new Date();
                                    endTime = now.format("yyyy-MM-dd hh:mm:ss");
                                    var mailTopic = taskName + ".csv百度指数抓取数据，" + endTime;


                                    var mailSpawn = spawn('mail', ["-s", mailTopic, "-a" , tarPath + "baiduindex.tar.bz2"].concat(maillist));

                                    readJson(confPath + 'filmNote.txt', function(list){
                                        var filmStr = '';
                                        list.forEach(function(v, i){
                                            if(v.name.indexOf( taskName) != -1 ){
                                                list[i].complete = true;
                                                list[i].endTime = endTime;
                                            }

                                            filmStr += JSON.stringify(v) + '\r\n';

                                        });

                                        fs.writeFileSync(confPath + 'filmNote.txt', filmStr);

                                        appLoger(taskName + '.csv影片列表抓取完成', [], taskName);
                                        console.log(taskName + '.csv影片列表抓取完成');

                                        delete completeProcess[taskName];
                                        delete appsPath[taskName];
                                        delete workers[taskName];
                                        timerTask();

                                    }, 'json');

                                    mailSpawn.on('exit', function () {});

                                }
                            }, 'json');

                        });
                    }
                });

            }
            worker.kill();
        }
    });

    workers[taskName][worker.pid] = worker;
    console.log('Create worker:' + worker.pid);
    appLoger('Create worker:' + worker.pid, appPath.args, taskName);
};

// 启动进程
var startWorder = function(name) {
    appsPath[name] = [];
    for(var i = 1; i <= taskAmount; i++){
        appsPath[name].push({
            path : './index.js',
            args :  [startIndex, excuteType, i, name]
        });
    }
    //启动所有子进程
    var taskIndex = 0;
    (function(){
        var args = arguments;
        if( taskIndex < appsPath[name].length ) {
            createWorker(appsPath[name][taskIndex]);
            taskIndex++;
            setTimeout(function(){
                args.callee();
            }, 500);
        }
    }());

    //父进程退出时杀死所有子进程
    process.on('exit',function(){
        tools.each(workers, function(key, val){
            tools.each(val, function(k, v){
                v.kill();
            })
        });
        console.log('强行退出，或者任务执行完成!');
    });

    console.log('已经启动服务，数据正在抓取!');
};

// 启动抓取服务
var startApp = function(name, path){
    name = name.replace(/\.\w+$/, '');

    var taskPath = dirPath + name + '/', fileCount = 0;
        if( fs.existsSync(taskPath) ) {
            fileCount = fs.readdirSync(taskPath).length;
        }


    if( fileCount >= taskAmount ) {
        startIndex = -1;
        restart = null;
    } else {
        startIndex = 0;
        restart = 1;
    }

    var isAgain = fs.existsSync(dirPath + 'noneres.txt') || fs.existsSync(dirPath + 'success.txt');

    if( restart || isAgain) {
        getAllFilmList(path, function(data){
            var filmType = tools.trim(data[4]);
            return true;
        }, function(mList){
            //mList = mList.slice(0 , 50);
            console.log('正在分配任务，请稍后...');
            console.log('总共有' + ( mList.length ) + '个影片关键词!');
            var tastSize = parseInt(mList.length / taskAmount),
                remainSize = mList.length % taskAmount,
                filmPath = dirPath + 'filmlist.txt';

            if( isAgain ) {
                var listStr = '';
                mList.forEach(function (v) {
                    listStr +=  JSON.stringify(v) + '\r\n';
                });

                fs.writeFileSync( filmPath, listStr );

                createWorker({
                    path : './index.js',
                    args :  [-1, 'again', -1, name]
                });

            } else {

                var childTaskIndex = 1;
                (function(){
                    var args = arguments;
                    if( childTaskIndex <= taskAmount ) {
                        var filmdir = dirPath + name +'/',
                            tastName = filmdir + childTaskIndex,
                            dataDir = tastName + '/data',
                            backupDir = tastName + '/backup',
                            fileName = tastName + '/filmlist.txt';

                        if(  startIndex == 0 ) {
                            if( fs.existsSync( fileName ) ){
                                //fs.unlinkSync( fileName );
                            }
                        }

                        if( !fs.existsSync(filmdir) ){
                            fs.mkdirSync(filmdir);
                        }

                        if( !fs.existsSync(tastName) ){
                            //spawn('mkdir',[tastName]);
                            //spawn('mkdir',[dataDir]);
                            //spawn('mkdir',[backupDir]);
                            fs.mkdirSync(tastName);
                            fs.mkdirSync(dataDir);
                            //fs.mkdirSync(backupDir);
                        }

                        var tastList = mList.splice(0, tastSize), appendContent = '';
                        tastList.forEach(function(v){
                            appendContent +=  JSON.stringify(v) + '\r\n';
                        });

                        if( childTaskIndex == taskAmount ) {
                            mList.splice(0, remainSize).forEach(function(v){
                                appendContent +=  JSON.stringify(v) + '\r\n';
                            });
                        }

                        fs.writeFileSync( fileName,appendContent );

                        childTaskIndex++;
                        setTimeout(function(){
                            args.callee();
                        }, 500);

                        // >>node.log 2>&1  &

                    } else {
                        startWorder(name);
                    }
                }());
            }

        });
    } else {
        startWorder(name);
    }
};

var readFilmList = function( cb ) {
    var basenames = fs.readdirSync(filmlistPath) || [], count = basenames.length;
    if (count > 0) {
        readJson(filmNotePath, function(list){
            var index = 1, length = list.length ;
            if( length ){
                index = list[length-1].index + 1;
            }
            basenames.forEach(function (basename) {
                var filename = path.join(filmlistPath, basename),
                    stat = fs.statSync(filename),
                    isFile = stat.isFile();
                if( isFile ) {
                    var isAppend = true;
                    tools.each(list, function(i, v){
                        if( tools.trim(v.name) == tools.trim(basename) ) {
                            isAppend = false;
                            return false;
                        }
                    });

                    if( isAppend ) {
                        appendFile(filmNotePath, JSON.stringify({
                            index : index,
                            name : basename,
                            path : filename,
                            complete : false
                        }) + '\r\n');
                        index++;
                    }
                }

            });

            var targetFilmname, targetFilmPath;
            readJson(filmNotePath, function(list){
                tools.each(list, function(i, v){
                    if(v.complete === false){
                        targetFilmname = v.name;
                        targetFilmPath = v.path;
                        return false;
                    }
                });

                cb && cb( targetFilmname, targetFilmPath );

            }, 'json');
        }, 'json');

    }

};

var timerTastOut;
var timerTask = function( time ){
    var arg = arguments;
    time = time || 5000;
    timerTastOut && clearTimeout(timerTastOut);
    timerTastOut = setTimeout(function(){
        readFilmList(function(name,path){
            if( name ) {
                timerTastOut && clearTimeout(timerTastOut);
                var now = new Date(), confPath  = __dirname + '/conf/';
                startTime = now.format("yyyy-MM-dd hh:mm:ss");
                readJson(confPath + 'filmNote.txt', function(list){
                    var filmStr = '';
                    list.forEach(function(v, i){
                        if(v.name.indexOf( name ) != -1 ){
                            list[i].startTime = startTime;
                        }

                        filmStr += JSON.stringify(v) + '\r\n';

                    });

                    fs.writeFileSync(confPath + 'filmNote.txt', filmStr);

                    startApp(name, path);

                }, 'json');

            } else {
                arg.callee();
            }

        });
    }, time);

};

timerTask();


// 启动抓取代理

/*var startProxyWorker = function() {

    //保存fork返回的进程实例
    var worker = fork('fetchIp.js', [-1, 'online', -1], {silent: true});
    //监听子进程exit事件
    worker.on('exit', function () {
        console.log('代理worker:' + worker.pid + '已经退出!');
        startProxyWorker();
    });
};

startProxyWorker();*/
