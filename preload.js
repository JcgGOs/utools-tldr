const path = require('path')
const fs = require('fs')
const tldr = require('./tldr.js')

const indexes = path.join(__dirname, 'indexes.json')
const _config = {
   lang: 'zh',
   platform: 'common',
   api: 'gitee'
}
// 延时ID。
let delayId = null;
var indexContent = fs.readFileSync(indexes)

window.exports = {
   "tldr": {
      mode: "list",
      args: {
         // 进入插件时调用（可选）
         enter: (action, callbackSetList) => {

         },
         // 子输入框内容变化时被调用 可选 (未设置则无搜索)
         search: (action, searchWord, callbackSetList) => {
            if (searchWord.length < 2) {
               return
            }
            delayId && clearTimeout(delayId);
            delayId = setTimeout(() => {
               if ('setting' === searchWord) {
                  callbackSetList(tldr.getSettings(_config))
                  return;
               }

               if (searchWord.length < 2) {
                  return
               }

               searchWord = searchWord.replace(' ', '-')

               var indexer = JSON.parse(indexContent)
               var command = false;

               for (let i = 0; i < indexer.commands.length; i++) {
                  const cmd = indexer.commands[i]
                  if (cmd.name === searchWord) {
                     command = cmd
                     break
                  }
               }

               if (!command) {
                  return;
               }

               tldr.requestCmd(command, _config)
                  .then(function (body) {
                     var object = JSON.parse(body)
                     var body_content = Buffer.from(object.content, object.encoding).toString('UTF-8')
                     var items = tldr.parseContent(body_content)
                     callbackSetList(items)
                  })
                  .catch(function (err) {
                     console.info(err)
                     callbackSetList([
                        {
                           title: err.msg + ' : ' + _config.api + ',' + _config.lang + ',' + _config.platform,
                           description: err.code,
                           icon: 'assets/' + _config.api + '.png', // 图标
                           url: ''
                        }
                     ])
                  })

            }, 500);

         },
         // 用户选择列表中某个条目时被调用
         select: (action, itemData, callbackSetList) => {
            if (['api', 'lang'].indexOf(itemData.description) > -1) {
               _config[itemData.description] = itemData.url
               callbackSetList(tldr.getSettings(_config))
            } else {
               window.utools.copyText(itemData.title)
            }
         },
         // 子输入框为空时的占位符，默认为字符串"搜索"
         placeholder: "试一下 tldr | try a tldr"
      }
   }
}