const tldr = require('./tldr.js')

const _config = {
   lang: 'zh',
   api: 'gitee'
}
// 延时ID。
let delayId = null;

window.exports = {
   "tldr": {
      mode: "list",
      args: {
         // 进入插件时调用（可选）
         enter: (action, callbackSetList) => {
            setTimeout(() => {
               if(action.type==='over'){
                  utools.setSubInputValue(action.payload);
               }
            }, 5); 
         },
         // 子输入框内容变化时被调用 可选 (未设置则无搜索)
         search: (action, searchWord, callbackSetList) => {
            console.info('search', searchWord)
            if (searchWord.length < 2) {
               return
            }
            delayId && clearTimeout(delayId);
            delayId = setTimeout(() => {
               if ('setting' === searchWord) {
                  callbackSetList(tldr.getSettings(_config))
                  return;
               }

               let searchTerm={
                  lang:_config.lang,
                  api:_config.api
               }
               tldr.search(searchWord, searchTerm, callbackSetList)
            }, 500);

         },
         // 用户选择列表中某个条目时被调用
         select: (action, itemData, callbackSetList) => {
            if (['api', 'lang'].indexOf(itemData.description) > -1) {
               _config[itemData.description] = itemData.url
               callbackSetList(tldr.getSettings(_config))
            } 
            else if ('platform' == itemData.description) {
               let searchTerm={
                  lang:_config.lang,
                  api:_config.api,
                  os:itemData.url.os
               }
               tldr.search(itemData.url.searchWord, searchTerm, callbackSetList)
            }
            else {
               window.utools.copyText(itemData.title)
            }
         },
         // 子输入框为空时的占位符，默认为字符串"搜索"
         placeholder: "试一下 tldr | try a tldr"
      }
   }
}