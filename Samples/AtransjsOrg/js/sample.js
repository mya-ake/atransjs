/*
Copyright (c) 2015 mya-ake
Released under the MIT license
http://opensource.org/licenses/mit-license.php
*/
(function() {

window.addEventListener("load", initAtrans, false );
window.addEventListener("load", addEventScrollTo, false );

function initAtrans() {
  const DEF = "default";
  const TOP = "top";
  const DOCUMENT = "document";
  const FLOW = "flow";
  const DOWNLOAD = "download";
  const HEADER = "header";
  const FOOTER = "footer";
  
  /** contents object **/
  var basePath = "";
  var indexHtml = "";
  if (window.location.origin !== "https://atransjs.org") {
    basePath = atrans.getBasePath("AtransjsOrg");
    indexHtml = "index.html";
  }
  atrans.contents[DEF] = {
    path: basePath + "/contents/top.html",
    url: basePath + "/" + indexHtml,
    title: "Top | Atrans.js | Library to create a Single Page Application!",
  };
  atrans.contents[DOCUMENT] = {
    path: basePath + "/contents/document.html",
    url: basePath + "/document/" + indexHtml,
    title: "Document | Atrans.js | Library to create a Single Page Application!",
  };
  atrans.contents[FLOW] = {
    path: basePath + "/contents/flow.html",
    url: basePath + "/flow/" + indexHtml,
    title: "Flow | Atrans.js | Library to create a Single Page Application!",
  };
  atrans.contents[DOWNLOAD] = {
    path: basePath + "/contents/download.html",
    url: basePath + "/download/" + indexHtml,
    title: "Download | Atrans.js | Library to create a Single Page Application!",
  };
  atrans.contents[HEADER] = {
    path: basePath + "/elements/header.html",
  };
  atrans.contents[FOOTER] = {
    path: basePath + "/elements/footer.html",
  };
  
  /** append areas **/
  atrans.areas[DEF] = {
    id: "main",
    tag: "section",
    permanence: false,
    cache: atrans.cache.DOM,
  };
  atrans.areas[HEADER] = {
    id: "header",
    tag: "div",
    permanence: true,
    cache: atrans.cache.C_SESSION,
  };
  atrans.areas[FOOTER] = {
    id: "footer",
    tag: "div",
    permanence: true,
    cache: atrans.cache.C_SESSION,
  };
  
  atrans.beforeTrans = function(contentName, areaName) {
    switch (areaName) {
      case DEF:
        document.getElementById("main").setAttribute("data-show", "false");
        break;
      default:
        break;
    }
  };
  atrans.success = function(elem, contentName, areaName) {
    addEventPageLink(elem);
    switch (contentName) {
      case DOCUMENT:
        atrans.appendJs("../js/highlight.pack.js");
        atrans.appendCss("../css/agate.css");
        var tid = setInterval(function() {
          if (typeof hljs !== "undefined") {
            clearInterval(tid);
            highlightCode(elem);
          }
        }, 100);
        break;
      case FLOW:
        addEventBtnSwitchGroup(elem);
        addEventBtnSwitch(elem);
        packAddEventBtnSwitch(elem);
        addEventBtnSwitchFunctionForName(elem);
        break;
      case DOWNLOAD:
        addEventDLBtn();
        break;
      default:
        break;
    }
  };
  atrans.failure = function(contentName, areaName) {
    showPage(document.getElementById("page-error"), areaName);
  };
  atrans.analytics = function(contentName) {
    if (typeof ga === "function") {
      ga('send', 'pageview', {
        "page": window.location.pathname,
        "title": document.title,
      });
    }
  };
  atrans.afterTrans = function(elem, contentName, areaName) {
    switch (contentName) {
      case HEADER:
        addEventNavLink();
        addEventMenuXs();
        break;
      default:
        break;
    }
    switch (areaName) {
      case DEF:
        setActiveNavLink();
        showPage(elem, areaName);
        break;
      default:
        break;
    }
    setFooterPosition();
  };
  atrans.onpopstate = function(contentName) {
    atrans.trans(contentName, null, false, false);
    setActiveNavLink();
  };
  atrans.timeout = function(contentName, areaName) {
    showPage(document.getElementById("page-timeout"), areaName);
  };
  
  atrans.setCache(atrans.cache.C_DOM);
  atrans.setTimeout(true, 30000);
  atrans.trans(HEADER, HEADER);
  atrans.init();
  atrans.trans(FOOTER, FOOTER);
}

function showPage(elem, areaName) {
  setTimeout(function() {
    atrans.hiddenAll(areaName);
    atrans.showElem(elem);
    setTimeout(function() {
      document.getElementById("main").setAttribute("data-show", "true");
    }, 100);
  }, 200);
}

function addEventNavLink() {
  var elems = document.getElementsByClassName("nav-link");
  for (var i = elems.length - 1; i >= 0; i--) {
    elems[i].addEventListener("click", setActiveNavLink, false);
  }
  document.getElementById("logo").addEventListener("click", setActiveNavLink, false);
}
function addEventPageLink(elem) {
  var elems = elem.getElementsByClassName("page-link");
  for (var i = elems.length - 1; i >= 0; i--) {
    elems[i].addEventListener("click", setActiveNavLink, false);
  }
}

function setActiveNavLink() {
  var elems = document.getElementsByClassName("nav-link");
  for (var i = elems.length - 1; i >= 0; i--) {
    if (elems[i].getAttribute("data-atlink") === atrans.content) {
      elems[i].setAttribute("data-active", "true");
    } else {
      elems[i].setAttribute("data-active", "false");
    }
  }
  
}

function highlightCode(elem) {
  var elems = elem.getElementsByTagName("code");
  var elemCodeName;
  for (var i = elems.length - 1; i >= 0; i--) {
    hljs.highlightBlock(elems[i]);
    elems[i].style.position = "relative";
    elemCodeName = document.createElement("span");
    elemCodeName.className = "code-name";
    elemCodeName.textContent = elems[i].className.replace(/\s*hljs\s*/, "");
    elems[i].appendChild(elemCodeName);
  }
}

function addEventBtnSwitch(elem) {
  var elems = elem.getElementsByClassName("btn-switch");
  for (var i = elems.length - 1; i >= 0; i--) {
    elems[i].addEventListener("click", clickBtn, false);
  }
  
  function clickBtn() {
    if (this.getAttribute("data-on") === "true") {
      this.setAttribute("data-on", "false");
    } else {
      this.setAttribute("data-on", "true");
    }
  }
}

function addEventBtnSwitchGroup(elem) {
  var elemsBtnGroup = elem.getElementsByClassName("btn-switch-group");
  var elemsBtn;
  for (var i = elemsBtnGroup.length - 1; i >= 0; i--) {
    if (elemsBtnGroup[i].getAttribute("data-type") === "radio") {
      elemsBtn = elemsBtnGroup[i].children;
      for (var j = elemsBtn.length - 1; j >= 0; j--) {
        elemsBtn[j].addEventListener("click", clickBtn, false);
      }
    }
  }
  
  function clickBtn() {
    var elemsBtnE = this.parentElement.children;
    for (var i = elemsBtnE.length - 1; i >= 0; i--) {
      elemsBtnE[i].setAttribute("data-on", "false");
    }
  }
}

function packAddEventBtnSwitch(elem) {
  var states = {
    history: true,
    analytics: true,
  };
  addEventBtnSwitchFunction();
  addEventBtnSwitchCache();
  addEventBtnSwitchFlgs(elem);
  document.getElementById("btn-flow-trans").click();
  document.getElementById("btn-flow-dom").click();

  function addEventBtnSwitchFunction() {
    document.getElementById("btn-flow-trans").addEventListener("click", clickBtnTrans, false);
    document.getElementById("btn-flow-init").addEventListener("click", clickBtnInit, false);
    var elemB = document.getElementById("obj-before");
    var elemsBF = document.getElementById("area-flow-flg").children;
    var tmpStates;
    var initFlg = true;
    
    function clickBtnTrans() {
      if (initFlg === false) {
        return;
      }
      initFlg = false;
      elemB.setAttribute("data-state", "");
      setDisageble(false);
      if (typeof tmpStates === "object") {
        states = {history: ! tmpStates.history, analytics: ! tmpStates.analytics};
        setInitState();
      }
    }
    function clickBtnInit() {
      if (initFlg === true) {
        return;
      }
      initFlg = true;
      elemB.setAttribute("data-state", "none");
      tmpStates = {history: states.history, analytics: states.analytics};
      states.history = true;
      states.analytics = true;
      setInitState();
      setDisageble(true);
    }
    function setDisageble(flg) {
      for (var i = elemsBF.length - 1; i >= 0; i--) {
        elemsBF[i].disabled = flg;
      }
    }
    function setInitState() {
      for (var i = elemsBF.length - 1; i >= 0; i--) {
        elemsBF[i].click();
        elemsBF[i].setAttribute("data-on", states[elemsBF[i].id.replace("btn-flow-", "")]);
      }
    }
  }
  
  function addEventBtnSwitchCache() {
    document.getElementById("btn-flow-dom").addEventListener("click", clickBtnDom, false);
    document.getElementById("btn-flow-session").addEventListener("click", clickBtnStorage, false);
    document.getElementById("btn-flow-local").addEventListener("click", clickBtnStorage, false);
    document.getElementById("btn-flow-none").addEventListener("click", clickBtnNone, false);
    var elemsC = document.getElementById("flow-cache").getElementsByTagName("rect");
    var elemCAE = document.getElementById("obj-cache-addEvent");
    
    function clickBtnDom() {
      setState("");
      elemCAE.setAttribute("data-state", "none");
    }
    function clickBtnStorage() {
      setState("");
    }
    function clickBtnNone() {
      setState("none");
    }
    function setState(state) {
      for (var i = elemsC.length - 1; i >= 0; i--) {
        elemsC[i].setAttribute("data-state", state);
      }
    }
  }
  
  function addEventBtnSwitchFlgs(elem) {
    document.getElementById("btn-flow-history").addEventListener("click", clickBtnHistory, false);
    document.getElementById("btn-flow-analytics").addEventListener("click", clickBtnAnalytics, false);
    var elemsH = elem.getElementsByClassName("obj-history");
    var elemsA = elem.getElementsByClassName("obj-analytics");
    
    function clickBtnHistory() {
      states.history = ! states.history;
      var state = states.history ? "" : "none";
      for (var i = elemsH.length - 1; i >= 0; i--) {
        elemsH[i].setAttribute("data-state-flg", state);
      }
    }
    function clickBtnAnalytics() {
      states.analytics = ! states.analytics;
      var state = states.analytics ? "" : "none";
      for (var i = elemsA.length - 1; i >= 0; i--) {
        elemsA[i].setAttribute("data-state-flg", state);
      }
    }
  }
  
}

function addEventBtnSwitchFunctionForName(elem) {
  document.getElementById("btn-flow-trans").addEventListener("click", clickBtnTrans, false);
  document.getElementById("btn-flow-init").addEventListener("click", clickBtnInit, false);
  var elemsA = elem.getElementsByClassName("arg-trans");
  var elemN = document.getElementById("function-name");
  
  function clickBtnTrans() {
    setFunctionName(this.textContent);
    setOpacity(1);
  }
  function clickBtnInit() {
    setFunctionName(this.textContent);
    setOpacity(0);
  }
  function setFunctionName(name) {
    elemN.textContent = "atrans." + name;
  }
  function setOpacity(opacity) {
    for (var i = elemsA.length - 1; i >= 0; i--) {
      elemsA[i].style.opacity = opacity;
    }
  }
}

function addEventScrollTo() {
  var elem = document.getElementById("scroll-top");
  elem.addEventListener("click", clickTo, false);
  window.addEventListener("scroll", scrollShow, false);
  
  function clickTo() {
    scrollTo(0, 400);
  }
  function scrollShow() {
    if (this.scrollY > 200) {
      elem.setAttribute("data-show", "true");
    } else {
      elem.setAttribute("data-show", "false");
    }
  }
}

function addEventMenuXs() {
  document.getElementById("menu-xs").addEventListener("click", clickMenuXs, false);
  var showFlg = false;
  var elemN = document.getElementById("nav-xs");
  
  
  function clickMenuXs() {
    showFlg = ! showFlg;
    elemN.setAttribute("data-show", showFlg);

    if (showFlg === true) {
      setTimeout(function(){
        document.addEventListener("click", hiddenMenuXs, false);
      }, 100);
    } else {
      document.removeEventListener("click", hiddenMenuXs, false);
    }
  }

  function hiddenMenuXs() {
    elemN.setAttribute("data-show", "false");
    showFlg = false;
    document.removeEventListener("click", hiddenMenuXs, false);
  }
}

function setFooterPosition() {
  setTimeout(function() {
    var hBody = Math.max.apply( null, [document.body.clientHeight , document.body.scrollHeight, document.documentElement.scrollHeight, document.documentElement.clientHeight] ); 
    var hWindow = window.innerHeight;
    if (hBody > hWindow) {
      document.getElementById("footer").setAttribute("data-pos", "static");
    } else {
      document.getElementById("footer").setAttribute("data-pos", "bottom");
    }
  }, 200);
}

function addEventDLBtn() {
  document.getElementById("btn-dl-package").addEventListener("click", clickBtnPackage, false);
  document.getElementById("btn-dl-minify").addEventListener("click", clickBtnMinify, false);
  
  function clickBtnPackage() {
    if (typeof ga === "function") {
      ga('send', 'event', 'DL Button', 'DL Package', 'Package');
    }
  }
  function clickBtnMinify() {
    if (typeof ga === "function") {
      ga('send', 'event', 'DL Button', 'DL Minify Only', 'Minify Only');
    }
  }
}

function scrollTo(to, time) {
  const INTERVAL = 16;

  var s = document.documentElement.scrollTop || document.body.scrollTop;
  var now = s;
  var d = to - now;
  var distance = Math.abs(d);
  var change = Math.round(distance / time * INTERVAL);
  if (change === 0) {
    return;
  }
  var count = Math.floor(distance / change);
  var counter = 0;

  var siid = setInterval(function() {
    now = easeOut(counter, s, d, count);
    window.scrollTo(0, now);
    counter++;
    if (counter >= count) {
      clearInterval(siid);
      setTimeout(function() {
        window.scrollTo(0, to);
      }, INTERVAL);
    }
  }, INTERVAL);

  function easeOut(r, s, d, t) {
    r /= t;
    return -d * r * (r -2) + s;
  }
}

})();