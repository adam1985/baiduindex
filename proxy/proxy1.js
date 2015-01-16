var cheerio = require('cheerio'),
	fs = require('fs'),
    ng = require('nodegrass');
	
	
var startIndex = 1, pageSize = 1;
var createFile = function( path, content ) {
	var isexists = fs.existsSync(path);
	if(isexists) {
		fs.unlinkSync(path);
	}
	fs.writeFileSync(path, content);
	
};

var getproxy = function( callback ) {
    console.log('start getproxy ip...');

    var totalProxyIps = [];

    (function () {
        var args = arguments;
        if (startIndex <= pageSize) {
            ng.get('http://www.66ip.cn/mo.php?sxb=&tqsl=100000&port=&export=&ktip=&sxa=&submit=%CC%E1++%C8%A1&textarea=' + startIndex, function (data) {

                var content = data,
                    rex = /\d+\.\d+\.\d+\.\d+:\d+/gm, proxyIps = [];
                if( content ) {
                    proxyIps = content.match(rex);
                }

                totalProxyIps =  totalProxyIps.concat(proxyIps);

                console.log('正在获取第' + startIndex + '页数据');

                startIndex++;

                args.callee();

            }).on('error', function(e) {
                startIndex++;
                args.callee();
            });
        } else {
            console.log('done!!!');
            callback && callback(totalProxyIps);
        }

    }());

};
/*getproxy(function(list){
 console.log(list,list.length);
 });*/
exports.getproxy = getproxy;