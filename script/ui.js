'use strict'
SW.UI = {
  ready: function () {
    var that = this;
    this.str = {};
    this.str.ifHas = function(sA, sB) {return (sA.indexOf(sB) > -1); };
    this.ua = {};
    this.ua.str = navigator.userAgent;
    this.ua.isIE6 = !$.support.style && !this.str.ifHas(this.ua.str, 'MSIE 7');
    this.ua.isWebKit = this.str.ifHas(this.ua.str.toLowerCase(), 'webkit');

    this.rootElem = document.compatMode && document.compatMode === 'CSS1Compat' ? document.documentElement : document.body;
    this.rootScrollingElem = null;
    $(function () {  //document.body maybe not ready when this js running.
      that.rootScrollingElem = (that.ua.isWebKit) ? document.body : that.rootElem;
    });
  },
  dialog: {
    isReady: false,  //if .ini() is ready
    isVisible: false,
    isTiming: false,  //for autoClose
    jContent: null,
    timer: null,
    queue: [],
    cfgCurrent: null,  //temp var
    cfgDefault: {
      s: null,
      j: null,
      closeBtn: false,
      autoClose: false,
      autoCloseDelay: 3000
    },
    ini: function () {
      var jDialog = $('.cmDialog');
      jDialog.appendTo(document.body).addClass('cmDialogReady').removeClass('cmDialog');
    },
    open: function (arg) {
      if (this._handleCfg(arg)) {
        this._ini();
        this._iniCloseBtn();
        this._setAutoClose();
        this._open(this.cfgCurrent.j);
      }
    },
    close: function () {
      //if (this.isTiming) {return false; }
      if (this.isTiming) {
        clearTimeout(this.timer);
        this.isTiming = false;
      }
      //var j = $(s);
      this._hide(this.queue.shift());
      if (this.queue.length === 0) {
        SW.UI.mask.hide();
      } else {
        this._pos(this.queue[0]);
      }
    },
    switchTo: function (arg) {
      if (this._handleCfg(arg)) {
        this._hide(this.queue.shift());
        this._ini();
        this._iniCloseBtn();
        this._open(this.cfgCurrent.j);
      }
    },
    _iniCloseBtn: function () {
      var j = this.cfgCurrent.j;
      if (this.cfgCurrent.closeBtn) {
        if (!j.has('a.close-dialog').length) {
          var jCloseBtn = $('<a class="close-dialog icon" href="#close-dialog"></a>').appendTo(j);
          jCloseBtn.click(function () {
            //alert('close');
            this.dialog.close(this);
            this.blur();
            return false;
          });
        } else {
          j.find('a.close-dialog').show();
        }
      } else {
        if (j.has('a.close-dialog').length) {
          j.find('a.close-dialog').hide();
        }
      }
    },
    _setAutoClose: function () {
      var j = this.cfgCurrent.j;
      if (this.cfgCurrent.autoClose) {
        this.isTiming = true;
        this.timer = setTimeout(function () {
          this.dialog.isTiming = false;
          clearTimeout(this.dialog.timer);
          this.dialog.close(j);
        }, this.cfgCurrent.autoCloseDelay);
      }
    },
    _open: function (j) {
      if (this.queue.length === 0) {
        SW.UI.mask.show();
        this.queue.unshift(j);
        this._pos(j);
      } else {
        this._hide(this.queue[0]);
        this.queue.unshift(j);
        this._pos(j);
      }
    },
    _handleCfg: function (arg) {
      var result;
      var cfg = {};
      this.cfgCurrent = {};
      if (typeof arg === 'string' && arg) {
        cfg.s = arg;
        cfg.j = $(arg);
      } else if (!$.isEmptyObject(arg) && $.isPlainObject(arg) && arg.s) {
        cfg = arg;
        cfg.j = $(arg.s);
      }
      if (!$.isEmptyObject(cfg) && cfg.j.hasClass('cmDialogReady')) {
        this.cfgCurrent = {};
        $.extend(this.cfgCurrent, this.cfgDefault);
        $.extend(this.cfgCurrent, cfg);
        result = true;
      } else {
        result = false;
      }
      return result;
    },
    _ini: function () {
      if (!this.isReady) {
        this.isReady = true;
      }
    },
    _hide: function (j) {
      if (j && j.length) {
        j.closest('.cmDialogReady').css({left:'-999px',top:'-999px'});
      }
    },
    _pos: function (j) {
      var l = (SW.UI.rootElem.clientWidth - j.outerWidth())/2;
      var t = (SW.UI.rootElem.clientHeight * 0.95 - j.outerHeight())/2;
      l = (l < 5) ? 5 : l;
      t = (t < 5) ? 5 : t;
      j.css({
        left: l + (document.documentElement.scrollLeft || document.body.scrollLeft) + 'px',
        top: t + (document.documentElement.scrollTop || document.body.scrollTop) + 'px'
      });
    }
  },
  tabList: {
    getEle: function () {
      var tl = this.jTabList = $('.cmTabList');
      this.jTabs = tl.find('.cmTabs'),
      this.jTabContent = tl.find('.cmTabContent');
    },
    exchange: function (jEle) {
      var cl = jEle.attr('for'),
        tc = this.jTabContent,
        len = tc.length,
        temp = null,
        i = 0;
      this.jTabs.removeClass('cmCurrentTab');
      jEle.addClass('cmCurrentTab');
      for (i; i < len; i++) {
        temp = tc.eq(i);
        if (!temp.hasClass(cl)) {
          temp.hide().removeClass('cmCurrentTabContent');
        } else {
          temp.show().addClass('cmCurrentTabContent');
        }
      }
    },
    bind: function () {
      var that = this;
      this.jTabs.bind('click', function () {
        that.exchange($(this));
      });
    },
    _ini: function () {
      this.jTabs.eq(0).click();
    },
    ini: function () {
      this.getEle();
      this.bind();
      this._ini();
    }
  },
  mask: {
    isReady: false,
    isVisible: false,
    jSelect: [],
    _ini: function () {
      if (!this.isReady) {
        this.jMask = $('<div class="cmMask"></div>').appendTo(document.body);
        $(window).resize(function (){
          if (this.isVisible) {
            this._pos();
          }
        });
        this.isReady = true;
      }
    },
    _pos: function () {
      this.jMask.css({
        width: SW.UI.rootElem.scrollWidth + 'px',
        height: SW.UI.rootElem.scrollHeight + 'px'
      });
    },
    pos: function () {
      this._pos();
    },
    show: function (callback) {
      if (this.isVisible) {return false; }
      this._ini();
      this._pos();
      this._hideSelect();
      this.jMask.css('visibility', 'visible');
      this.isVisible = true;
      if ($.isFunction(callback)) {callback(); }
    },
    hide: function (callback) {
      if (!this.isVisible) {return false; }
      this.jMask.css({
        visibility: 'hidden',
        width: '0',
        height: '0'
      });
      this._showSelect();
      this.isVisible = false;
      if ($.isFunction(callback)) {callback(); }
    },
    _hideSelect: function () {
      if (SW.UI.ua.isIE6) {
        this.jSelect = $('select').not('.cmDialogReady select');
        this.jSelect.css('visibility', 'hidden');
      }
    },
    _showSelect: function () {
      if (SW.UI.ua.isIE6) {
        this.jSelect.css('visibility', 'visible');
      }
    }
  },
  carouselDef: function () {
    this.carousel = function(container, args) {
      this.content = container;
      this.items = container.children();
      this.iLen = this.items.length;
      this.params = {
        type: "h",
        unit: 0,
        speed: "slow",
        position: 0,
        autoFix: true
      };
      if (args) {
        jQuery.extend(this.params, args);
      }
      this.ini();
    };
    this.carousel.prototype = {
      move: function() {
        var that = this, css = {};
        css[this.params.cssName] = "-" + this.params.position + "px";
        this.content.animate(css, this.params.speed, function() {
          that.complete();
        });
      },
      complete: function() {
        if (this.params.position === this.params.scope || this.iLen <= 2) {
          this.controlNext.addClass("not");
        } else {
          this.controlNext.removeClass("not");
        }
        if (this.params.position === 0  || this.iLen <= 2) {
          this.controlPrev.addClass("not");
        } else {
          this.controlPrev.removeClass("not");
        }
        this.status = false;
      },
      next: function() {
        if (this.status || this.params.position === this.params.scope) {return; }
        this.status = true;
        var target = this.params.position + this.params.moveUnit;
        this.params.position = target < this.params.scope ? target : this.params.scope;
        this.move();
      },
      prev: function() {
        if (this.status || this.params.position === 0) {return; }
        this.status = true;
        var target = this.params.position - this.params.moveUnit;
        this.params.position = target > 0 ? target : 0;
        this.move();
      },
      reset: function() {
        /*this.content.stop().css({
          top: 0,
          left: 0
        });
        this.params.position = 0;
        this.controlPrev.addClass("not");
        this.controlNext.removeClass("not");
        this.status = false;*/
        var conWidth, conHeight;
        if (this.params.type === "h") {
          conWidth = this.items.outerWidth(true) * this.iLen + "px";
          conHeight = "100%";
          this.content.css({
            width: conWidth,
            height: conHeight
          });
          this.params.scope = this.content.outerWidth() - this.canvas.outerWidth();
        } else {
          conWidth = "100%";
          conHeight = this.items.outerHeight(true) * this.iLen + "px";
          this.content.css({
            width: conWidth,
            height: conHeight
          });
          this.params.scope = this.content.outerHeight() - this.canvas.outerHeight();
        }
        this.complete();
      },
      check: function () {
        var that = this;
        if (this.content.children().length !== this.iLen) {
          this.items = this.content.children();
          this.iLen = this.items.length;
          this.reset();
        }
        setTimeout(function () {
          that.check();
        }, 500);
      },
      bind: function() {
        var that = this;
        this.controlNext.click(function() {
          that.next();
        });
        this.controlPrev.click(function() {
          that.prev();
        });
      },
      create: function() {
        var conWidth,
          conHeight,
          html = [
            "<div class='carousel-wrap' style='width:" + this.content.outerWidth() + "px;height:" + this.content.outerHeight() + "px;'>",
              "<div class='carousel-content' style='position:relative;width:" + this.content.outerWidth() + "px;height:" + this.content.outerHeight() + "px;overflow:hidden;'></div>",
              "<div class='carousel-control'>",
                "<span class='prev not'><span class='prev-s'></span></span>",
                "<span class='next'><span class='next-s'></span></span>",
              "</div>",
            "</div>"
          ].join('');
        if (this.params.type === "h") {
          conWidth = this.items.outerWidth(true) * this.iLen + "px";
          conHeight = "100%";
        } else {
          conWidth = "100%";
          conHeight = this.items.outerHeight(true) * this.iLen + "px";
        }
        this.content.wrap(html).css({
          position: "absolute",
          top: 0,
          left: 0,
          width: conWidth,
          height: conHeight,
          overflow: "visible"
        });
        this.wrap = this.content.parents(".carousel-wrap");
        this.canvas = this.content.parent();
        this.controlNext = this.wrap.find(".carousel-control .next");
        this.controlPrev = this.wrap.find(".carousel-control .prev");
      },
      config: function() {
        if (this.params.type === "h") {
          this.params.cssName = "left";
          this.params.scope = this.content.outerWidth() - this.canvas.outerWidth();
          this.params.moveUnit = this.params.unit > 0 ? (this.items.outerWidth(true) * this.params.unit) : this.canvas.outerWidth();
        } else {
          this.params.cssName = "top";
          this.params.scope = this.content.outerHeight() - this.canvas.outerHeight();
          this.params.moveUnit = this.params.unit > 0 ? (this.items.outerHeight(true) * this.params.unit) : this.canvas.outerHeight();
        }
      },
      ini: function() {
        /*if (this.params.type === "h") {
          if (this.content.outerWidth() >= this.items.outerWidth(true) * this.items.length) {return; }
        } else {
          if (this.content.outerHeight() >= this.items.outerHeight(true) * this.items.length) {return; }
        }*/
        this.create();
        this.config();
        this.bind();
        if (this.params.autoFix) {
          this.check();
        }
      }
    };
  },
  dragDef: function () {
    this.drag = function (jEle, arg) {
      /*
      @param {
        parent: '' || jEle,
        overParentAble: false,
        rangeParent: '' || jEle,
        whenMove: fn(),
        moveType: 'h' || 'v',
        whenStart: fn(),
        whenEnd: fn(),
        min: 0,//only effect when moveType defined
        max: 0//only effect when moveType defined
      }
      */
      jEle = typeof jEle === 'string' ? $(jEle) : jEle;
      if (jEle[0]) {
        this.jEle = jEle;
        this.ini(arg);
      } else {
        new Error('SW.UI.drag - no jQuery Object found!');
      }
    };
    this.drag.prototype = {
      timer: null,
      mousedown: false,
      handle: function (arg) {
        var jEle = this.jEle,
          p = null;
        jEle.addClass('dragable');
        this.currentConfig = $.extend({}, this.defCfg, (arg || {}));
        p = this.currentConfig.parent;
        if (p) {
          this.parent = typeof p === 'string' ? $(p) : p;
        }
      },
      defCfg: {
        parent: '.editor-win',
        overParentAble: false
      },
      setXYs: function (e) {
        e = e || event;
        var cx = e.clientX,
          cy = e.clientY,
          cfg = this.currentConfig,
          p = this.jEle.position();
        this.currentXY = [cx, cy];
        this.startFromXY = [cx, cy];
        if (this.parent) {
          var oft = this.parent.offset();
          this.currentXY = [cx - oft.left, cy - oft.top];
        }
        this.jEleXY = [p.left, p.top];
        this.width = this.jEle.outerWidth();
        this.height = this.jEle.outerHeight();
        this.jEle.addClass('draging');
      },
      move: function (e) {
        e = e || window.event;
        var cx = e.clientX,
          cy = e.clientY,
          cfg = this.currentConfig,
          mouseXY = this.currentXY,
          left = 0,
          top = 0,
          pw = 0,
          ph = 0,
          w = this.width,
          h = this.height,
          jEleXY = this.jEleXY;
        this.currentXY = [cx, cy];
        if (this.parent) {
          var oft = this.parent.offset();
          this.currentXY = [cx - oft.left, cy - oft.top];
          left = oft.left;
          top = oft.top;
          pw = this.parent.width();
          ph = this.parent.height();
        }
        if (!cfg.moveType) {
          cx = jEleXY[0] + cx - left - mouseXY[0];
          cy = jEleXY[1] + cy - top - mouseXY[1];
        } else {
          if (cfg.moveType === 'v') {
            cx = jEleXY[0];
            cy = jEleXY[1] + cy - top - mouseXY[1];
            if (typeof cfg.min === 'number') {
              cy = Math.max(cfg.min - 10, cy);
            }
            if (typeof cfg.max === 'number') {
              cy = Math.min(cfg.max - 10, cy);
            }
          } else if (cfg.moveType === 'h') {
            cx = jEleXY[0] + cx - left - mouseXY[0];
            cy = jEleXY[1];
            if (typeof cfg.min === 'number') {
              cx = Math.max(cfg.min - 10, cx);
            }
            if (typeof cfg.max === 'number') {
              cx = Math.min(cfg.max - 10, cx);
            }
          }
        }
        if (!cfg.overParentAble) {
          cx = cx >= 0 ? (cx <= (pw - w) ? cx : (pw - w)) : 0;
          cy = cy >= 0 ? (cy <= (ph - h) ? cy : (ph - h)) : 0;
        }
        this.jEleXY = [cx, cy];
        this.jEle.css({
          left: cx,
          top: cy
        });
        if (cfg.whenMove) {
          cfg.whenMove();
        }
      },
      unbind: function (e) {
        e = e || event;
        var jEle = this.jEle,
          cfg = this.currentConfig,
          cx = e.clientX,
          cy = e.clientY,
          sxy = this.startFromXY || [];
        if (jEle.hasClass('draging')) {
          if (sxy[0] === cx && sxy[1] === cy) {
            if (cfg.onlyClick) {
              cfg.onlyClick.call(this);
            }
          }
          jEle.removeClass('draging');
          $(document).off('mousemove');
          if (cfg.whenEnd) {
            cfg.whenEnd.call(this);
          }
        }
      },
      bind: function () {
        var jEle = this.jEle,
            cfg = this.currentConfig,
            that = this;
        jEle.on('mousedown', function (e) {
          that.mousedown = true;
          that.setXYs(e);
          if (cfg.whenStart) {
            cfg.whenStart.call(that);
          }
          $(document).on('mousemove', function (e) {
            that.move(e);
            return false;
          });
          return false;
        });
        $(document).on('mouseup', function (e) {
          that.mousedown = false;
          that.unbind(e);
          return false;
        });
      },
      ini: function (arg) {
        this.handle(arg);
        this.bind();
      }
    };
  },
  cancelBubble: function (e) {
    e = e || window.event;
    if(e && e.stopPropagation){
      e.stopPropagation();
    }else{
      window.event.cancelBubble = true;
    }
  },
  toolBarDef: function () {
    /*
    @param {
      parent: 'body', //toolbar的DOM结构将会放入$(parent)对应的元素内
      dragable: true, //是否可拖动
      cla: 'myClass', //给予toolbar额外的类名(多个可用空格分隔)
      position: [0, 100],//toolbar的初始显示位置
      button: [//toolbar中的按钮
        {
          title: '玩家编辑器',//按钮的title值
          text: '玩家编辑器',//按钮的文字
          cla: 'btn-player',//按钮的类(多个可用空格分隔)
          clickEvent: function () {//按钮的点击事件
            log('click btn-player');
          }
        }
      ]
    }
    */
    this.toolBar = function (arg) {
      this.handleCfg(arg);
      this.ini();
    };
    this.toolBar.prototype = {
      constructor: 'SW.UI.toolBar',
      clickEventArray: [],
      tmp: [
        '<div class="editorToolBar">',
          '<ul></ul>',
        '</div>'
      ],
      create: function () {
        var html = this.tmp.join(''),
          cfg = this.currentCfg,
          p = $(cfg.parent);
        p.append(html);
        this.wrapper = p.find('.editorToolBar');
        this.btnBox = this.wrapper.find('ul');
        if (cfg.button && cfg.button.length > 0) {
          this.pushBtn(cfg.button);
        }
        if (cfg.position) {
          this.wrapper.css({
            left: cfg.position[0],
            top: cfg.position[1]
          });
        }
        if (cfg.cla) {
          this.wrapper.addClass(cla);
        }
        if (cfg.dragable) {
          new SW.UI.drag('.editorToolBar');
        }
      },
      pushBtn: function (btnArray) {
        var i = 0,
          len = btnArray.length,
          eArr = this.clickEventArray,
          eventIdx = -1,
          temp = null,
          html = [],
          str = [];
        for (i; i < len; i++) {
          temp = btnArray[i];
          if (temp.clickEvent) {
            eArr.push(temp.clickEvent);
            eventIdx = eArr.length - 1;
          } else {
            eventIdx = -1;
          }
          str = [
            '<li ' + (temp.cla ? ('class="' + temp.cla + '"') : '') + '>',
              '<a event-idx="' + eventIdx + '"' + (temp.title ? ('title="' + temp.title + '"') : '') + '>' + (temp.text || '') + '</a>',
            '</li>'
          ];
          html.push(str.join(''));
        }
        this.btnBox.html(html.join(''));
        this.btns = this.btnBox.find('li');
      },
      bind: function () {
        var that = this;
        if (this.btns) {
          this.btns.find('a').bind('click', function () {
            that.btnClick($(this).attr('event-idx'));
          });
        }
      },
      btnClick: function (idx) {
        if (idx && idx > -1) {
          this.clickEventArray[idx]();
        }
      },
      defCfg: {
        parent: 'body',
        dragable: true
      },
      handleCfg: function (arg) {
        this.currentCfg = $.extend({}, this.defCfg, arg);
      },
      ini: function () {
        this.create();
        this.bind();
      }
    };
  },
  bottomBarDef: function () {
    /*
    @param {
      parent: 'body',//bottomBar的DOM结构将会放入$(parent)对应的元素内
      clearWinAble: true,//bottomBar是否具有清屏按钮
      floatWinCla: 'float-win',//bottomBar清除的浮动窗的类名
      height: 35,//bottomBar的高度和行高
      cla: 'bottom-bar'//bottomBar的额外类名(多个可用空格分隔)
    }
    */
    this.bottomBar = function (arg) {
      this.handleCfg(arg);
      this.ini();
    };
    this.bottomBar.prototype = {
      constructor: 'SW.UI.bottomBar',
      tmp: [
        '<div class="editorBottomBar">',
          '<ul></ul>',
        '</div>'
      ],
      create: function () {
        var html = this.tmp.join(''),
          cfg = this.currentCfg,
          p = $(cfg.parent);
        p.append(html);
        this.wrapper = p.find('.editorBottomBar');
        this.taskBar = this.wrapper.find('ul');
        if (cfg.height) {
          this.wrapper.css({
            'height': cfg.height,
            'line-height': cfg.height + 'px'
          });
        }
        if (cfg.cla) {
          this.wrapper.addClass(cfg.cla);
        }
        if (cfg.clearWinAble) {
          this.appendClearWinBtn();
        }
      },
      appendClearWinBtn: function () {
        this.wrapper.prepend('<a title="隐藏悬浮框" class="clear-win-btn">隐藏悬浮框</a>');
        this.clearWinBtn = this.wrapper.find('.clear-win-btn');
      },
      bind: function () {
        var that = this;
        if (this.clearWinBtn) {
          this.clearWinBtn.bind('click', function () {
            that.clearWin();
          });
        }
      },
      clearWin: function () {
        var tasks = this.taskBar.find('li'),
          i = 0,
          len = tasks.length,
          temp = null;
        for (i; i < len; i++) {
          temp = tasks.eq(i);
          if (!temp.hasClass('minisized')) {
            temp.click();
          }
        }
      },
      add: function (html) {
        this.taskBar.append('<li class="createing-task">' + html + '</li>');
        this.createTask = this.taskBar.find('.createing-task');
        this.createTask.removeClass('createing-task');
        return this.createTask;
      },
      defCfg: {
        parent: 'body',
        clearWinAble: true,
        floatWinCla: 'float-win'
      },
      handleCfg: function (arg) {
        this.currentCfg = $.extend({}, this.defCfg, arg);
      },
      ini: function () {
        this.create();
        this.bind();
      }
    };
  },
  floatWinDef: function () {
    /*
    @param {
      parent: 'body',
      title: '',
      content: string || jQuery element,
      dragable: true,
      isShowMask: false,
      hasCloseBtn: true,
      hasMinSizeBtn: true
    }
    */
    this.floatWin = function (arg) {
      this.handleCfg(arg);
      this.ini();
    };
    this.floatWin.prototype = {
      constructor: 'SW.UI.floatWin',
      tmp: [
        '<div class="float-win working">',
          '<div class="float-win-title">',
          '</div>',
          '<ul class="win-btn">',
            '<li><a class="min-size-btn">最小化</a></li>',
            '<li><a class="close-btn">关闭</a></li>',
          '</ul>',
          '<div class="float-win-content">',
          '',
          '</div>',
        '</div>'
      ],
      create: function () {
        var cfg = this.currentCfg,
          ct = null,
          pos = [],
          p = $(cfg.parent);
        this.parent = p;
        if (cfg.content) {
          ct = typeof cfg.content === 'string' ? $(cfg.content) : cfg.content;
          ct.addClass('float-win-ready');
          p.append(this.tmp.join(''));
          this.wrapper = p.find('.working');
          this.title = this.wrapper.find('.float-win-title');
          this.closeBtn = this.wrapper.find('.win-btn .close-btn');
          this.minsizeBtn = this.wrapper.find('.win-btn .min-size-btn');
          this.wrapper.find('.float-win-content').append(ct);
          this.isMinsize = false;
          this.isClose = false;
          this.visible = true;
          if (cfg.title) {
            this.title.append(cfg.title);
          }
          if (cfg.cla) {
            this.wrapper.addClass(cfg.cla);
          }
          if (!cfg.hasCloseBtn) {
            this.closeBtn.hide();
          }
          if (!cfg.hasMinSizeBtn) {
            this.minsizeBtn.hide();
          }
          if (cfg.dragable) {
            new SW.UI.drag(this.wrapper);
          }
          if (cfg.isShowMask) {
            SW.UI.mask.show();
          }
          pos = this.pos();
          this.wrapper.removeClass('working').addClass('current').css({
            left: pos[0],
            top: pos[1]
          });
          this.addToBottomBar();
        } else {
          new Error('Float-win need content element that defined in arguments.');
        }
      },
      addToBottomBar: function () {
        var that = this;
        this.bottomBarEle = SW.editor.bottomBar.add('<span>' + (this.currentCfg.title || '') + '</span>');
        this.wrapper.data('bottomBarTab', this.bottomBarEle);
        this.bottomBarEle.bind('click', function () {
          that.toggleFloatWin();
        });
      },
      toggleFloatWin: function () {
        if (this.bottomBarEle.hasClass('minisized')) {
          this.open();
        } else {
          this.minsize();
        }
      },
      delFromBottomBar: function () {
        this.bottomBarEle.unbind();
        this.bottomBarEle.remove();
      },
      open: function () {
        if (this.visible) {return;}
        if (this.isClose) {this.addToBottomBar();}
        if (this.currentCfg.isShowMask) {SW.UI.mask.show();}
        this.toggleCurrent();
        this.wrapper.show();
        this.isMinsize = false;
        this.isClose = false;
        this.visible = true;
        this.bottomBarEle.removeClass('minisized');
      },
      _hide: function () {
        this.wrapper.hide();
        if (this.currentCfg.isShowMask) {SW.UI.mask.hide();}
        this.visible = false;
      },
      minsize: function () {
        this._hide();
        this.isMinsize = true;
        this.bottomBarEle.addClass('minisized');
      },
      close: function () {
        this._hide();
        this.isClose = true;
        this.delFromBottomBar();
      },
      pos: function () {
        var j = this.wrapper,
          l = (this.parent.width() - j.outerWidth())/2,
          t = (this.parent.height() - j.outerHeight())/2,
          p = [];
        l = (l < 5) ? 5 : l;
        t = (t < 5) ? 5 : t;
        p = [l + this.parent.scrollLeft(), t + this.parent.scrollTop()];
        return p;
      },
      toggleCurrent: function () {
        $('.float-win').removeClass('current');
        this.wrapper.addClass('current');
      },
      defCfg: {
        parent: 'body',
        dragable: true,
        isShowMask: false,
        hasCloseBtn: true,
        hasMinSizeBtn: true
      },
      bind: function () {
        var that = this;
        this.minsizeBtn.bind('click', function () {
          that.minsize();
        });
        this.closeBtn.bind('click', function () {
          that.close();
        });
        this.wrapper.bind('mousedown', function () {
          that.toggleCurrent();
        });
        this.wrapper.children().bind('mousedown', function () {
          that.toggleCurrent();
        });
      },
      handleCfg: function (arg) {
        this.currentCfg = $.extend({}, this.defCfg, arg);
      },
      ini: function () {
        this.create();
        this.bind();
      }
    };
  },
  asCanvasDef: function () {
    /*
    @param {
      parent: 'body',
      isHideReferenceLine: true,
      canvasWidth: 0,
      canvasHeight: 0,
      cla: ''
    }
    */
    this.asCanvas = function (arg) {
      this.handleCfg(arg);
      this.ini();
    };
    this.asCanvas.prototype = {
      tmp: [
        '<div class="as-canvas">',
          '<div class="as-canvas-title">',
            '<label><input class="is-show-refence-line" valse="show" type="checkbox" />显示参考线(10x10)</label>',
          '</div>',
          '<div class="as-canvas-content">',
            '<div class="canvas-box">',
              '<svg></svg>',
              '<div class="sea-level-line">',
                '<span>0</span>',
              '</div>',
            '</div>',
          '</div>',
        '</div>'
      ],
      defCfg: {
        parent: 'body',
        isHideReferenceLine: false
      },
      create: function () {
        var html = this.tmp.join(''),
          cfg = this.currentCfg,
          width = cfg.canvasWidth || 'auto',
          height = cfg.canvasHeight || 'auto',
          pos = [],
          that = this,
          moveBarCfg = {},
          p = $(cfg.parent);
        this.parent = p;
        p.append(html);
        this.wrapper = p.find('.as-canvas');
        this.title = this.wrapper.find('.as-canvas-title');
        this.refenceBtn = this.title.find('.is-show-refence-line');
        this.canvasBox = this.wrapper.find('.canvas-box');
        this.svg = this.canvasBox.find('svg');
        this.seaLevelLine = this.canvasBox.find('.sea-level-line');
        this.seaLevelTip = this.seaLevelLine.find('span');
        this.canvasBox.css({
          width: width,
          height: height
        });
        if (cfg.isHideReferenceLine) {
          this.refenceBtn.hide();
        }
        if (cfg.cla) {
          this.wrapper.addClass(cfg.cla);
        }
        moveBarCfg = {
          moveType: 'v',
          parent: this.canvasBox,
          whenMove: function () {
            var h = that.seaLevelLine.position().top;
            that.seaLevelTip.html(h + 10);
          }
        };
        if (typeof cfg.dragMin === 'number') {
          moveBarCfg.min = cfg.dragMin;
        }
        if (typeof cfg.dragMax === 'number') {
          moveBarCfg.max = cfg.dragMax;
        }
        new SW.UI.drag(this.seaLevelLine, moveBarCfg);
        pos = this.pos();
        this.wrapper.css({
          left: pos[0],
          top: pos[1]
        });
      },
      handleCfg: function (arg) {
        this.currentCfg = $.extend({}, this.defCfg, arg);
      },
      pos: function () {
        var j = this.wrapper,
          l = (this.parent.width() - j.outerWidth())/2,
          t = (this.parent.height() - j.outerHeight())/2,
          p = [];
        l = (l < 5) ? 5 : l;
        t = (t < 5) ? 5 : t;
        p = [l + this.parent.scrollLeft(), t + this.parent.scrollTop()];
        return p;
      },
      ini: function () {
        this.create();
      }
    };
  },
  ini: function () {
    this.ready();
    this.dialog.ini();
    this.tabList.ini();
    this.carouselDef();
    this.dragDef();
    this.toolBarDef();
    this.bottomBarDef();
    this.floatWinDef();
    this.asCanvasDef();
  }
};

