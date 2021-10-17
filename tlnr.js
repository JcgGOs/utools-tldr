const path = require('path')
const fs = require('fs')
const fsPromises = fs.promises; 
const http = require("http")

function httpGet(uri) {
    return new Promise(function (resolve, reject) {
        var options = {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36 Edg/94.0.992.50",
        }
        var req = http.get(uri, options, function (res) {
            // reject on bad status
            if (Math.floor(res.statusCode / 100) !== 2) {
                return reject(new Error('statusCode=' + res.statusCode));
            }
            // cumulate data
            var body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            // resolve on end
            res.on('end', function () {
                try {
                    resolve(Buffer.concat(body).toString());
                } catch (e) {
                    reject(e);
                }

            });
        });
        // reject on request error
        req.on('error', function (err) {
            reject(err); // This is not a "Second reject", just a different sort of failure
        });

        req.end(); // IMPORTANT
    });
}

const parseContent = function (content) {
    return [
        {
            'description': 'test',
            'sample': 'curl baidu.com',
        },
        {
            'description': 'test',
            'sample': 'curl baidu.com',
        },
        {
            'description': 'test',
            'sample': 'curl baidu.com',
        },
        {
            'description': 'test',
            'sample': 'curl baidu.com',
        }
    ]
}

const updateIndexes = function (indexes) {

    fs.access(indexes, fs.constants.F_OK, (err) => {
        var fetch = false;
        if (err) { //not exist and fetch
            let dirs = path.dirname(indexes)
            fs.mkdirSync(dirs, { 'recursive': true })
            fetch=true
            console.info('file not exist', indexes)
        }
        else { //exist
            var modifyTime = fs.statSync(indexes).mtime.getTime()
            var now = new Date().getTime()
            fetch = now - modifyTime > 1000 * 60 * 60 * 24;
            console.info('fetch', fetch,indexes)
        }

        if (fetch) {
            httpGet('https://tldr.sh/assets/index.json')

            fs.writeFileSync(indexes, body)
        }
    });
}

const hello = function () {
    console.info('hello test thnr')
    return "just a"
}

const fetch=function(cmd){

}

module.exports = {
    httpGet,
    parseContent,
    hello,
    updateIndexes
}