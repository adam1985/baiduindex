var cheerio = require('cheerio'),
    fs = require('fs'),
    ng = require('nodegrass');

var pageurls = ['http://www.proxy360.cn/Region/China',
    'http://www.proxy360.cn/Region/Brazil',
    'http://www.proxy360.cn/Region/America',
    'http://www.proxy360.cn/Region/Taiwan',
    'http://www.proxy360.cn/Region/Japan',
    'http://www.proxy360.cn/Region/Thailand',
    'http://www.proxy360.cn/Region/Vietnam',
    'http://www.proxy360.cn/Region/bahrein'
];
var startIndex = 0, pageSize = pageurls.length;
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
        if (startIndex < pageSize) {
            ng.get('http://www.proxy360.cn/Proxy', function (data) {
                $ = cheerio.load(data);
                var proxylistitem = $('.proxylistitem'),
                    proxyList = [];

                proxylistitem.each(function () {
                    var tbBottomLines = $(this).find('.tbBottomLine');
                        proxyList.push(tbBottomLines.eq(0).text().replace(/\s+/g, '') + ':' + tbBottomLines.eq(1).text().replace(/\s+/g, ''));
                });

                totalProxyIps = totalProxyIps.concat(proxyList);

                console.log('正在获取第' + startIndex + '页数据');

                startIndex++;

                args.callee();

            }, {
                "User-Agent" : "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36"
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
