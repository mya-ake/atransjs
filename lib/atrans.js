/*
Copyright (c) 2015 mya-ake
Released under the MIT license
http://opensource.org/licenses/mit-license.php

Atrans.js Version 1.0.1
*/
var atrans = function() {
  return new ATrans();
  function ATrans() {
    var obj = {};
    var my = {};
    const DEF = "default";
    const E_ATRANS = "elem-atrans";
    const PREFIX = "atrans-";
    const C_NONE = "none";
    const C_DOM = "dom";
    const C_SESSION = "session";
    const C_LOCAL = "local";
    obj.content = DEF;
    obj.E_ATRANS = E_ATRANS;
    obj.PREFIX = PREFIX;
    obj.cache = {
      C_NONE: C_NONE,
      C_DOM: C_DOM,
      C_SESSION: C_SESSION,
      C_LOCAL: C_LOCAL,
    };
    
    obj.contents = {
      DEF: {
        path: "",
        url: null,
        title: "",
        description: "",
      },
    };
    obj.areas = {
      DEF: {
        id: "main",
        tag: "div",
        permanence: false,
        cache: C_DOM,
      },
    };
    
    my.datas = {
      timeout: 5000,
    };
    
    my.states = {
      useHistory: true,
      useTimeout: false,
      cache: C_DOM,   // others: C_SESSION, C_LOCAL, C_NONE
    };
    
    obj.beforeTrans = function(contentName, areaName) {
      var cache = obj.areas[areaName].cache;
      if (typeof cache !== "string") {
        cache = my.states.cache;
      }
      switch (cache) {
        case obj.cache.C_DOM:
          obj.hiddenAll(areaName);
          break;
        default:
          obj.removeAll(areaName);
          break;
      }
      return;
    };
    obj.success = function(elem, contentName, areaName) {return;};
    obj.failure = function(contentName, areaName) {return;};
    obj.complete = function(contentName, areaName) {return;};
    obj.timeout = function(contentName, areaName) {return;};
    obj.afterTrans = function(elem, contentName, areaName) {
      obj.showElem(elem);
      return;
    };
    
    obj.onpopstate = function(contentName) {
      atrans.trans(contentName, null, false, false);
      return;
    };
    
    obj.analytics = function() {return;};
    
    
    obj.setCache = function(cache) {
      my.states.cache = cache.toLowerCase();
    };
    
    obj.setHistory = function(flg) {
      my.states.useHistory = flg;
    };
    
    obj.setTimeout = function(flg, time) {
      my.states.useTimeout = flg;
      if (typeof time === "number") {
        my.datas.timeout = time;
      }
    };
    
    
    obj.init = function(contentName, areaName) {
      if (typeof contentName !== "string") {
        contentName = obj.getContentName();
      }
      if (typeof areaName !== "string") {
        areaName = DEF;
      }
      if (my.states.useHistory === true) {
        obj.initUrl(contentName);
        obj.setOnpopstate();
      }

      var cache = obj.areas[areaName].cache;
      if (typeof cache !== "string") {
        cache = my.states.cache;
      }
      switch (cache) {
        case C_NONE:
          funcNone(contentName, areaName);
          break;
        case C_SESSION:
        case C_LOCAL:
          funcStorage(contentName, areaName);
          break;
        case C_DOM:
          funcDom(contentName, areaName);
          break;
        default:
          break;
      }

      if (areaName === DEF) {
        obj.content = contentName;
      }
    };
    
    
    obj.getContentName = function() {
      var pathname = window.location.pathname;
      for (var key in obj.contents) {
        if (obj.contents[key]["path"] === pathname) {
          return key;
        } else if (obj.contents[key]["url"] === pathname) {
          return key;
        }
      }
      return DEF;
    };


    obj.trans = function(contentName, areaName, addHistoryFlg, analyticsFlg) {
      if (typeof contentName !== "string") {
        contentName = obj.getContentName();
      }
      if (typeof areaName !== "string") {
        areaName = DEF;
      }

      obj.beforeTrans(contentName, areaName);

      var cache = obj.areas[areaName].cache;
      if (typeof cache !== "string") {
        cache = my.states.cache;
      }
      switch (cache) {
        case C_NONE:
          funcNone(contentName, areaName, addHistoryFlg, analyticsFlg);
          break;
        case C_SESSION:
        case C_LOCAL:
          funcStorage(contentName, areaName, addHistoryFlg, analyticsFlg);
          break;
        case C_DOM:
          funcDom(contentName, areaName, addHistoryFlg, analyticsFlg);
          break;
        default:
          break;
      }
      
      if (areaName === DEF) {
        obj.content = contentName;
        window.scrollTo(0, 0);
      }
    };
    
    
    obj.initUrl = function(contentName) {
      var url = getContentItem(contentName, "url");
      url = url === null ? getContentItem(contentName, "path") : url;
      if (url === null) {
        return false;
      }
      window.history.replaceState({content: contentName}, "", url);
      return true;
    };


    obj.addHistory = function(contentName) {
      var url = getContentItem(contentName, "url");
      url = url === null ? getContentItem(contentName, "path") : url;
      if (url === null) {
        return false;
      }
      window.history.pushState({content: contentName}, "", url);
      return true;
    };


    obj.getContent = function(contentName, areaName, addHistoryFlg, analyticsFlg) {
      var path = getContentItem(contentName, "path");
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, true);
      
      if (my.states.useTimeout === true && xhr.timeout !== undefined) {
        xhr.ontimeout = function() {
          obj.timeout(contentName, areaName);
        };
        xhr.timeout = my.datas.timeout;
      }
      
      xhr.onreadystatechange = function () {
        switch(xhr.readyState){
          case 3:
            break;
          case 4:
            var elem = null;
            if ( (200 <= xhr.status && xhr.status < 300) || (xhr.status == 304) ) {
              elem = obj.appendHtml(obj.getBodyInnerHtml(xhr.response),
                            obj.areas[areaName],
                            contentName);
              obj.addEventLink(PREFIX + contentName);
              funcTrans(contentName, addHistoryFlg, analyticsFlg);
              obj.success(elem, contentName, areaName);
              saveStorage(elem, contentName, areaName);
            } else {
              obj.failure(contentName, areaName);
            }
            obj.complete(contentName, areaName);
            if (elem !== null) {
              obj.afterTrans(elem, contentName, areaName);
            }
            break;
        }
      };
      
      xhr.send();
    };
  
  
    obj.appendHtml = function(innerHtml, areaObj, id) {
      var elemWrapper = document.getElementById(areaObj.id);
      if (elemWrapper === null) {
        return;
      }
      var elemAppend = document.createElement(areaObj.tag);
      elemAppend.innerHTML = innerHtml;
      if (areaObj.permanence === false) {
        elemAppend.className = E_ATRANS;
      }
      if (typeof id === "string") {
        elemAppend.id = PREFIX + id;
      }
      elemWrapper.appendChild(elemAppend);
      return elemAppend;
    };
    

    obj.getBodyInnerHtml = function(html) {
      return html.replace(/[\s\S]*<body>([\s\S]*)<\/body>[\s\S]*/m, "$1");
    };


    obj.hiddenAll = function(areaName) {
      var elem = document;
      if (typeof areaName === "string") {
        elem = document.getElementById(obj.areas[areaName].id);
      }
      var elems = elem.getElementsByClassName(E_ATRANS);
      for (var i = elems.length - 1; i >= 0; i--) {
        elems[i].style.display = "none";
      }
    };


    obj.removeAll = function(areaName) {
      var elem = document;
      if (typeof areaName === "string") {
        elem = document.getElementById(obj.areas[areaName].id);
      }
      var elems = elem.getElementsByClassName(E_ATRANS);
      for (var i = elems.length - 1; i >= 0; i--) {
        if(elems[i] && elems[i].parentElement) {
          elems[i].parentElement.removeChild(elems[i]);
        }
      }
    };
    
    
    obj.showElem = function(elem, display) {
      if (typeof display !== "string") {
        display = "block";
      }
      elem.style.display = display;
    };


    obj.setTitle = function(contentName) {
      var title = getContentItem(contentName, "title");
      if (title === null || title === "") {
        return;
      }
      document.title = title;
    };


    obj.setDescription = function(contentName) {
      var description = getContentItem(contentName, "description");
      if (description === null || description === "") {
        return;
      }
      var elems = document.getElementsByName("description");
      if (elems === null) {
        return;
      }
      elems[0].setAttribute("content", description);
    };


    obj.setOnpopstate = function() {
      window.addEventListener("popstate", popState, false);

      function popState() {
        var stateHistory = window.history.state;
        if (stateHistory === null) {
          return;
        }
        obj.onpopstate(stateHistory.content);
      }
    };


    function getContentItem(contentName, itemName) {
      return obj.contents[contentName] === undefined ? null : 
        obj.contents[contentName][itemName] === undefined ? null : obj.contents[contentName][itemName];
    }
    
    function funcNone(contentName, areaName, addHistoryFlg, analyticsFlg) {
      // get
      obj.getContent(contentName, areaName, addHistoryFlg, analyticsFlg);
    }
    function funcStorage(contentName, areaName, addHistoryFlg, analyticsFlg) {
      var elem = getStorage(contentName, areaName);
      var elemWrapper = document.getElementById(obj.areas[areaName].id);
      if (typeof elem === "undefined" || elemWrapper === null) {
        // get
        obj.getContent(contentName, areaName, addHistoryFlg, analyticsFlg);
      } else {
        // cache
        elemWrapper.innerHTML = elem;
        obj.addEventLink(PREFIX + contentName);
        funcTrans(contentName, addHistoryFlg, analyticsFlg);
        obj.afterTrans(document.getElementById(PREFIX + contentName), contentName, areaName);
      }
    }
    function funcDom(contentName, areaName, addHistoryFlg, analyticsFlg) {
      var elem = document.getElementById(PREFIX + contentName);
      if (elem === null) {
        // get
        obj.getContent(contentName, areaName, addHistoryFlg, analyticsFlg);
      } else {
        // cache
        funcTrans(contentName, addHistoryFlg, analyticsFlg);
        obj.afterTrans(elem, contentName, areaName);
      }
    }
    
    function saveStorage(elem, contentName, areaName) {
      var cache = obj.areas[areaName].cache;
      if (typeof cache !== "string") {
        cache = my.states.cache;
      }
      switch (cache) {
        case C_SESSION:
          sessionStorage[PREFIX + contentName] = elem.outerHTML;
          break;
        case C_LOCAL:
          localStorage[PREFIX + contentName] = elem.outerHTML;
          break;
        default:
          break;
      }
    }
    function getStorage(contentName, areaName) {
      var cache = obj.areas[areaName].cache;
      if (typeof cache !== "string") {
        cache = my.states.cache;
      }
      switch (cache) {
        case C_SESSION:
          return sessionStorage[PREFIX + contentName];
        case C_LOCAL:
          return localStorage[PREFIX + contentName];
        default:
          return;
      }
    }
    
    obj.sessionClear = function(contentName) {
      if (typeof contentName === "string") {
        sessionStorage.removeItem(PREFIX + contentName);
      } else {
        sessionStorage.clear();
      }
    };
    obj.localClear = function(contentName) {
      if (typeof contentName === "string") {
        localStorage.removeItem(PREFIX + contentName);
      } else {
        localStorage.clear();
      }
    };
    
    function funcTrans(contentName, addHistoryFlg, analyticsFlg) {
      if (my.states.useHistory === true && addHistoryFlg === true) {
        obj.addHistory(contentName);
      }
      if (analyticsFlg === true) {
        obj.analytics();
      }
      obj.setTitle(contentName);
      obj.setDescription(contentName);
    }
    
    obj.addEventLink = function(id) {
      var elem = document;
      if (typeof id === "string") {
        elem = document.getElementById(id);
      }
      var elems = elem.getElementsByClassName("atrans-link");
      for (var i = elems.length - 1; i >= 0; i--) {
        elems[i].addEventListener("click", clickLink, false);
      }
      
      function clickLink(e) {
        var to = this.getAttribute("data-atlink");
        var areaName = this.getAttribute("data-atarea");
        if (obj.content !== to) {
          obj.trans(to, areaName, true, true);
        }
        e.preventDefault();
      }
    };
    
    
    obj.appendJs = function(src, asyncFlg) {
      var elemAppend = document.createElement("script");
      elemAppend.src = src;
      if (asyncFlg !== false) {
        elemAppend.async = 1;
      }
      document.getElementsByTagName("head")[0].appendChild(elemAppend);
    };
    obj.appendCss = function(href) {
      var elemAppend = document.createElement("link");
      elemAppend.href = href;
      elemAppend.rel = "stylesheet";
      document.getElementsByTagName("head")[0].appendChild(elemAppend);
    };
    
    obj.getBasePath = function(homeDirectory) {
      var regexp = new RegExp("(/" + homeDirectory + ")/.*");
      return window.location.pathname.replace(regexp, "$1");
    };
    
    return obj;
  }

}();