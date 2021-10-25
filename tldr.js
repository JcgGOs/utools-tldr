const http = require("https")
const path = require('path')
const fs = require('fs')
const indexes = path.join(__dirname, 'indexes.json')

const _messages = function (key, lang, cmd) {
    lang = lang || 'zh'
    cmd = cmd || ''
    var _msgMap = {
        '404.zh': '命令没有找到 ' + cmd,
        '404.en': 'Command Not Found ' + cmd,
        '500.zh': '请求出错' + cmd,
        '500.en': 'Request Error' + cmd,
        '600.zh': '请选择一个平台',
        '600.en': 'Please Choose OS platfrom',
    }
    return _msgMap[key + '.' + lang]
}

var _indexer

function httpOptions(cmd, target) {
    let platform = target.os || 'common'
    let lang = (target.language === 'zh') ? '.zh' : ''
    var _options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36 Edg/94.0.992.50'
        }
    }
    switch (target.api) {
        case 'gitee': {
            _options['host'] = 'gitee.com'
            _options['path'] = '/api/v5/repos/miao123456miao/tldr/contents/pages_lang_/_platform_/_cmd_.md?ref=master'
            break
        }
        default: {
            _options['host'] = 'api.github.com'
            _options['path'] = '/repos/tldr-pages/tldr/contents/pages_lang_/_platform_/_cmd_.md?ref=master'

        }
    }

    _options['path'] = _options['path'].replace('_lang_', lang).replace('_platform_', platform).replace('_cmd_', cmd)
    console.info('https://' + _options['host'] + _options['path'])
    return _options;
}

function icon(name){
    return 'assets/' + name + '.png'
}

function search(searchWord, config, callbackSetList) {

    //filter
    if (searchWord.length < 2) {
        return
    }

    //nomalize
    let cmd = searchWord.replace(' ', '-')

    //find the cmd
    if(!_indexer){
        _indexer = JSON.parse(fs.readFileSync(indexes))
    }
    var command;
    for (let i = 0; i < _indexer.commands.length; i++) {
        const _cmd = _indexer.commands[i]
        if (_cmd.name === cmd) {
            command = _cmd
            break
        }
    }

    

    if (!command) {
        callbackSetList([{
            title: _messages(404, config.lang, searchWord),
            description: config.lang + ',' + config.os,
            icon: icon(config.api), // 图标
        }])
        return
    }

    let platforms = command.platform
    if (!config.os && platforms.length > 1) {
        let items = []
        for (var i = 0; i < platforms.length; i++) {
            items.push(
                {
                    title: _messages(600, config.lang),
                    description: 'platform',
                    icon: icon(platforms[i]), // 图标
                    url: {
                        os: platforms[i],
                        searchWord: searchWord
                    }
                }
            )
        }
        callbackSetList(items)
        return
    }

    //filter target
    let target = filterTarget(command, config)
    requestCmd(command, target)
        .then(function (body) {
            var object = JSON.parse(body)
            var body_content = Buffer.from(object.content, object.encoding).toString('UTF-8')
            callbackSetList(parseContent(body_content, command, target.os))
        })
        .catch(function (err) {
            callbackSetList([
                {
                    title: err.msg,
                    description: err.code,
                    icon: icon(config.api), // 图标
                    url: ''
                }
            ])
        })
}

function filterTarget(cmd, config) {

    var target
    if (cmd.targets.length == 1) {
        target = cmd.targets[0]
    } else {
        let _os = config.os || cmd.platform[0]
        let _lang = (cmd.language.indexOf(config.lang) > -1) ? config.lang : 'en'

        for (var i = 0; i < cmd.targets.length; i++) {
            let _target = cmd.targets[i]
            if (_os === _target.os && _lang === _target.language) {
                target = _target
                break
            }
        }

        if (!target) {
            target = cmd.targets[cmd.targets.length - 1]
        }
    }


    target.api = config.api
    return target
}

function requestCmd(cmd, config) {

    return new Promise(function (resolve, reject) {
        var req = http.get(
            httpOptions(cmd.name, config),
            function (res) {
                // reject on bad status
                if (Math.floor(res.statusCode / 100) !== 2) {
                    let err = {
                        code: res.statusCode,
                        msg: _messages(res.statusCode, config.lang, cmd.name)
                    }
                    return reject(err);
                }
                // cumulate data
                var body = [];
                res.on('data', function (chunk) {
                    body.push(chunk);
                });
                // resolve on end
                res.on('end', function () {
                    try {
                        let content = Buffer.concat(body).toString()
                        if (content === '[]') {
                            let err = {
                                code: res.statusCode,
                                msg: _messages(404, config.lang, cmd.name)
                            }
                            return reject(err);
                        }
                        resolve(content);
                    } catch (e) {
                        reject(e);
                    }

                });
            });

        req.on('error', function (err) {// reject on request error
            reject(_messages(500, config.lang, err)); // This is not a "Second reject", just a different sort of failure
        });

        req.end(); // IMPORTANT
    });
}


function parseContent(body, cmd, os) {
    var lines = body.split('\n')

    var items = []
    var item = {
        title: '',
        description: '',
        icon: '', // 图标
        url: ''
    };
    lines.forEach(line => {

        if (line.startsWith('-')) {
            item.description = line.replaceAll('-', '').replaceAll(':', '').replaceAll('：','')
        }
        else if (line.startsWith('`')) {
            item.title = line.replaceAll('`', '')
        }
        else if (line == '' && !!item.title && !!item.description) {
            item.icon = !!os ? icon(os) : icon(cmd.platform[0])
            items.push(item)
            item = {
                title: '',
                description: '',
                icon: '', // 图标
                url: ''
            }
        }
    });
    console.debug(items)
    return items
}

function getSettings(config) {
    let _settings = [
        {
            title: 'Github',
            description: 'api',
            icon: 'assets/github.png', // 图标
            url: 'github'
        },
        {
            title: 'Gitee',
            description: 'api',
            icon: 'assets/gitee.png', // 图标
            url: 'gitee'
        },
        {
            title: '中文',
            description: 'lang',
            icon: 'assets/zh.png', // 图标
            url: 'zh'
        },
        {
            title: 'English',
            description: 'lang',
            icon: 'assets/en.png', // 图标
            url: 'en'
        }
    ]

    var checkSetting = function (v) {
        for (var i = 0; i < _settings.length; i++) {
            let item = _settings[i]

            if (item.url === v) {
                item.title = item.title + '   *'
                break
            }
        }
    }


    checkSetting(config.lang || 'zh')
    checkSetting(config.api || 'github')
    return _settings
}

module.exports = {
    parseContent,
    requestCmd,
    filterTarget,
    search,
    getSettings
}