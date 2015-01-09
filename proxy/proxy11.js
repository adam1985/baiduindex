var cheerio = require('cheerio'),
    fs = require('fs'),
    ng = require('nodegrass');


var startIndex = 1, pageSize = 10;
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
            ng.get('http://www.xici.net.co/wt/' + startIndex, function (data) {
                console.log(data);
                $ = cheerio.load(data);
                var table = $('#ip_list'),
                    lineTr = table.find('tr'),
                    proxyList = [];

                lineTr.each(function (index) {
                    var ceils = $(this).find('td');
                    if( index > 0 ) {
                        proxyList.push(ceils.eq(2).text() + ':' + ceils.eq(3).text());
                    }
                });

                totalProxyIps = totalProxyIps.concat(proxyList);

                console.log('正在获取第' + startIndex + '页数据');

                startIndex++;

                args.callee();

            }, {
                "User-Agent" : "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36",
                "Host":"www.xici.net.co",
                "If-None-Match":"865dd09d9639b6aeb59e741609d069bc",
                "Cookie" : "incap_ses_219_257263=a89sch02OTahB9NyRAwKA7J6r1QAAAAAZfmoJTB0uMHoE/tBkzzkwQ==;"
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


exports.getproxy = getproxy;
