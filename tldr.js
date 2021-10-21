const http = require("https")
const { platform } = require("os")

function httpOptions(cmd, api, target) {
    let platform = target.os || 'common'
    let lang = (target.language === 'zh') ? '.zh' : ''
    var _options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36 Edg/94.0.992.50'
        }
    }
    switch (api) {
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


function filterTarget(cmd, config) {

    if (cmd.targets.length == 1) {
        return cmd.targets[0]
    } else {
        let _platform = cmd.platform[0]
        let _lang = 'en'
        if (cmd.language.indexOf(config.lang) > -1) {
            _lang = config.lang
        }

        if (!_lang) {
            return cmd.targets[cmd.targets.length - 1]
        } else {
            return {
                os: _platform,
                language: _lang
            }
        }
    }
}

function requestCmd(cmd, config) {

    return new Promise(function (resolve, reject) {
        var req = http.get(
            httpOptions(cmd.name, config.api, cmd.target),
            function (res) {
                // reject on bad status
                if (Math.floor(res.statusCode / 100) !== 2) {
                    console.info(res.headers)
                    let err = {
                        code: res.statusCode,
                        msg: 404 === res.statusCode ? 'NO found `' + cmd + '`' : (res.body)
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
                                msg: 'NO found `' + cmd + '`'
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
            reject(err); // This is not a "Second reject", just a different sort of failure
        });

        req.end(); // IMPORTANT
    });
}


function parseContent(body, cmd) {
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
            if(cmd.target){
                item.icon = 'assets/' + cmd.target.os + '.png'
            }
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
    console.info(config)
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
                console.info(item)
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
    getSettings
}