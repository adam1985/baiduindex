var cheerio = require('cheerio'),
    fs = require('fs'),
    ng = require('nodegrass');

var createFile = function( path, content ) {
    var isexists = fs.existsSync(path);
    if(isexists) {
        fs.unlinkSync(path);
    }
    fs.writeFileSync(path, content);

};

var getproxy = function( callback ) {
    console.log('start getproxy ip...');

    ng.get('http://www.youdaili.net/Daili/Socks/', function (data) {
        $ = cheerio.load(data);
        var titles = $('.newslist_line a'), pageUrls = [];
        titles.each(function(){
            pageUrls.push($(this).attr('href'));
        });

        var totalProxyIps = [], outLength = pageUrls.length, outIndex = 0;


        (function(){
            var outArg = arguments;
            if( outIndex < outLength ){
                var targetUrl = pageUrls[outIndex];
                var startIndex = 1, pageSize = 1;
                (function () {
                    var args = arguments;
                    if (startIndex <= pageSize) {
                        var url;
                        if( startIndex == 1 ){
                            url = targetUrl
                        } else {
                            url = targetUrl.replace(/\.html/, '_' + startIndex + '.html');
                        }
                        ng.get(url, function (data) {

                            $ = cheerio.load(data);
                            var article_content = $('.content_newslist').html(),
                                rex = /\d+\.\d+\.\d+\.\d+:\d+/gm,
                                totalPage = 1,
                                proxyList = [];

                            try{
                                totalPage = parseInt(/\d+/.exec($('.pagelist li').eq(0).text())[0]);
                            } catch(e){

                            }
                            pageSize = totalPage;

                            try{
                                proxyList = article_content.match(rex)
                            } catch (e){

                            }



                            totalProxyIps = totalProxyIps.concat(proxyList);

                            console.log('正在获取第' + outIndex + ":" + startIndex + '页数据');

                            startIndex++;

                            args.callee();

                        }).on('error', function(e) {
                            startIndex++;
                            args.callee();
                        });
                    } else {
                        outIndex++;
                        outArg.callee();
                    }

                }());
            } else {
                console.log('done!!!');
                callback && callback(totalProxyIps);
            }
        }());
    });

};

/*getproxy(function(list){
 console.log(list,list.length);
 });*/
exports.getproxy = getproxy;
