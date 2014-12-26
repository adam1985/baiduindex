
/usr/bin/nohup /usr/local/bin/node fetchIp 0 20140828104032 -1
cd /root/phantom && forever start -l /root/phantom/log/ip_forever.log -e /root/phantom/log/ip_err.log -a fetchIp.js 0 201409011523 -1

/usr/bin/nohup /usr/local/bin/node app -1 restart 20

kill -9 `ps -ef |grep xxx|awk '{print $2}' `

// 开发环境下
cd /root/phantom && forever start -l /root/phantom/log/forever.log -e /root/phantom/log/err.log -a app.js 0 restart 20 1

cd /opt/data/baiduindex && forever start -l /opt/data/baiduindex/log/forever.log -e /opt/data/baiduindex/log/err.log -a app.js 0 restart 20 1
cd /opt/data/baiduindex && forever start -l /opt/data/baiduindex/log/ip_forever.log -e /opt/data/baiduindex/log/ip_err.log -a fetchIp.js -1 online -1

// 线上环境下
forever start -l log/forever.log -e log/err.log -w -a app.js 0 restart 20 1

node index 0 restart 1 filmlist_20141225

node fetchIp 0 online -1

/opt/hadoopbusiness/ComETL2/mapred

cd /opt/hadoopbusiness/ComETL2/mapred/baiduindex && forever start -l /opt/hadoopbusiness/ComETL2/mapred/baiduindex/log/forever.log -e  /opt/hadoopbusiness/ComETL2/mapred/baiduindex/log/err.log -w -a app.js 0 restart 20 1
cd /opt/hadoopbusiness/ComETL2/mapred/baiduindex && forever start -l /opt/hadoopbusiness/ComETL2/mapred/baiduindex/log/ip_forever.log -e /opt/hadoopbusiness/ComETL2/mapred/baiduindex/log/ip_err.log -w -a fetchIp.js -1 online -1