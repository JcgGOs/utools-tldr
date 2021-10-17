const path = require('path')
const fs = require('fs')
const { shell } = require('electron')
const tlnr = require('./tlnr.js')

window.exports = {
   "tlnr": {
      mode: "list",
      args: {
         // 进入插件时调用（可选）
         enter: (action, callbackSetList) => {
            const indexes = path.join(window.utools.getPath('appData'), 'tlnr', 'indexes.json')
            tlnr.updateIndexes(indexes)

            // const file = path.join(window.utools.getPath('appData'), 'tlnr','indexes.json')
            // fs.access(file, fs.constants.F_OK, (err) => {
            //    if(err){
            //       let config={
            //          'config': 1
            //       }
            //       fs.ensureFile(file )
            //       fs.writeFileSync(file, JSON.stringify(config))
            //    }
            //    console.log(`${file} ${err ? '不存在' : '存在'}`);
            //  });
            //  let config = path.join(window.utools.getPath('appData'), 'indexes.json')
            //  console.info('>>',config)
            //  var stat = fs.statSync(config);
            //  let updateTime=stat.mtime.getTime()
            //  console.info(updateTime)
            //  console.info(new Date().getTime())
            //  console.info(config)
            //  fs.writeFileSync(config, JSON.stringify(config))

            //  let chromeDataDir = path.join(window.utools.getPath('appData'), 'Google/Chrome')
            //  console.info(chromeDataDir)
            // 如果进入插件就要显示列表数据
            //  callbackSetList([
            //        {
            //           title: '这是标题',
            //           description: '这是描述',
            //           icon:'' // 图标(可选)
            //        }
            //  ])
         },
         // 子输入框内容变化时被调用 可选 (未设置则无搜索)
         search: (action, searchWord, callbackSetList) => {
            var indexContent = fs.readFileSync(indexes)
            var indexer = JSON.parse(indexContent)
            var command = false;

            for (let i = 0; i < indexer.commands.length; i++) {
               const cmd = indexer.commands[i]
               if (cmd.name === searchWord) {
                  command = cmd
                  break
               }
            }

            if(command){

            }

            indexer.commands.forEach(cmd => {
               if(cmd.name===searchWord){
                  cmd=
               }
            });
            index.commands
            // 获取一些数据
            // 执行 callbackSetList 显示出来
            callbackSetList([
               {
                  title: '这是标题',
                  description: '这是描述',
                  icon: '', // 图标
                  url: 'https://yuanliao.info'
               },
               {
                  title: '这是标题2',
                  description: '这是描述',
                  icon: '', // 图标
                  url: 'https://yuanliao.info'
               },
            ])
         },
         // 用户选择列表中某个条目时被调用
         select: (action, itemData, callbackSetList) => {
            console.info(action)
            console.info(itemData)
            window.utools.hideMainWindow()
            const url = itemData.url
            require('electron').shell.openExternal(url)
            console.info()
            window.utools.outPlugin()
         },
         // 子输入框为空时的占位符，默认为字符串"搜索"
         placeholder: "搜索"
      }
   }
}