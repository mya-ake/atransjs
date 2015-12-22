/*
Copyright (c) 2015 mya-ake
Released under the MIT license
http://opensource.org/licenses/mit-license.php
*/
(function() {
window.addEventListener("load", initAtrans, false );

function initAtrans() {
  var basePath = atrans.getBasePath("Simple");
  atrans.contents = {
    default: {
      path: basePath + "/top/top.html",         // コンテンツが置かれいる相対パス
      url: basePath + "/index.html",                 // このコンテンツを表示するときのURL（省略した場合は、path が代わりに適用されます）
      title: "Top Page",                  // このコンテンツを表示するときのtitle（省略した場合は、変更なし）
      description: "トップページです。",  // このコンテンツを表示するときのdescription（省略した場合は、変更なし）
    },
    page1: {
      path: basePath + "/page1/page1.html",
      url: basePath + "/page1/index.html",
      title: "Page1",
      description: "ページ1です。",
    },
    page2: {
      path: basePath + "/page2/page2.html",
      url: basePath + "/page2/index.html",
      title: "Page2",
      description: "ページ2です。",
    },
  };
  
  atrans.areas = {
    default: {
      id: "main",                   // コンテンツの挿入先要素のid
      tag: "section",               // コンテンツを挿入するときのタグ
      permanence: false,            // この area 内のコンテンツを永続化するか
      cache: atrans.cache.C_DOM,    // この area 内のコンテンツのキャッシュの仕方（省略した場合は、atrans.setCache()関数の設定が適用されます）
    },
  };

  atrans.addEventLink("header");
  atrans.init();    // 初期ページの取得
}
  
})();