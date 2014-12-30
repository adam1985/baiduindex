var nodeCsv = require('node-csv'),
    lineReader = require('line-reader'),
    readJson = require('./readJson'),
    tools = require('./tools');

var inArray = function( arr, value){
    var _inArray = false;
    arr.forEach(function(v){
        if( v.name == value ) {
            _inArray = true;
            return false;
        }
    });
    return _inArray;
};

var getFilmList = function( workPath, dataPath,  cb, type){
     var objState = {}, resList = [];

        readJson(workPath + 'filmlist.txt', function( mlist ){
            mlist.forEach(function(v){
                var filmName = tools.trim(v.name);
                if( filmName && !objState[filmName]) {
                    resList.push( v );
                }
            });

            cb && cb( resList );

        }, 'json');

 };

module.exports = getFilmList;
