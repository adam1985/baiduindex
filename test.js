/**
 * 使用命令
 *  node unique [filename]
 *
 */

var sys = require('sys'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    fork = require('child_process').fork,
    dateFormat = require('./module/dateFormat'),
    urlencode = require('urlencode'),
    net = require('net'),
    tools = require('./module/tools'),
    readJson = require('./module/readJson'),
    Deferred = require( "JQDeferred"),
    createPath = __dirname + '/create/',
    nodeCsv = require('node-csv'),
    successPath = createPath + 'filmlist_20141227/success.txt',
    noneresPath = createPath + 'filmlist_20141227/noneres.txt',
    baiduindexPath = createPath + 'filmlist_20141227/baiduindex.txt',
    csvPath = __dirname + '/filmlist/filmlist_20141227.csv';


var mlist = [], line = 1, index2 = 1;
nodeCsv.each(csvPath).on('data', function(data) {
    var filmType = tools.trim(data[4]) || 'NULL',
        filmName = tools.trim(data[5]);
    if( filmName ) {
        mlist.push({
            type : filmType,
            name : filmName
        });
    } else {
        console.log(line, filmName);
    }
    line++;
}).on('end', function() {
    console.log(mlist.length);
    mlist = tools.unique(mlist, true, 'name');
    console.log(mlist.length);
    readJson(successPath, function(sucesslist){
        console.log('success:', sucesslist.length, tools.unique(sucesslist, true, 'name').length);
        readJson(noneresPath, function(nonereslist){
            console.log('noneres:', nonereslist.length, tools.unique(nonereslist, true, 'name').length);
            var list = sucesslist.concat(nonereslist);

            tools.unique(nonereslist, true, 'name', function(reslist, reqlist){
                console.log(reqlist);

            });

            tools.unique(list, true, 'name', function(reslist, reqlist){
                //console.log(reqlist);
                console.log('single:', reslist.length, reqlist.length);

                tools.each(mlist, function(i, v){
                    var find = false;
                    tools.each(reslist, function(ii, vv){
                        if( vv.name == v.name && vv.type != v.type ){
                            console.log(vv.name, vv.type , v.type);
                        }
                    });

                });
            });

        }, 'json');
    }, 'json');

});


readJson(baiduindexPath, function(list){
    var obj = {};
    tools.each(list, function(i, v){
        obj[v.split(/\s+/)[1]] = 1;
    });

    readJson(successPath, function(sucesslist){
        console.log(sucesslist.length, Object.keys(obj).length);
        tools.each(sucesslist, function(i, v){
            if(!obj[v.name]) {
                console.log(v.name);
                index2++;
            }
        });
        //console.log(index2);
    }, 'json');

});


/*readJson(successPath, function(sucesslist){

    tools.unique(sucesslist, true, 'name', function(reslist, reqlist){
        console.log(reslist.length, reqlist.length);
    });

}, 'json');

readJson(noneresPath, function(nonereslist){
    tools.unique(nonereslist, true, 'name', function(reslist, reqlist){
        console.log(reslist.length, reqlist.length);
    });

}, 'json');*/


/*    var index = 1, len = 20, list = [];
    (function(){
        var arg = arguments;
        if( index <= len ){
            readJson(createPath + index +  '/filmlist.txt', function(reslist){
                list = list.concat(reslist);
                index++;
                arg.callee();
            });
        } else {
            console.log(list.length);
        }
    }());*/

/*var mlist = [], line = 1;
nodeCsv.each(createPath + 'filmlist_20141210/filmlist_20141210.csv').on('data', function(data) {
    var filmType = tools.trim(data[4]) || 'NULL',
        filmName = tools.trim(data[5]);
    if( filmName ) {
        mlist.push({
            type : filmType,
            name : filmName
        });
    } else {
        console.log(line, filmName);
    }
    line++;
}).on('end', function() {
    mlist = tools.unique(mlist, true, 'name');
   console.log(mlist.length);
});*/









