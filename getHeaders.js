var page = require('webpage').create();
var sys =  require('system');

var url =sys.args[1];

var header = {
    operation: "GET",
    encoding: "utf8",
    headers: {
        "User-Agent" : "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36",
        "Host": "www.xici.net.co",
        "If-None-Match":"865dd09d9639b6aeb59e741609d069bc",
        "Cookie" : "incap_ses_219_257263=/NAyfN+ODmleXrF4RAwKAxaDuFQAAAAAviYus6AeETfQQyZ0bERmHw==; visid_incap_257263=neH5Dmm8SMOEZkiXRwoJkBaDuFQAAAAAQUIPAAAAAAA7nkcKjFx/oEoPxnAloH5O; incap_ses_218_257263=9gtmKj0p5QX15ikhOn4GAxaDuFQAAAAA9xzlrCnvPn6uxRsmNmVTaQ==; ___utmvmkOuaVkV=NSYDUaFBHtP; ___utmvakOuaVkV=rSosYzt; ___utmvbkOuaVkV=hZu XcFOxalf: utB"
    }
};

console.log(url);

page.open( url, header, function(status){
    console.log(status);
    //if( status == 'success'){
        console.log(JSON.stringify(page.cookies));
    //}

} );
