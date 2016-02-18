/*
Copyright (c) 2015 mya-ake
Released under the MIT license
http://opensource.org/licenses/mit-license.php

Atrans.js Version 1.0.3
*/
var atrans = function() {
  return new ATrans();
  function ATrans() {
    var pb = {};    // public functions and variables
    var pr = {};    // private functions and variables
    const DEF = "default";
    const E_ATRANS = "elem-atrans";
    const PREFIX = "atrans-";
    const C_NONE = "none";
    const C_DOM = "dom";
    const C_SESSION = "session";
    const C_LOCAL = "local";
    pb.content = DEF;
    pb.E_ATRANS = E_ATRANS;
    pb.PREFIX = PREFIX;
    pb.cache = {
      C_NONE: C_NONE,
      C_DOM: C_DOM,
      C_SESSION: C_SESSION,
      C_LOCAL: C_LOCAL,
    };
    
    pb.contents = {
      DEF: {
        path: "",
        url: null,
        title: "",
        description: "",
      },
    };
    pb.areas = {
      DEF: {
        id: "main",
        tag: "div",
        permanence: false,
        cache: C_DOM,
      },
    };
    
    pr.datas = {
      timeout: 5000,
    };
    
    pr.states = {
      useHistory: true,
      useTimeout: false,
      cache: C_DOM,   // others: C_SESSION, C_LOCAL, C_NONE
    };
    
    pb.beforeTrans = function(contentName, areaName) {
      var cache = pb.areas[areaName].cache;
      if (typeof cache !== "string") {
        cache = pr.states.cache;
      }
      switch (cache) {
        case pb.cache.C_DOM:
          pb.hiddenAll(areaName);
          break;
        default:
          pb.removeAll(areaName);
          break;
      }
      return;
    };
    pb.success = function(elem, contentName, areaName) {return;};
    pb.failure = function(contentName, areaName) {return;};
    pb.complete = function(contentName, areaName) {return;};
    pb.timeout = function(contentName, areaName) {return;};
    pb.afterTrans = function(elem, contentName, areaName) {
      pb.showElem(elem);
      return;
    };
    
    pb.onpopstate = function(contentName) {
      atrans.trans(contentName, null, false, false);
      return;
    };
    
    pb.analytics = function() {return;};
    
    
    pb.setCache = function(cache) {
      pr.states.cache = cache.toLowerCase();
    };
    
    pb.setHistory = function(flg) {
      pr.states.useHistory = flg;
    };
    
    pb.setTimeout = function(flg, time) {
      pr.states.useTimeout = flg;
      if (typeof time === "number") {
        pr.datas.timeout = time;
      }
    };
    
    
    pb.init = function(contentName, areaName) {
      if (typeof contentName !== "string") {
        contentName = pb.getContentName();
      }
      if (typeof areaName !== "string") {
        areaName = DEF;
      }
      if (pr.states.useHistory === true) {
        pb.initUrl(contentName);
        pb.setOnpopstate();
      }

      var cache = pb.areas[areaName].cache;
      if (typeof cache !== "string") {
        cache = pr.states.cache;
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
        pb.content = contentName;
      }
    };
    
    
    pb.getContentName = function() {
      var pathname = window.location.pathname;
      for (var key in pb.contents) {
        if (pb.contents[key]["path"] === pathname) {
          return key;
        } else if (pb.contents[key]["url"] === pathname) {
          return key;
        }
      }
      return DEF;
    };


    pb.trans = function(contentName, areaName, addHistoryFlg, analyticsFlg) {
      if (typeof contentName !== "string") {
        contentName = pb.getContentName();
      }
      if (typeof areaName !== "string") {
        areaName = DEF;
      }

      pb.beforeTrans(contentName, areaName);

      var cache = pb.areas[areaName].cache;
      if (typeof cache !== "string") {
        cache = pr.states.cache;
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
        pb.content = contentName;
        window.scrollTo(0, 0);
      }
    };
    
    
    pb.initUrl = function(contentName) {
      var url = getContentItem(contentName, "url");
      url = url === null ? getContentItem(contentName, "path") : url;
      if (url === null) {
        return false;
      }
      window.history.replaceState({content: contentName}, "", url);
      return true;
    };


    pb.addHistory = function(contentName) {
      var url = getContentItem(contentName, "url");
      url = url === null ? getContentItem(contentName, "path") : url;
      if (url === null) {
        return false;
      }
      window.history.pushState({content: contentName}, "", url);
      return true;
    };


    pb.getContent = function(contentName, areaName, addHistoryFlg, analyticsFlg) {
      var path = getContentItem(contentName, "path");
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, true);
      
      if (pr.states.useTimeout === true && xhr.timeout !== undefined) {
        xhr.ontimeout = function() {
          pb.timeout(contentName, areaName);
        };
        xhr.timeout = pr.datas.timeout;
      }
      
      xhr.onreadystatechange = function () {
        switch(xhr.readyState){
          case 3:
            break;
          case 4:
            var elem = null;
            if ( (200 <= xhr.status && xhr.status < 300) || (xhr.status == 304) ) {
              elem = pb.appendHtml(pb.getBodyInnerHtml(xhr.response),
                            pb.areas[areaName],
                            contentName);
              pb.addEventLink(PREFIX + contentName);
              funcTrans(contentName, addHistoryFlg, analyticsFlg);
              pb.success(elem, contentName, areaName);
              saveStorage(elem, contentName, areaName);
            } else {
              pb.failure(contentName, areaName);
            }
            pb.complete(contentName, areaName);
            if (elem !== null) {
              pb.afterTrans(elem, contentName, areaName);
            }
            break;
        }
      };
      
      xhr.send();
    };
  
  
    pb.appendHtml = function(innerHtml, areaObj, id) {
      var elemWrapper = document.getElementById(areaObj.id);
      if (elemWrapper === null) {
        return;
      }
      var elemAppend = document.createElement(areaObj.tag);
      elemAppend.insertAdjacentHTML("beforeend", innerHtml);
      if (areaObj.permanence === false) {
        elemAppend.className = E_ATRANS;
      }
      if (typeof id === "string") {
        elemAppend.id = PREFIX + id;
      }
      elemWrapper.appendChild(elemAppend);
      return elemAppend;
    };
    

    pb.getBodyInnerHtml = function(html) {
      return html.replace(/[\s\S]*<body>([\s\S]*)<\/body>[\s\S]*/m, "$1");
    };


    pb.hiddenAll = function(areaName) {
      var elem = document;
      if (typeof areaName === "string") {
        elem = document.getElementById(pb.areas[areaName].id);
      }
      var elems = elem.getElementsByClassName(E_ATRANS);
      for (var i = elems.length - 1; i >= 0; i--) {
        elems[i].style.display = "none";
      }
    };


    pb.removeAll = function(areaName) {
      var elem = document;
      if (typeof areaName === "string") {
        elem = document.getElementById(pb.areas[areaName].id);
      }
      var elems = elem.getElementsByClassName(E_ATRANS);
      for (var i = elems.length - 1; i >= 0; i--) {
        if(elems[i] && elems[i].parentElement) {
          elems[i].parentElement.removeChild(elems[i]);
        }
      }
    };
    
    
    pb.showElem = function(elem, display) {
      if (typeof display !== "string") {
        display = "block";
      }
      elem.style.display = display;
    };


    pb.setTitle = function(contentName) {
      var title = getContentItem(contentName, "title");
      if (title === null || title === "") {
        return;
      }
      document.title = title;
    };


    pb.setDescription = function(contentName) {
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


    pb.setOnpopstate = function() {
      window.addEventListener("popstate", popState, false);

      function popState() {
        var stateHistory = window.history.state;
        if (stateHistory === null) {
          return;
        }
        pb.onpopstate(stateHistory.content);
      }
    };


    function getContentItem(contentName, itemName) {
      return pb.contents[contentName] === undefined ? null : 
        pb.contents[contentName][itemName] === undefined ? null : pb.contents[contentName][itemName];
    }
    
    function funcNone(contentName, areaName, addHistoryFlg, analyticsFlg) {
      // get
      pb.getContent(contentName, areaName, addHistoryFlg, analyticsFlg);
    }
    function funcStorage(contentName, areaName, addHistoryFlg, analyticsFlg) {
      var elem = getStorage(contentName, areaName);
      var elemWrapper = document.getElementById(pb.areas[areaName].id);
      if (typeof elem === "undefined" || elemWrapper === null) {
        // get
        pb.getContent(contentName, areaName, addHistoryFlg, analyticsFlg);
      } else {
        // cache
        elemWrapper.innerHTML = elem;
        pb.addEventLink(PREFIX + contentName);
        funcTrans(contentName, addHistoryFlg, analyticsFlg);
        pb.afterTrans(document.getElementById(PREFIX + contentName), contentName, areaName);
      }
    }
    function funcDom(contentName, areaName, addHistoryFlg, analyticsFlg) {
      var elem = document.getElementById(PREFIX + contentName);
      if (elem === null) {
        // get
        pb.getContent(contentName, areaName, addHistoryFlg, analyticsFlg);
      } else {
        // cache
        funcTrans(contentName, addHistoryFlg, analyticsFlg);
        pb.afterTrans(elem, contentName, areaName);
      }
    }
    
    function saveStorage(elem, contentName, areaName) {
      var cache = pb.areas[areaName].cache;
      if (typeof cache !== "string") {
        cache = pr.states.cache;
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
      var cache = pb.areas[areaName].cache;
      if (typeof cache !== "string") {
        cache = pr.states.cache;
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
    
    pb.sessionClear = function(contentName) {
      if (typeof contentName === "string") {
        sessionStorage.removeItem(PREFIX + contentName);
      } else {
        sessionStorage.clear();
      }
    };
    pb.localClear = function(contentName) {
      if (typeof contentName === "string") {
        localStorage.removeItem(PREFIX + contentName);
      } else {
        localStorage.clear();
      }
    };
    
    function funcTrans(contentName, addHistoryFlg, analyticsFlg) {
      if (pr.states.useHistory === true && addHistoryFlg === true) {
        pb.addHistory(contentName);
      }
      if (analyticsFlg === true) {
        pb.analytics();
      }
      pb.setTitle(contentName);
      pb.setDescription(contentName);
    }
    
    pb.addEventLink = function(id) {
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
        if (pb.content !== to) {
          pb.trans(to, areaName, true, true);
        }
        e.preventDefault();
      }
    };
    
    
    pb.appendJs = function(src, asyncFlg) {
      var elemAppend = document.createElement("script");
      elemAppend.src = src;
      if (asyncFlg !== false) {
        elemAppend.async = 1;
      }
      document.getElementsByTagName("head")[0].appendChild(elemAppend);
    };
    pb.appendCss = function(href) {
      var elemAppend = document.createElement("link");
      elemAppend.href = href;
      elemAppend.rel = "stylesheet";
      document.getElementsByTagName("head")[0].appendChild(elemAppend);
    };
    
    pb.getBasePath = function(homeDirectory) {
      var regexp = new RegExp("(/" + homeDirectory + ")/.*");
      return window.location.pathname.replace(regexp, "$1");
    };
    
    return pb;
  }

}();