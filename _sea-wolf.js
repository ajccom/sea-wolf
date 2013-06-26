var log = function (t) {
	if (window.console) {
		console.log(t);
	} else {
		alert(t);
	}
};

var SW = {
	UI: {
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
				unbind: function () {
					var jEle = this.jEle,
						cfg = this.currentConfig;
					jEle.removeClass('draging');
					jEle.unbind('mousemove');
					if (cfg.whenEnd) {
						cfg.whenEnd();
					}
				},
				bind: function () {
					var jEle = this.jEle,
						cfg = this.currentConfig,
						that = this;
					jEle.bind('mousedown', function (e) {
						that.mousedown = true;
						that.setXYs(e);
						if (cfg.whenStart) {
							cfg.whenStart();
						}
						jEle.bind('mousemove', function (e) {
							that.move(e);
							return false;
						});
						return false;
					});
					jEle.children().bind('mousedown', function (e) {
						SW.UI.cancelBubble(e);
					});
					$('html').bind('mouseup', function () {
						that.mousedown = false;
						that.unbind();
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
	},
	loader: {
		config: {
			eleClass: '.loader',
			srcPath: 'image/',
			srcList: ['launch100_6x5.png', 'bullet100_2x10.jpg', 'guard_26x78.png', 'p_10x20.png', 'oppo-sea.png', 'oppo-sky.jpg', 'lightning_40x1000.png', 'b0_20x20.png', 'b1_20x20.png', 'b2_20x20.png', 'boom3.png', 'boom2_100x400.png', 'boom1_40x40.png', 'bullet0_5x5.png', 'bullet1_100x50.png', 'bullet2_30x30.png', 'enemy_70x60.png', 'enemy1_70x60.png', 'enemy2_70x60.png', 'enemy3_70x60.png', 'ship.png', 'ship1_53x18.png', 'ship2.png', 'sky.jpg', 'control-bg.jpg', 'logo.jpg', 'pause-go.png', 'boss1_250x255.png', 'boss2_250x255.png', 'boss3.png', 'sea.png', 'egg_30x30.png', 'attacked1_53x120.png', 'wing_15x21.png', 'bubble_57x25.png', 'launch0_5x5.png', 'launch1_40x10.png', 'launch2_20x20.png', 't0_20x90.png'],
			delay: 10,
			animateDelay: 10
		},
		pre: 0,
		getEle: function () {
			var w = this.wrapper = $(this.config.eleClass);
			this.wait = w.find('.wait');
			this.ready = w.find('.ready');
			this.preEle = w.find('.pre');
			this.progressEle = w.find('.progress b');
			this.play = w.find('.ready a.start');
			this.edit = w.find('.ready a.edit');
			this.i = 0;
			this.p = this.config.srcPath;
			this.l = this.config.srcList;
			this.len = this.l.length;
			this.step = 100/this.len;
		},
		update: function (pre) {
			var color = parseInt(pre * 2.55, 10);
			this.preEle.html(pre.toFixed(2));
			this.progressEle.css({
				'background-color': 'rgb(100, ' + color + ', 50)'
			}).animate({
				'width': pre + '%'
			}, this.config.animateDelay);
		},
		open: function () {
			this.wrapper.show();
			SW.UI.mask.show();
		},
		ok: function () {
			this.wait.hide();
			this.ready.show();
			this.status = true;
		},
		close: function () {
			if (!this.status) {return false;} 
			this.wrapper.hide();
			SW.UI.mask.hide();
			SW.loader = null;//say goodbye with our Mr.loader~
			$(document).unbind('keydown');
		},
		load: function () {
			var that = this,
				p = this.p,
				l = this.l,
				len = this.len,
				i = this.i,
				temp = new Image(),
				step = this.step,
				d = this.config.delay;
			if (i >= len) {
				if (this.pre < 100) {
					this.update(100);
				}
				setTimeout(function () {
					that.ok();
				}, d);
				return false;
			}
			temp.src = p + l[i];
			$(temp).bind('load', function () {
				that.pre += step;
				that.update(that.pre);
				that.i++;
				setTimeout(function () {
					that.load();
				}, d);
			});
		},
		bind: function () {
			var that = this;
			this.play.bind('click', function () {
				that.close();
				SW.game.ini();
			});
			this.edit.bind('click', function () {
				that.close();
				$('.sea-wolf').hide();
				SW.editor.ini();
			});
			$(document).keydown(function(e){
				switch(e.keyCode) {
					case 13: //zuo
						e.preventDefault();
						that.close();
						SW.game.ini();
						break;
				}
			});
		},
		ini: function () {
			this.getEle();
			this.bind();
			this.open();
			this.load();
		}
	},
	game: {
		win: {},//适应屏幕尺寸
		config: {
			step: 10,
			pause: false,
			seaLevel: 100,//海平面与天空高度
			playerStartX: 500,
			enemyTotalCount: 10,
			scoreToLife: 20000,
			isSelectGifting: false,
			level: 'normal',// easy normal hard, effect enemys bullets number & enemys in stage
			keydown: false,
			stageSwitchTime: 3000,
			goodDepreciationRate: 0.5,//折旧率
			powerCollect: false//使用power击沉的敌人是否可以增加power槽长度 和 产生egg
		},
		player: {
			lv: 0,//玩家当前等级
			exp: 0,//玩家的经验
			coin: 10000,//玩家的游戏币
			part: 10000,//玩家获得的零件（虚拟币，拥有商店购物）
			score: 0,//玩家分数
			isDead: false,
			life: 3,
			reliveTime: 3000,
			store: {
				ship: [],
				equipment: []
			},
			avator: {//玩家的avator信息
				ship: 0,//船体
				equipment: [],//装备
				bullet: [0, 0]//武器
			},
			current: {//当前能力，位置，方向等，提升效率避免每次计算，空间换时间
				/*XY: []
				status: {//道具给予（无敌加速之类）的状态，自身血量（冒烟着火之类）状态等等
				
				},
				dir: 'l'*/
				
			},
			updateAvator: function (arg) {//update avator arg: {ship: shipId}, {equipment: equipmentId} ...
				
			},
			exchangeBullet: function (num) {
				var t = 0,
					pb = SW.game.bullet.current.player,
					bInfo = SW.game.player.current.avator.bullet,
					type = bInfo[0],
					lv = bInfo[1];
				if (type !== num) {
					this.current.avator.bullet = [num, lv];
				} else {
					SW.game.player.current.avator.bullet = [num, ((lv + 1 < 4) ? (lv + 1) : 4)];
				}
				for (t in pb) {
					if (t !== num) {
						pb[t] = [];
					}
				}
			},
			setDir: function (dir) {
				this.current.dir = dir;
				this.current.keydown = true;
			},
			draw: function () {
				if (this.stopDraw) {return}
				var ctx = SW.game.ctx,
					cfg = SW.game.config,
					c = this.current,
					sl = SW.game.config.seaLevel,
					img = new Image(),
					w = SW.game.canvas.width,
					eqArr = SW.game.player.avator.equipment,
					eqLen = eqArr.length,
					g = SW.game.stage.gravity,
					f = SW.game.stage.floating,
					ea = SW.game.equipment.able,
					ga = SW.game.gift.able,
					speed = c.speed * ((ea.speed ? ea.speed : 0) + (ga.speed ? ga.speed : 0) + 1);
					flyForce = 0,
					diveForce = 0,
					isHide = c.isHide,
					bulletCooldown = c.bulletCooldown,
					i = 0;
				img.src = SW.game.imgPath + c.img;
				pheight = c.pheight;
				hW = c.width;
				if (c.status.fly) {
					flyForce = c.flyForce;
					c.flyForce = flyForce + g;
					if (c.XY[1] > sl - pheight) {
						c.XY[1] = sl - pheight;
						c.status.fly = false;
					} else {
						if (flyForce >= c.flyPoint) {
							c.XY[1] = c.XY[1] + 2;
						} else {
							c.XY[1] = c.XY[1] - 2;
						}
						
					}
				}
				if (c.status.dive) {
					diveForce = c.diveForce;
					c.diveForce = diveForce + f;
					if (c.XY[1] < sl - pheight) {
						c.XY[1] = sl - pheight;
						c.status.dive = false;
					} else {
						if (diveForce <= c.divePoint) {
							c.XY[1] = c.XY[1] - 2;
						} else {
							c.XY[1] = c.XY[1] + 2;
						}
						
					}
				}
				if (!c.status.dead) {
					if (c.dir === 'l') {
						ctx.setTransform(1, 0, 0, 1, 0, 0);
						if (this.current.keydown) {
							if (c.XY[0] - speed > 0) {
								c.XY[0] = c.XY[0] - speed;
							} else {
								c.XY[0] = 0;
							}
							if (!c.status.move) {
								c.status.move = true;
								SW.game.moveClip.animate();
							}
						} else {
							if (c.status.move) {
								SW.game.moveClip.stopAnimate();
							}
						}
						ctx.drawImage(img, (isHide ? hW : 0) , c.currentFrame * pheight, hW, pheight, c.XY[0], c.XY[1], hW, pheight);
					} else if (c.dir === 'r') {
						ctx.setTransform(1, 0, 0, 1, 0, 0);
						ctx.translate(w, 0);
						ctx.scale(-1, 1);
						if (this.current.keydown) {
							if (c.XY[0] + speed < w - hW) {
								c.XY[0] = c.XY[0] + speed;
							} else {
								c.XY[0] = w - hW;
							}
							if (!c.status.move) {
								c.status.move = true;
								SW.game.moveClip.animate();
							}
						} else {
							if (c.status.move) {
								SW.game.moveClip.stopAnimate();
							}
						}
						ctx.drawImage(img, (isHide ? hW : 0), c.currentFrame * pheight, hW, pheight, w - hW - c.XY[0], c.XY[1], hW, pheight);
					}
					if (c.status.invincible) {
						c.invincibleTime = c.invincibleTime - 1;
						if (c.invincibleTime % c.invinciblePerTime === 0) {
							c.isHide = !c.isHide;
						}
						if (c.invincibleTime <= 0) {
							c.status.invincible = false;
							c.isHide = false;
						}
					}
				} else {
					c.reliveTime = c.reliveTime - 1;
					if (c.reliveTime <= 0) {
						this.relive();
					}
				}
				if (c.status.move && !c.status.fly && !c.status.dive && !c.status.dead) {
					SW.game.moveClip.draw(c.moveClip, c.XY, c.dir);
				}
				if (bulletCooldown > 0) {
					c.bulletCooldown = bulletCooldown - 1;
				}
				if (eqLen > 0 && !c.status.dead) {
					if (eqLen > 1) {
						for (i; i < eqLen; i++) {
							if (eqArr[i] !== undefined && !SW.game.equipment[eqArr[i]].nodraw) {
								SW.game.equipment.draw(eqArr[i], c.XY, c.dir);
							}
						}
					} else {
						if (eqArr[0] !== undefined && !SW.game.equipment[eqArr[0]].nodraw) {
							SW.game.equipment.draw(eqArr[0], c.XY, c.dir);
						}
					}
				}
			},
			ini: function () {
				var avator = this.avator,
					shipIdx = avator.ship ? avator.ship : 0,
					ship = SW.game.ship[avator.ship],
					equipmentArr = avator.equipment,
					bullet = avator.bullet,
					eqLen = equipmentArr.length,
					pheight = ship.height / ship.frames,
					i = 0;
				this.current = {
					dir: 'l',
					hp: ship.maxHp,
					maxHp: ship.maxHp,
					power: ship.power,
					speed: ship.speed,
					maxPower: ship.maxPower,
					img: ship.img,
					maxEqLen: ship.maxEqLen,
					avator: {
						ship: avator.ship,
						equipment: equipmentArr,
						bullet: bullet
					},
					width: ship.width,
					height: ship.height,
					hitRange: ship.hitRange,
					status: {},
					frames: ship.frames,
					currentFrame: ship.currentFrame,
					preFrameTime: ship.preFrameTime,
					XY: [SW.game.config.playerStartX, SW.game.config.seaLevel - pheight],
					moveClip: ship.moveClip,
					pheight: pheight,
					flyForce: 0,
					diveForce: 0,
					bulletCooldown: 0
				};
				this.animate();
				if (eqLen > 0) {
					if (eqLen === 1) {
						SW.game.equipment.animate(equipmentArr[0]);
						SW.game.equipment.handle(equipmentArr[0]);
					} else {
						for (i; i < eqLen; i++) {
							SW.game.equipment.animate(equipmentArr[i]);
							SW.game.equipment.handle(equipmentArr[i]);
						}
					}
				}
			},
			animate: function () {
				var that = this;
				setTimeout(function () {
					that.current.currentFrame = (that.current.currentFrame + 1) % that.current.frames;
					that.animate();
				}, this.current.preFrameTime);
			},
			setFlyForce: function (f) {
				f = f || -30;
				var c = this.current,
					ec = SW.game.equipment.able;
				//	g = SW.game.stage.gravity;
				if (c.status.fly === true) {return false;}
				if (ec.canFly) {
					c.status.fly = true;
					c.flyForce = f;
					c.flyPoint = f/2;
				}
			},
			setDiveForce: function (f) {
				f = f || 30;
				var c = this.current,
					ec = SW.game.equipment.able;
				//	g = SW.game.stage.floating;
				if (c.status.dive === true) {return false;}
				if (ec.canDive) {
					c.status.dive = true;
					c.diveForce = f;
					c.divePoint = f/2;
				}
			},
			relive: function () {
				var c = SW.game.player.current,
					life = SW.game.player.life,
					pMax = SW.game.ship[SW.game.player.avator.ship].maxHp,
					eMax = SW.game.equipment.able.maxHp,
					gMax = SW.game.gift.able.maxHp,
					max = pMax + eMax + gMax;
				SW.game.player.life = life - 1;
				c.status.dead = false;
				c.XY = [SW.game.config.playerStartX, SW.game.config.seaLevel - c.pheight];
				c.hp = max;
				if (c.power.count < 1) {
					c.power.count = 1;
					SW.game.panel.updatePower();
				}
				c.avator.bullet = [0, 0];
				SW.game.panel.updateHp();
				SW.game.panel.updateLife();
			}
		},
		lv: {
			'0': {
				
			},
			'1': {
			
			}
		},
		ship: {
			exchange: function (idx) {
				var c = SW.game.player.current,
					ship = this[idx];
				SW.game.player.avator.ship = idx;
				c.power = ship.power;
				c.speed = ship.speed;
				c.maxHp = ship.maxHp;
				c.maxPower = ship.maxPower;
				c.img = ship.img;
				c.maxEqLen = ship.maxEqLen;
				c.avator.ship = idx;
				c.width = ship.width;
				c.height = ship.height;
				c.hitRange = ship.hitRange;
				c.frames = ship.frames;
				c.currentFrame = 0;
				c.preFrameTime = ship.preFrameTime;
				c.moveClip = ship.moveClip;
				c.pheight = ship.height / ship.frames;
			},
			'0': {
				img: 'ship1_53x18.png',
				speed: 4,
				maxHp: 3,
				maxPower: 1,
				maxEqLen: 1,//装备数量
				power: {
					currentType: 0,
					type: 1,//power类型
					count: 1//power的当前数量
				},
				shop: {
					cost: {
						'coin': 0,
						'part': 0
					},
					name: '船体',
					desc: '最基础的小船啦'
				},
				width: 53,
				height: 54,
				hitRange: [5, 0, 45, 18],
				frames: 3,
				currentFrame: 0,
				preFrameTime: 1000,
				moveClip: '0'//move id
			},
			'1': {
				img: 'ship1_53x18.png',
				speed: 5,
				maxHp: 3,
				maxPower: 3,
				maxEqLen: 2,//装备数量
				power: {
					currentType: 0,
					type: 1,//power类型
					count: 1//power的当前数量
				},
				shop: {
					cost: {
						'coin': 1000,
						'part': 10
					},
					name: '基础船体',
					desc: '可靠的小舢板'
				},
				width: 53,
				height: 54,
				hitRange: [5, 0, 45, 18],
				frames: 3,
				currentFrame: 0,
				preFrameTime: 1000,
				moveClip: '0'//move id
			},
			'2': {
				img: 'ship1_53x18.png',
				speed: 6,
				maxHp: 4,
				maxPower: 2,
				maxEqLen: 3,
				power: {
					currentType: 0,
					type: 1,//power类型
					count: 1//power的当前数量
				},
				shop: {
					cost: {
						'part': 10
					},
					name: '阿姆斯特朗船体',
					desc: '阿姆斯特朗级船体。宇宙历223年由月面基地阿斯特特拉开发生产的LL级旗舰，火力与防御力集于一身的移动堡垒。宇宙历224年服役于月面统帅巴拉斯的亲卫部队雷王。'
				},
				width: 53,
				height: 54,
				hitRange: [5, 0, 45, 18],
				frames: 3,
				currentFrame: 0,
				preFrameTime: 1000,
				moveClip: '0'//move id
			},
			'3': {
				img: 'ship1_53x18.png',
				speed: 6,
				maxHp: 5,
				maxPower: 5,
				maxEqLen: 3,
				power: {
					currentType: 0,
					type: 1,//power类型
					count: 1//power的当前数量
				},
				shop: {
					cost: {
						'part': 10
					},
					name: '阿姆斯特朗II船体',
					desc: '阿姆斯特朗II级船体。宇宙历225年由月面基地阿斯特特拉开发生产的LL级旗舰，火力与防御力集于一身的移动堡垒。宇宙历224年服役于月面统帅巴拉斯的亲卫部队雷王。'
				},
				width: 53,
				height: 54,
				hitRange: [5, 0, 45, 18],
				frames: 3,
				currentFrame: 0,
				preFrameTime: 1000,
				moveClip: '0'//move id
			}
		},
		moveClip: {
			draw: function (moveClipId, currentPosition, dir) {
				var ctx = SW.game.ctx,
					img = new Image(),
					w = SW.game.canvas.width,
					moveInfo = this[moveClipId],
					pheight = moveInfo.height / moveInfo.frames,
					c = SW.game.player.current,
					cw = c.width,
					ch = c.pheight,
					hW = moveInfo.width,
					that = this;
				img.src = SW.game.imgPath + moveInfo.img;
				if (dir === 'l') {
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.drawImage(img, 0 , moveInfo.currentFrame * pheight, hW, pheight, currentPosition[0] + moveInfo.pos[0], currentPosition[1] + ch - pheight + moveInfo.pos[1], hW, pheight);
				} else {
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.translate(w, 0);
					ctx.scale(-1, 1);
					ctx.drawImage(img, 0, moveInfo.currentFrame * pheight, hW, pheight, w - cw - currentPosition[0] + moveInfo.pos[0], currentPosition[1] + ch - pheight + moveInfo.pos[1], hW, pheight);
				}
			},
			animate: function () {
				var c = SW.game.player.current,
					isMove = c.status.move,
					moveInfo = this[c.moveClip],
					that = this;
				if (isMove) {
					this.moveTimer = setTimeout(function () {
						moveInfo.currentFrame = (moveInfo.currentFrame + 1) % moveInfo.frames;
						that.animate();
					}, moveInfo.preFrameTime);
				}
			},
			stopAnimate: function () {
				clearTimeout(this.moveTimer);
				SW.game.player.current.status.move = false;
			},
			'0': {
				img: 'move1_53x18.png',
				width: 53,
				height: 54,
				pos: [5, 0],
				frames: 3,
				currentFrame: 0,
				preFrameTime: 300
			}
		},
		enemy: {
			current: [],
			cXY: [],
			animateTimer: {},
			animate: function (idx) {
				var that = this,
					current = that[idx];
				this.animateTimer[idx] = setTimeout(function () {
					current.currentFrame = (current.currentFrame + 1) % current.frames;
					that.animate(idx);
				}, current.preFrameTime);
			},
			stopAnimate: function () {
				var timer;
				for (timer in this.animateTimer) {
					clearTimeout(this.animateTimer[timer]);
				}
				//log('clear enemy animate');
			},
			draw: function () {
				var ctx = SW.game.ctx,
					cfg = SW.game.config,
					enemys = this.current,
					img = null,
					w = SW.game.canvas.width,
					len = enemys.length,
					i = 0,
					nextStep = [],
					rad = 0,
					currentFrame = 0,
					temp = null,
					XY = [],
					tw = 0,
					isAttacked = false,
					th = 0;
				if (len <= 0) {return false;}
				this.cXY = [];
				for (i; i < len; i++) {
					temp = enemys[i];
					if (temp) {
						if (temp.delay <= 0) {
							if (!temp.type) {
								if (temp.status && temp.status.attacked) {
									isAttacked = true;
								}
								nextStep = temp.movePath[0];
								currentFrame = SW.game.enemy[temp.id].currentFrame;
								tw = temp.width;
								th = temp.height;
								XY = temp.XY;
								rad = Math.PI/2 - Math.atan2(nextStep[0] - XY[0], nextStep[1] - XY[1]);
								img = new Image();
								img.src = SW.game.imgPath + temp.img;
								//ctx.setTransform(1, 0, 0, 1, 0, 0);
								//ctx.translate(temp.XY[0] + temp.width, temp.XY[1] + temp.height);
								//ctx.rotate(rad);
								//ctx.drawImage(img, 0, 0);
								if (isAttacked) {
									ctx.globalAlpha = 0.5;
								}
								if (temp.dir === 'r') {
									ctx.setTransform(1, 0, 0, 1, 0, 0);
									ctx.drawImage(img, 0, currentFrame * th, tw, th, XY[0], XY[1], tw, th);
								} else {
									ctx.setTransform(1, 0, 0, 1, 0, 0);
									ctx.translate(w, 0);
									ctx.scale(-1, 1);
									ctx.drawImage(img, 0, currentFrame * th, tw, th, w - tw - XY[0], XY[1], tw, th);
								}
								if (isAttacked) {
									ctx.globalAlpha = 1;
									temp.status.attacked = false;
									isAttacked = false;
								}
								XY[1] = XY[1] + temp.speed * Math.sin(rad);
								XY[0] = XY[0] + temp.speed * Math.cos(rad);
								if (Math.abs(XY[0] - nextStep[0]) <= temp.speed && Math.abs(XY[1] - nextStep[1]) <= temp.speed) {
									temp.movePath.shift();
									if (temp.movePath.length === 0) {
										SW.game.stage.queue.shift();
										enemys[i] = undefined;//undefined
										SW.game.stage.checkStageOver();
									} else {
										temp.XY = XY;
										if (temp.dir === 'r' && temp.movePath[0][0] < XY[0]) {
											temp.dir = 'l';
										}
										if (temp.dir === 'l' && temp.movePath[0][0] > XY[0]) {
											temp.dir = 'r';
										}
										this.cXY.push(XY);
										if (temp.skill) {
											this.handleSkill(temp.skill, [XY[0] + temp.width/2, XY[1]], temp.bullet, temp.skillFrame);
										}
									}
								} else {
									temp.XY = XY;
									this.cXY.push(XY);
									if (temp.skill) {
										this.handleSkill(temp.skill, [XY[0] + temp.width/2, XY[1]], temp.bullet, temp.skillFrame);
									}
								}
							} else if (temp.type === 'trace-missile') {
								var currentTurn = temp.currentTurn,
									x = 0,
									y = 0;
								currentFrame = SW.game.enemy['1000'].currentFrame;
								tw = temp.width;
								th = temp.pheight;
								XY = temp.XY;
								x = XY[0];
								y = XY[1];
								if (currentTurn !== 0) {
									rad = temp.rad;
									temp.currentTurn = currentTurn - 1;
								} else {
									var playerXY = SW.game.player.current.XY,
										minRad = Math.PI/30;
									rad = Math.atan2(playerXY[0] - x, playerXY[1] - y) - Math.PI/2;
									if (Math.abs(rad) - Math.abs(temp.rad) >= minRad) {
										rad = temp.rad - minRad;
									}
									temp.rad = rad;
									temp.currentTurn = temp.turnTime;
								}
								img = new Image();
								img.src = SW.game.imgPath + temp.img;
								if (isAttacked) {
									ctx.globalAlpha = 0.5;
								}
								ctx.setTransform(1, 0, 0, 1, 0, 0);
								ctx.translate(x + tw/2, y + th/2);
								ctx.rotate(Math.PI/2 - rad);
								ctx.drawImage(img, 0, currentFrame * th, tw, th, 0, 0, tw, th);
								if (isAttacked) {
									ctx.globalAlpha = 1;
									temp.status.attacked = false;
									isAttacked = false;
								}
								y = y - temp.speed * Math.sin(rad);
								x = x + temp.speed * Math.cos(rad);
								if (x < 0 - tw || x > w + tw || y < 0 - th) {
									enemys[i] = undefined;
								} else {
									temp.XY = [x, y];
								}
							}
						} else {
							temp.delay = temp.delay - 1;
						}
					}
				}
			},
			handleSkill: function (skillArr, XY, bullet, skillFrame) {
				var len = skillArr.length,
					i = 0;
				for (i; i < len; i++) {
					if (skillArr[i][1] <= 0) {
						SW.game.skill.handle[skillArr[i][0]](XY, bullet);
						skillArr[i][1] = skillFrame[i];
						//log(skillArr[i][1]);
					} else {
						skillArr[i][1] = skillArr[i][1] - 1;
					}
				}
			},
			'0': {
				hp: 1,
				speed: 1.5,
				img: 'enemy_70x60.png',
				width: 70,
				height: 60,
				bullet: 10,//bullet idx
				score: 10,
				coin: 0,
				boom: 0,//boom idx
				hitRange: [0, 0, 70, 60],
				frames: 2,
				currentFrame: 0,
				preFrameTime: 1500
			},
			'1': {
				hp: 2,
				speed: 1.5,
				img: 'enemy1_70x60.png',
				width: 70,
				height: 60,
				bullet: 10,//bullet idx
				score: 20,
				coin: 0,
				boom: 0,
				skill: [
					['v-shot', 5000]
				],
				hitRange: [0, 0, 70, 60],
				frames: 2,
				currentFrame: 0,
				preFrameTime: 1000
			},
			'2': {
				hp: 3,
				speed: 1.5,
				img: 'enemy2_70x60.png',
				width: 70,
				height: 60,
				bullet: 10,//bullet idx
				score: 30,
				coin: 0,
				boom: 0,
				skill: [
					['v-shot', 4000]
				],
				hitRange: [0, 0, 70, 60],
				frames: 2,
				currentFrame: 0,
				preFrameTime: 2000
			},
			'3': {
				hp: 5,
				speed: 2.5,
				img: 'enemy3_70x60.png',
				width: 70,
				height: 60,
				bullet: 10,//bullet idx
				score: 50,
				coin: 0,
				boom: 0,
				skill: [
					['v-shot', 3500]
				],
				hitRange: [0, 0, 70, 30],
				frames: 2,
				currentFrame: 0,
				preFrameTime: 500
			},
			'4': {
				hp: 1,
				speed: 1.5,
				img: 'enemy2_70x60.png',
				width: 70,
				height: 60,
				bullet: 10,//bullet idx
				score: 10,
				coin: 0,
				boom: 0,//boom idx
				skill: [
					['v-shot', 2000]
				],
				hitRange: [0, 0, 70, 60],
				frames: 2,
				currentFrame: 0,
				preFrameTime: 1500
			},
			'5': {
				hp: 1,
				speed: 1.5,
				img: 'enemy1_70x60.png',
				width: 70,
				height: 60,
				bullet: 10,//bullet idx
				score: 10,
				coin: 0,
				boom: 0,//boom idx
				skill: [
					['v-shot', 2000]
				],
				hitRange: [0, 0, 70, 60],
				frames: 2,
				currentFrame: 0,
				preFrameTime: 1500
			},
			'6': {
				hp: 1,
				speed: 1.5,
				img: 'enemy3_70x60.png',
				width: 70,
				height: 60,
				bullet: 10,//bullet idx
				score: 10,
				coin: 0,
				boom: 0,//boom idx
				skill: [
					['v-shot', 1000]
				],
				hitRange: [0, 0, 70, 60],
				frames: 2,
				currentFrame: 0,
				preFrameTime: 1500
			},
			'7': {
				hp: 5,
				speed: 1.5,
				img: 'enemy3_70x60.png',
				width: 70,
				height: 60,
				bullet: 10,//bullet idx
				score: 10,
				coin: 0,
				boom: 0,//boom idx
				skill: [
					['three-shot', 2000]
				],
				hitRange: [0, 0, 70, 60],
				frames: 2,
				currentFrame: 0,
				preFrameTime: 1500
			},
			'1000': {
				hp: 0.01,
				img: 't0_20x90.png',
				speed: 1,
				width: 20,
				height: 90,
				score: 2,
				coin: 0,
				boom: 0,
				hitRange: [0, 0, 20, 45],
				power: 2,
				frames: 2,
				currentFrame: 0,
				preFrameTime: 500,
				type: 'trace-missile',
				turnTime: 100
			}
		},
		boss: {
			current: [],
			cXY: [],
			animateTimer: {},
			animate: function (idx) {
				var that = this,
					current = that[idx];
				this.animateTimer[idx] = setTimeout(function () {
					current.currentFrame = (current.currentFrame + 1) % current.frames;
					that.animate(idx);
				}, current.preFrameTime);
			},
			stopAnimate: function () {
				var timer;
				for (timer in this.animateTimer) {
					clearTimeout(this.animateTimer[timer]);
				}
				//log('clear BOSS animate');
			},
			draw: function () {
				var ctx = SW.game.ctx,
					cfg = SW.game.config,
					bosses = this.current,
					img = null,
					w = SW.game.canvas.width,
					len = bosses.length,
					i = 0,
					nextStep = [],
					rad = 0,
					currentFrame = 0,
					temp = null,
					XY = [],
					tw = 0,
					isAttacked = false,
					th = 0;
				if (len <= 0) {return false;}
				this.cXY = [];
				for (i; i < len; i++) {
					temp = bosses[i];
					if (temp) {
						if (temp.delay <= 0) {
							if (temp.status && temp.status.attacked) {
								isAttacked = true;
							}
							nextStep = temp.movePath[temp.nextPath];
							currentFrame = SW.game.boss[temp.id].currentFrame;
							tw = temp.width;
							th = temp.height;
							XY = temp.XY;
							rad = Math.PI/2 - Math.atan2(nextStep[0] - XY[0], nextStep[1] - XY[1]);
							img = new Image();
							img.src = SW.game.imgPath + temp.img;
							//ctx.setTransform(1, 0, 0, 1, 0, 0);
							//ctx.translate(temp.XY[0] + temp.width, temp.XY[1] + temp.height);
							//ctx.rotate(rad);
							//ctx.drawImage(img, 0, 0);
							if (isAttacked) {
								ctx.globalAlpha = 0.5;
							}
							if (temp.dir === 'r') {
								ctx.setTransform(1, 0, 0, 1, 0, 0);
								ctx.drawImage(img, 0, currentFrame * th, tw, th, XY[0], XY[1], tw, th);
							} else {
								ctx.setTransform(1, 0, 0, 1, 0, 0);
								ctx.translate(w, 0);
								ctx.scale(-1, 1);
								ctx.drawImage(img, 0, currentFrame * th, tw, th, w - tw - XY[0], XY[1], tw, th);
							}
							if (isAttacked) {
								ctx.globalAlpha = 1;
								temp.status.attacked = false;
								isAttacked = false;
							}
							XY[1] = XY[1] + temp.speed * Math.sin(rad);
							XY[0] = XY[0] + temp.speed * Math.cos(rad);
							if (Math.abs(XY[0] - nextStep[0]) <= temp.speed && Math.abs(XY[1] - nextStep[1]) <= temp.speed) {
								temp.nextPath = (temp.nextPath + 1) % temp.pathCount;
								if (temp.dir === 'r' && temp.movePath[temp.nextPath][0] < XY[0]) {
									temp.dir = 'l';
								}
								if (temp.dir === 'l' && temp.movePath[temp.nextPath][0] > XY[0]) {
									temp.dir = 'r';
								}
							}
							temp.XY = XY;
							this.cXY.push([XY[0] + tw/2, XY[1]]);
							if (temp.skill) {
								this.handleSkill(temp.skill, [XY[0] + temp.width/2, XY[1]], temp.bullet, temp.skillFrame);
							}
						} else {
							temp.delay = temp.delay - 1;
						}
					}
				}
			},
			handleSkill: function (skillArr, XY, bullet, skillFrame) {
				var len = skillArr.length,
					i = 0;
				for (i; i < len; i++) {
					if (skillArr[i][1] <= 0) {
						SW.game.skill.handle[skillArr[i][0]](XY, bullet);
						skillArr[i][1] = skillFrame[i];
						//log(skillArr[i][1]);
					} else {
						skillArr[i][1] = skillArr[i][1] - 1;
					}
				}
			},
			'0': {
				hp: 50,
				speed: 1.8,
				img: 'boss1_250x255.png',
				width: 250,
				height: 255,
				bullet: 12,
				score: 100,
				coin: 10,
				boom: 1,
				skill: [['flower-launch-boss', 5500], ['point-shot', 3000]],
				hitRange: [0, 0, 250, 85],
				frames: 3,
				currentFrame: 0,
				preFrameTime: 800
			},
			'1': {
				hp: 100,
				speed: 2.5,
				img: 'boss2_250x255.png',
				width: 250,
				height: 255,
				bullet: 11,
				score: 100,
				coin: 20,
				boom: 1,
				skill: [['four-cannon-boss', 3000], ['point-shot', 5000]],
				hitRange: [0, 0, 250, 85],
				frames: 3,
				currentFrame: 0,
				preFrameTime: 800
			}
		},
		bullet: {
			current: {
				player: {
					'0': [],
					'1': [],
					'2': []
				},
				enemy: [],
				boss: [],
				guard: []
			},
			draw: function () {
				this.player.draw();
				this.enemy.draw();
				this.boss.draw();
				this.guard.draw();
			},
			player: {
				draw: function () {
					if (SW.game.player.current.createBullet) {
						this.create();
					}
					var c = SW.game.player.current,
						b = c.avator.bullet,
						ctx = SW.game.ctx,
						cfg = SW.game.config,
						h = SW.game.canvas.height,
						w = SW.game.canvas.width,
						needClear = [false, 0];
						img = null;
					if (b[0] === 0) {
						var data = SW.game.bullet.current.player[0],
							len = data.length,
							temp = null,
							i = 0;
						if (len > 0) {
							for (i; i < len; i++) {
								temp = data[i];
								if (temp) {
									img = new Image();
									var rad = 0,
										delay = temp.delay,
										x = temp.XY[0],
										y = temp.XY[1];
									if (delay === 0) {
										rad = temp.rotate * Math.PI/180;
										img.src = SW.game.imgPath + temp.img;
										ctx.setTransform(1, 0, 0, 1, 0, 0);
										ctx.translate(x + temp.width/2, y + temp.height);
										ctx.rotate(Math.PI/2 + rad);
										ctx.drawImage(img, 0, 0);
										y = y + temp.speed * Math.sin(rad);
										x = x + temp.speed * Math.cos(rad);
										if (x < 0 - temp.width || x > w + temp.width || y > h + temp.height) {
											data[i] = undefined;
											needClear = [true, 0];
										} else {
											temp.XY = [x, y];
										}
									} else {
										temp.delay = delay - 1;
									}
								}
							}
						}
					}
					if (b[0] === 1) {
						var data = SW.game.bullet.current.player[1];
						if (data.length > 0) {
							var temp = data[0],
								dw = temp.width,
								dh = temp.height,
								lv = b[1],
								imgWH = temp.imgWH,
								startW = imgWH[0]/2 - dw / 2,
								x = temp.XY[0],
								y = temp.XY[1];
							img = new Image();
							img.src = SW.game.imgPath + temp.img;
							ctx.setTransform(1, 0, 0, 1, 0, 0);
							ctx.drawImage(img, startW , lv * dh, dw, dh, x, y, dw, dh);
							y = y + temp.speed;
							if (y > h + temp.height) {
								SW.game.bullet.current.player[1] = [];							
							} else {
								temp.XY = [x, y];
							}
						}
					}
					if (b[0] === 2) {
						var data = SW.game.bullet.current.player[2],
							len = data.length,
							temp = null,
							i = 0;
						if (len > 0) {
							for (i; i < len; i++) {
								temp = data[i];
								if (temp) {
									if (temp.traceDelay === 0) {
										img = new Image();
										var rad = 0,
											min = {},
											eXY = SW.game.enemy.cXY,
											bXY = SW.game.boss.cXY,
											eIdx = 0,
											eLen = eXY.length,
											bIdx = 0,
											bLen = bXY.length,
											lon = 0,
											tw = temp.width,
											th = temp.height,
											x = temp.XY[0],
											y = temp.XY[1];
										if (eXY.length > 0) {
											for (eIdx; eIdx < eLen; eIdx++) {
												if (min.lon) {
													lon = Math.pow(eXY[eIdx][0] - x, 2) + Math.pow(eXY[eIdx][1] - y, 2);
													if (lon < min.lon) {
														min = {
															lon: lon,
															XY: eXY[eIdx]
														}
													}
												} else {
													min = {
														lon: Math.pow(eXY[0][0] - x, 2) + Math.pow(eXY[0][1] - y, 2),
														XY: eXY[0]
													}
												}
											}
										}									
										if (bXY.length > 0) {
											for (bIdx; bIdx < bLen; bIdx++) {
												if (min.lon) {
													lon = Math.pow(bXY[bIdx][0] - x, 2) + Math.pow(bXY[bIdx][1] - y, 2);
													if (lon < min.lon) {
														min = {
															lon: lon,
															XY: bXY[bIdx]
														}
													}
												} else {
													min = {
														lon: Math.pow(bXY[0][0] - x, 2) + Math.pow(bXY[0][1] - y, 2),
														XY: bXY[0]
													}
												}
											}
										}
										//log(min.XY);
										if (bLen || eLen) {
											var minRad = Math.PI/30,
												dx = min.XY[0] - x,
												dy = min.XY[1] - y,
												tRad = temp.rad,
												cRad = tRad % (2 * Math.PI);
											rad = Math.PI/2 - Math.atan2(dx, dy);
										} else {
											rad = temp.rad;
										}
										if (Math.abs(rad) - Math.abs(tRad) >= minRad) {
											//this method is not enough nice
												rad = tRad - minRad;
												//first
											/*	if (dx > 0 && dy < 0) {
													if (Math.abs(rad - temp.rad) >= minRad) {
														rad = temp.rad + minRad;
													}
												}*/
												//second
											/*	if (dx > 0 && dy > 0) {
													rad = temp.rad + minRad;
												}*/
												//third
											/*	if (dx < 0 && dy > 0) {
													rad = temp.rad - minRad;
												}*/
												//forth
											/*	if (dx < 0 && dy < 0) {
													if (Math.abs(rad - temp.rad) >= minRad) {
														if (cRad <= Math.PI/2) {
															rad = temp.rad - minRad;
														}
													}
												}*/
										}
										img.src = SW.game.imgPath + temp.img;
										ctx.setTransform(1, 0, 0, 1, 0, 0);
										ctx.translate(x + tw/2, y + th);
										ctx.rotate(Math.PI/2 + rad);
										ctx.drawImage(img, 0, 0, tw, th, -tw/2, -th/2, tw, th);
										y = y + temp.speed * Math.sin(rad);
										x = x + temp.speed * Math.cos(rad);
										if (x < 0 - tw || x > w + tw || y > h + th) {
											data[i] = undefined;
											needClear = [true, 2];
										} else {
											temp.XY = [x, y];
											temp.rad = rad;
										}
									} else {
										img = new Image();
										var rad = 0,
											traceDelay = temp.traceDelay,
											tw = temp.width,
											th = temp.height,
											x = temp.XY[0],
											y = temp.XY[1];
										//trace emeny & boss
										rad = temp.rotate * Math.PI/180;
										img.src = SW.game.imgPath + temp.img;
										ctx.setTransform(1, 0, 0, 1, 0, 0);
										ctx.translate(x + tw/2, y + th);
										ctx.rotate(Math.PI/2 + rad);
										ctx.drawImage(img, 0, 0, tw, th, -tw/2, -th/2, tw, th);
										y = y + temp.speed * Math.sin(rad);
										x = x + temp.speed * Math.cos(rad);
										if (x < 0 - tw || x > w + tw || y > h + th) {
											data[i] = undefined;
											needClear = [true, 2];
										} else {
											temp.XY = [x, y];
											temp.rad = rad;
										}
										temp.traceDelay = traceDelay - 1;
									}
								}
							}
						}					
					}
					if (needClear[0]) {
						this.clearPlayerCurrentArr(needClear[1]);
					}
				},
				clearPlayerCurrentArr: function (idx) {
					var arr = SW.game.bullet.current.player[idx],
						temp = {},
						result = [];
					for (temp in arr) {
						if (arr[temp] !== undefined) {
							result.push(arr[temp]);
						}
					}
					SW.game.bullet.current.player[idx] = result;
				},
				create: function (typeIdx) {
					if (SW.game.player.current.status.dead) {return}
					var c = SW.game.player.current,
						b = c.avator.bullet,
						ea = SW.game.equipment.able,
						ga = SW.game.gift.able,
						XY = [c.XY[0] + c.width / 2, c.XY[1] + c.pheight];
					if (typeIdx === undefined) {
						switch (b[0]) {
							case 0:
								arguments.callee(0);
								break;
							case 1:
								arguments.callee(1);
								break;
							case 2:
								arguments.callee(2);
								break;
						};
					}
					if (typeIdx === 0) {
						if (c.bulletCooldown > 0) {return}
						var temp = {},
							lv = b[1] >= (ea.bulletLv ? ea.bulletLv : 0) ? b[1] : ea.bulletLv,
							data = SW.game.bullet[0][lv],
							rotate = data.rotate,
							current = SW.game.bullet.current.player[0],
							len = current.length,
							totleCount = data.totleCount,
							rLen = rotate.length,
							preRotateCount = totleCount / rLen,
							pushNum = totleCount - len,
							delayIdx = 0,
							power = data.power * (1 + (ea.bulletPower ? ea.bulletPower : 0) + (ga.bulletPower ? ga.bulletPower : 0)),
							step = SW.game.config.step,
							speed = data.speed * (1 + (ea.bulletSpeed ? ea.bulletSpeed : 0) + (ga.bulletSpeed ? ga.bulletSpeed : 0)),
							w = data.width,
							h = data.height,
							preFrame = Math.round((h * 2) / speed),
							i = 0,
							delay = 0;
						if (pushNum > lv) {
							temp = {
								img: data.img,
								speed: speed,
								power: power,
								width: w,
								height: h,
								XY: XY,
								rotate: 0,//radians = 30 * Math.PI/180
								delay: 0
							}
							for (i = 0; i < rLen; i++) {
								if (lv >= 1) {
									temp.rotate = rotate[i % rLen];
								} else {
									temp.rotate = 90;
								}
								SW.game.effect.launch.create(0, XY, 0);
								current.push($.extend({}, temp));
							}
							c.bulletCooldown = 5;
						}
					}
					if (typeIdx === 1) {
						var temp = {},
							lv = b[1] >= (ea.bulletLv ? ea.bulletLv : 0) ? b[1] : ea.bulletLv,
							data = SW.game.bullet[1][lv],
							rotate = data.rotate,
							current = SW.game.bullet.current.player[1],
							len = current.length,
							power = data.power * (1 + (ea.bulletPower ? ea.bulletPower : 0) + (ga.bulletPower ? ga.bulletPower : 0)),
							speed = data.speed * (1 + (ea.bulletSpeed ? ea.bulletSpeed : 0) + (ga.bulletSpeed ? ga.bulletSpeed : 0)),
							w = data.width,
							flag = +new Date(),
							h = data.height;
						if (len === 0) {
							var editXY = [XY[0] - w/2, XY[1] - h/2];
							temp = {
								img: data.img,
								speed: speed,
								width: w,
								height: h,
								imgWH: data.imgWH,
								power: power,
								XY: editXY,
								flag: flag,
								rotate: 90
							}
							SW.game.effect.launch.create(1, XY);
							current.push(temp);
						}
					}
					if (typeIdx === 2) {
						var temp = {},
							lv = b[1] >= (ea.bulletLv ? ea.bulletLv : 0) ? b[1] : ea.bulletLv,
							data = SW.game.bullet[2][lv],
							rotate = data.rotate,
							current = SW.game.bullet.current.player[2],
							len = current.length,
							totleCount = rotate.length,
							pushNum = totleCount - len,
							step = SW.game.config.step,
							power = data.power * (1 + (ea.bulletPower ? ea.bulletPower : 0) + (ga.bulletPower ? ga.bulletPower : 0)),
							speed = data.speed * (1 + (ea.bulletSpeed ? ea.bulletSpeed : 0) + (ga.bulletSpeed ? ga.bulletSpeed : 0)),
							w = data.width,
							h = data.height,
							preFrame = Math.round((h * 2) / speed),
							i = 0,
							traceDelay = Math.round((60 / speed)),
							editXY = [XY[0] - w/2, XY[1] - h/2];
						if (pushNum > 0) {
							temp = {
								img: data.img,
								speed: speed,
								width: w,
								height: h,
								power: power,
								XY: editXY,
								rotate: 0,//radians = 30 * Math.PI/180
								delay: 0
							}
							for (i = 0; i < pushNum; i++) {
								if (pushNum > 1) {
									temp.rotate = rotate[i];
								} else {
									temp.rotate = 90;
								}
								temp.traceDelay = traceDelay;
								SW.game.effect.launch.create(2, XY);
								current.push($.extend({}, temp));
							}
						}
					}
				}
			},
			enemy: {
				draw: function () {
					var cb = SW.game.bullet.current.enemy,
						len = cb.length,
						i = 0,
						ctx = SW.game.ctx,
						w = SW.game.canvas.width,
						needClear = false,
						img = null,
						temp = null;
					for (i; i < len; i++) {
						temp = cb[i];
						if (temp) {
							img = new Image();
							var rad = 0,
								delay = 0,
								x = temp.XY[0],
								y = temp.XY[1];
							delay = temp.delay || 0;
							if (delay === 0) {
								if (!temp.type || temp.type !== 'point-shot') {
									rad = temp.rotate * Math.PI/180;
								} else {
									if (temp.trackPosOk) {
										rad = temp.trackRad;
									} else {
										rad = Math.atan2(temp.trackXY[0] - temp.XY[0], temp.trackXY[1] - temp.XY[1]) - Math.PI/2;
										temp.trackPosOk = true;
										temp.trackRad = rad;
									}
								}
								img.src = SW.game.imgPath + temp.img;
								ctx.setTransform(1, 0, 0, 1, 0, 0);
								ctx.translate(x + temp.width, y + temp.height);
								ctx.rotate(Math.PI/2 + rad);
								ctx.drawImage(img, 0, 0);
								y = y - temp.speed * Math.sin(rad);
								x = x + temp.speed * Math.cos(rad);
								if (x < 0 - temp.width || x > w + temp.width || y < 0 - temp.height) {
									cb[i] = undefined;
									needClear = true;
								} else {
									temp.XY = [x, y];
								}
							} else {
								temp.delay = delay - 1;
							}
						}
					}
					if (needClear) {
						this.clearEnemyCurrentArr();
					}
				},
				clearEnemyCurrentArr: function () {
					var arr = SW.game.bullet.current.enemy,
						temp = {},
						result = [];
					for (temp in arr) {
						if (arr[temp] !== undefined) {
							result.push(arr[temp]);
						}
					}
					SW.game.bullet.current.enemy = result;
				}
			},
			boss: {
				draw: function () {
					var cb = SW.game.bullet.current.boss,
						len = cb.length,
						i = 0,
						ctx = SW.game.ctx,
						w = SW.game.canvas.width,
						needClear = false,
						img = null,
						temp = null;
					for (i; i < len; i++) {
						temp = cb[i];
						if (temp) {
							img = new Image();
							var rad = 0,
								delay = 0,
								x = temp.XY[0],
								y = temp.XY[1];
							delay = temp.delay || 0;
							if (delay === 0) {
								if (temp.needRegulate) {
									var bossXY = SW.game.boss.cXY,
										bXYLen = bossXY.length;
									if (bXYLen === 1) {
										bossXY = bossXY[0];
										x = bossXY[0];
										y = bossXY[1];
									}
									temp.needRegulate = false;
								}
								if (!temp.type || temp.type !== 'point-shot') {
									rad = temp.rotate * Math.PI/180;
								} else {
									if (temp.trackPosOk) {
										rad = temp.trackRad;
									} else {
										rad = Math.atan2(temp.trackXY[0] - temp.XY[0], temp.trackXY[1] - temp.XY[1]) - Math.PI/2;
										temp.trackPosOk = true;
										temp.trackRad = rad;
									}
								}
								img.src = SW.game.imgPath + temp.img;
								ctx.setTransform(1, 0, 0, 1, 0, 0);
								ctx.translate(x + temp.width, y + temp.height);
								ctx.rotate(Math.PI/2 + rad);
								ctx.drawImage(img, 0, 0);
								y = y - temp.speed * Math.sin(rad);
								x = x + temp.speed * Math.cos(rad);
								if (x < 0 - temp.width || x > w + temp.width || y < 0 - temp.height) {
									cb[i] = undefined;
									needClear = true;
								} else {
									temp.XY = [x, y];
								}
							} else {
								temp.delay = delay - 1;
							}
						}
					}
					if (needClear) {
						this.clearBossCurrentArr();
					}
				},
				clearBossCurrentArr: function () {
					var arr = SW.game.bullet.current.boss,
						temp = {},
						result = [];
					for (temp in arr) {
						if (arr[temp] !== undefined) {
							result.push(arr[temp]);
						}
					}
					SW.game.bullet.current.boss = result;
				}
			},
			guard: {
				draw: function () {
					var cg = SW.game.bullet.current.guard,
						len = cg.length,
						i = 0,
						ctx = SW.game.ctx,
						w = SW.game.canvas.width,
						needClear = false,
						img = null,
						temp = null;
					for (i; i < len; i++) {
						temp = cg[i];
						if (temp) {
							img = new Image();
							var rad = 0,
								delay = 0,
								x = temp.XY[0],
								y = temp.XY[1];
							delay = temp.delay || 0;
							if (delay === 0) {
								if (temp.trackPosOk) {
									rad = temp.trackRad;
								} else {
									var d = null;
									if (SW.game.enemy.cXY.length > 0) {
										d = SW.game.enemy.cXY[0];
									} else if (SW.game.boss.cXY.length > 0) {
										d = SW.game.boss.cXY[0];
									} else {return;}
									temp.trackXY = [d[0] + 10, d[1] + 10];
									rad = Math.atan2(temp.trackXY[0] - temp.XY[0], temp.trackXY[1] - temp.XY[1]) - Math.PI/2;
									temp.trackPosOk = true;
									temp.trackRad = rad;
								}
								img.src = SW.game.imgPath + temp.img;
								ctx.setTransform(1, 0, 0, 1, 0, 0);
								ctx.translate(x, y);
								ctx.rotate(Math.PI*3/2 - rad);
								ctx.drawImage(img,  -1 * temp.width/2, 0);
								y = y - temp.speed * Math.sin(rad);
								x = x + temp.speed * Math.cos(rad);
								if (x < 0 - temp.width || x > w + temp.width || y < 0 - temp.height) {
									cg[i] = undefined;
									needClear = true;
								} else {
									temp.XY = [x, y];
								}
							} else {
								temp.delay = delay - 1;
							}
						}
					}
					if (needClear) {
						this.clearGuardCurrentArr();
					}
				},
				clearGuardCurrentArr: function () {
					var arr = SW.game.bullet.current.guard,
						temp = {},
						result = [];
					for (temp in arr) {
						if (arr[temp] !== undefined) {
							result.push(arr[temp]);
						}
					}
					SW.game.bullet.current.guard = result;
				}
			},
			'0': {
				'0': {
					img: 'bullet0_5x5.png',
					speed: 7,
					width: 5,
					height: 5,
					power: 1,
					rotate: [90],//radians = 30 * Math.PI/180
					totleCount: 3,
					launch: 0
				},
				'1': {
					img: 'bullet0_5x5.png',
					speed: 7,
					width: 5,
					height: 5,
					power: 1,
					rotate: [70, 115],//radians = 30 * Math.PI/180
					totleCount: 6
				},
				'2': {
					img: 'bullet0_5x5.png',
					speed: 7,
					width: 5,
					height: 5,
					power: 1,
					rotate: [90, 45, 135],//radians = 30 * Math.PI/180
					totleCount: 9
				},
				'3': {
					img: 'bullet0_5x5.png',
					speed: 7,
					width: 5,
					height: 5,
					power: 1,
					rotate: [73, 20, 106, 160],//radians = 30 * Math.PI/180
					totleCount: 12
				},
				'4': {
					img: 'bullet0_5x5.png',
					speed: 7,
					width: 5,
					height: 5,
					power: 1,
					rotate: [90, 50, 130, 10, 170],//radians = 30 * Math.PI/180
					totleCount: 15
				}
			},
			'1': {
				'0': {
					img: 'bullet1_100x50.png',
					speed: 10,
					imgWH: [100, 50],
					width: 50,
					height: 10,
					power: 3,
					rotate: 90
				},
				'1': {
					img: 'bullet1_100x50.png',
					speed: 10,
					imgWH: [100, 50],
					width: 60,
					height: 10,
					power: 4,
					rotate: 90
				},
				'2': {
					img: 'bullet1_100x50.png',
					speed: 10,
					imgWH: [100, 50],
					width: 70,
					height: 10,
					power: 5,
					rotate: 90
				},
				'3': {
					img: 'bullet1_100x50.png',
					speed: 9,
					imgWH: [100, 50],
					width: 80,
					height: 10,
					power: 6,
					rotate: 90
				},
				'4': {
					img: 'bullet1_100x50.png',
					speed: 8,
					imgWH: [100, 50],
					width: 100,
					height: 10,
					power: 7,
					rotate: 90
				},
			},
			'2': {
				'0': {
					img: 'bullet2_30x30.png',
					speed: 5,
					width: 30,
					height: 30,
					power: 1,
					rotate: [90]
				},
				'1': {
					img: 'bullet2_30x30.png',
					speed: 5,
					width: 30,
					height: 30,
					power: 1,
					rotate: [70, 115]
				},
				'2': {
					img: 'bullet2_30x30.png',
					speed: 5,
					width: 30,
					height: 30,
					power: 1,
					rotate: [90, 55, 125]
				},
				'3': {
					img: 'bullet2_30x30.png',
					speed: 5,
					width: 30,
					height: 30,
					power: 1,
					rotate: [73, 40, 106, 140]
				},
				'4': {
					img: 'bullet2_30x30.png',
					speed: 5,
					width: 30,
					height: 30,
					power: 1,
					rotate: [90, 55, 125, 20, 160]
				}
			},
			'10': {
				img: 'b0_20x20.png',
				speed: 3,
				width: 20,
				height: 20,
				power: 1
			},
			'11': {
				img: 'b1_20x20.png',
				speed: 5,
				width: 20,
				height: 20,
				power: 1
			},
			'12': {
				img: 'b2_20x20.png',
				speed: 4,
				width: 20,
				height: 20,
				power: 1
			},
			'100': {
				img: 'bullet100_2x10.jpg',
				speed: 25,
				width: 2,
				height: 10,
				hitRange: [0, 0, 2, 5],
				power: 0.1
			}
		},
		effect: {
			launch: {
				create: function (idx, xy, delay) {
					var temp = {},
						data = this[idx],
						preFrameTime = Math.round(data.preFrameTime / SW.game.config.step);
					temp = {
						img: data.img,
						width: data.width,
						height: data.height,
						XY: xy,
						frames: data.frames,
						currentFrame: data.currentFrame,
						preFrameTime: preFrameTime,
						currentFrameTime: 0,
						delay: delay ? delay : 0
					}
					SW.game.effect.current.push(temp);
				},
				'0': {
					img: 'launch0_5x5.png',
					width: 5,
					height: 5,
					frames: 1,
					currentFrame: 0,
					preFrameTime: 100
				},
				'1': {
					img: 'launch1_40x10.png',
					width: 40,
					height: 10,
					frames: 1,
					currentFrame: 0,
					preFrameTime: 100
				},
				'2': {
					img: 'launch2_20x20.png',
					width: 20,
					height: 20,
					frames: 1,
					currentFrame: 0,
					preFrameTime: 100
				},
				'100': {
					img: 'launch100_6x5.png',
					width: 6,
					height: 5,
					frames: 1,
					currentFrame: 0,
					preFrameTime: 100
				}
			},
			boom: {
				create: function (idx, xy, delay) {
					var temp = {},
						data = this[idx],
						preFrameTime = Math.round(data.preFrameTime / SW.game.config.step);
					temp = {
						img: data.img,
						width: data.width,
						height: data.height,
						XY: xy,
						frames: data.frames,
						currentFrame: data.currentFrame,
						preFrameTime: preFrameTime,
						currentFrameTime: 0,
						delay: delay ? delay : 0
					}
					SW.game.effect.current.push(temp);
				},
				'0': {
					img: 'boom1_40x40.png',
					width: 40,
					height: 40,
					frames: 2,
					currentFrame: 0,
					preFrameTime: 50
				},
				'1': {
					img: 'boom2_100x400.png',
					width: 100,
					height: 400,
					frames: 4,
					currentFrame: 0,
					preFrameTime: 50
				}
			},
			harmed: {
				create: function (idx, xy, delay) {
					var temp = {},
						data = this[idx],
						preFrameTime = Math.round(data.preFrameTime / SW.game.config.step);
					temp = {
						img: data.img,
						width: data.width,
						height: data.height,
						pheight: data.pheight,
						XY: [xy[0], xy[1] - data.pheight/2],
						frames: data.frames,
						currentFrame: data.currentFrame,
						preFrameTime: preFrameTime,
						currentFrameTime: 0,
						delay: delay ? delay : 0
					}
					SW.game.effect.current.push(temp);
				},
				'0': {
					img: 'attacked1_53x120.png',
					width: 53,
					height: 120,
					pheight: 30,
					pos: [0, 0],
					frames: 4,
					currentFrame: 0,
					preFrameTime: 100
				}
			},
			current: [],
			draw: function () {
				var c = this.current,
					l = c.length,
					temp = null,
					needClear = false,
					i = 0;
				if (l <= 0) {return false;}
				for (i; i < l; i++) {
					temp = c[i];
					if (temp) {
						var img = null,
							delay = temp.delay;
						if (delay === 0) {
							img = new Image();
							img.src = SW.game.imgPath + temp.img;
							var tw = temp.width,
								frames = temp.frames || 0,
								preFrameTime = temp.preFrameTime,
								currentFrameTime = temp.currentFrameTime,
								th = temp.height / frames,
								x = temp.XY[0],
								y = temp.XY[1],
								currentFrame = temp.currentFrame || 0,
								pFrame = frames > 1 ? currentFrame : 0;
								ctx = SW.game.ctx;
							ctx.setTransform(1, 0, 0, 1, 0, 0);
							ctx.drawImage(img, 0 , pFrame * th, tw, th, x - tw/2, y - th/2, tw, th);
							temp.currentFrameTime = currentFrameTime + 1;
							if (currentFrameTime >= preFrameTime) {
								temp.currentFrame = currentFrame + 1;
								temp.currentFrameTime = 0;
							}
							if (frames === temp.currentFrame) {
								c[i] = undefined;
								needClear = true;
							}
						} else {
							temp.delay = delay - 1;
						}
					}
				}
				if (needClear) {
					this.clearEffectCurrentArr();
				}
			},
			clearEffectCurrentArr: function () {
				var arr = this.current,
					temp = {},
					result = [];
				for (temp in arr) {
					if (arr[temp] !== undefined) {
						result.push(arr[temp]);
					}
				}
				this.current = result;
			}
		},
		gift: {
			getGift: function (type) {
				if (type === 'egg') {
					this.selectList.show();
				} else if (type === 'p') {
					this.setAble['power-num']();
				}
			},
			selectList: {
				show: function () {
					SW.game.stage.stop();
					var giftArr = this.getGiftArr(),
						giftSelectBox = SW.game.giftSelectBox;
					if (giftArr.length > 0) {
						var len = giftArr.length,
							i = 0,
							html = [],
							tempGift = null,
							tempHtml = [],
							selectCount = 0;
						for (i; i < len; i++) {
							tempGift = SW.game.gift[giftArr[i]];
							tempHtml = [
								'<li class="' + tempGift.cla + '">',
									'<div class="img"></div>',
									'<p class="name"><span>' + tempGift.name + '</span>' + (tempGift.max ? ('<strong><em>' + (tempGift.selectCount ? (tempGift.max - tempGift.selectCount) : tempGift.max)  + '</em>/' + tempGift.max + '</strong>') : '') + '</p>',
									'<p class="desc">' + tempGift.desc + '</p>',
								'</li>'
							].join('');
							html.push(tempHtml);
						}
						giftSelectBox.html(html.join(''));
						SW.UI.dialog.open('.gift-select-box');
						SW.game.config.isSelectGifting = true;
						giftSelectBox.find('li').animate({
							top: 0,
							opacity: 100
						}, 300);
					}
				},
				getGiftArr: function () {
					var data1 = SW.game.gift.awordArr,
						data2 = SW.game.gift.exchangeArr,
						arr = [],
						t = [];
					arr[0] = this.selectArr(data2, 1);
					t = this.selectArr(data1, 2);
					arr[1] = t[0];
					arr[2] = t[1];
					return arr;
				},
				selectArr: function (arr, num) {
					var len = arr.length,
						temp = [],
						result = [],
						i = 0;
					for (i; i < len; i++) {
						if (SW.game.gift[arr[i]].max === undefined || !SW.game.gift[arr[i]].unshow) {
							temp.push(arr[i]);
						}
					}
					var tlen = temp.length,
						r = SW.game.createRandomNum([1, tlen]);
					i = 0;
					for (i; i < num; i++) {
						if (i !== 0) {
							result[i] = temp[(r * i) % tlen];
						} else {
							result[i] = temp[SW.game.createRandomNum(r - 1)];
						}
					}
					return result;
				},
				select: function (jEle) {//依据jEle获取当前选择的gift
					var giftSelectBox = SW.game.giftSelectBox;
					giftSelectBox.find('li').animate({
						top: -50,
						opacity: 0
					}, 300);
					setTimeout(function () {
						SW.UI.dialog.close('.gift-select-box');
						SW.game.config.isSelectGifting = false;
						SW.game.stage.goOn();
						SW.game.gift.handleGift(jEle.attr('class'));
					}, 300);
				}
			},
			current: [],
			create: function (XY, type, frame) {
				var data = this[type],
					step = SW.game.config.step,
					temp = {};
					frame = frame || 0;
				temp = {
					img: data.img,
					type: type,
					width: data.width,
					height: data.height,
					speed: data.speed,
					XY: XY,
					hitRange: data.hitRange,
					onLevelTime: Math.ceil(data.onLevelTime / step),
					alertTime: Math.ceil(data.alertTime / step),
					alertPreTime: Math.ceil(data.alertPreTime / step),
					currentAlertTime: 0,
					rad: Math.PI/2,
					isHide: false,
					delay: frame
				};
				this.current.push(temp);
			},
			draw: function () {
				var c = this.current,
					l = c.length,
					temp = null,
					needClear = false,
					i = 0;
				if (l <= 0) {return false;}
				for (i; i < l; i++) {
					temp = c[i];
					if (temp) {
						if (!temp.delay) {
							var img = null,
							img = new Image();
							img.src = SW.game.imgPath + temp.img;
							var tw = temp.width,
								th = temp.height,
								seaLevel = SW.game.config.seaLevel,
								x = temp.XY[0],
								y = temp.XY[1],
								rad = temp.rad,
								onLevelTime = temp.onLevelTime,
								alertTime = temp.alertTime,
								alertPreTime = temp.alertPreTime,
								currentAlertTime = temp.currentAlertTime,
								isHide = temp.isHide,
								ctx = SW.game.ctx;
							ctx.setTransform(1, 0, 0, 1, 0, 0);
							if (!isHide) {
								ctx.drawImage(img, 0, 0, tw, th, x - tw/2, y, tw, th);
							}
							rad = rad + Math.PI/60;
							if (y - temp.speed > seaLevel - th/2) {
								y = y - temp.speed/2;
							} else {
								y = seaLevel - th/2;
								temp.isOnLevel = true;
							}
							x = x + temp.speed * Math.cos(rad);
							temp.rad = rad;
							temp.XY = [x, y];
							if (temp.isOnLevel) {
								if (onLevelTime > 0) {
									if (alertTime > 0) {
										temp.alertTime = alertTime - 1;
									} else {
										if (currentAlertTime >= alertPreTime) {
											temp.isHide = !isHide;
											temp.currentAlertTime = 0;
										} else {
											temp.currentAlertTime = currentAlertTime + 1;
										}
									}
									temp.onLevelTime = onLevelTime - 1;
								} else {
									c[i] = undefined;
									needClear = true;
								}
							}
						} else {
							temp.delay = temp.delay - 1;
						}
					}
				}
				if (needClear) {
					this.clearGiftCurrentArr();
				}
			},
			clearGiftCurrentArr: function () {
				var arr = this.current,
					l = arr.length,
					i = 0,
					result = [];
				for (i; i < l; i++) {
					if (arr[i] !== undefined) {
						result.push(arr[i]);
					}
				}
				this.current = result;
			},
			egg: {
				img: 'egg_30x30.png',
				type: 'egg',
				width: 30,
				height: 30,
				speed: 1,
				hitRange: [0, 0, 30, 30],
				onLevelTime: 5000,//浮上水面后剩余多少时间后消失
				alertTime: 2500,//浮上水面后多少时间后闪烁以提示将要消失
				alertPreTime: 100//闪烁间隔
			},
			p: {
				img: 'p_10x20.png',
				type: 'p',
				width: 10,
				height: 20,
				speed: 1,
				hitRange: [0, 0, 10, 20],
				onLevelTime: 5000,//浮上水面后剩余多少时间后消失
				alertTime: 2500,//浮上水面后多少时间后闪烁以提示将要消失
				alertPreTime: 100
			},
			handleGift: function (type) {
				switch (type) {
					case 'bullet-1': 
						SW.game.player.exchangeBullet(0);
						break;
					case 'bullet-2': 
						SW.game.player.exchangeBullet(1);
						break;
					case 'bullet-3': 
						SW.game.player.exchangeBullet(2);
						break;
					default:
						SW.game.gift.setAble[type]();
						break;
				}
			},
			able: {
				speed: 0,
				bulletPower: 0,
				bulletSpeed: 0,
				maxHp: 0,
				maxPower: 0,
				powerPower: 0,
			},
			setAble: {
				'speed': function () {
					var obj = SW.game.gift['speed'],
						v = obj.value,
						speed = 0;
					if (SW.game.gift.able.speed) {
						speed = SW.game.gift.able.speed;
					} else {
						SW.game.gift.able.speed = 0;
					}
					SW.game.gift.able.speed = speed + v;
					this.setSelectCount(obj);
				},
				'bullet-power': function () {
					var obj = SW.game.gift['bullet-power'],
						v = obj.value,
						bp = 0;
					if (SW.game.gift.able.bulletPower) {
						bp = SW.game.gift.able.bulletPower;
					} else {
						SW.game.gift.able.bulletPower = 0;
					}
					SW.game.gift.able.bulletPower = bp + v;
					this.setSelectCount(obj);
				},
				'bullet-lv': function () {
					var obj = SW.game.gift['bullet-lv'],
						bInfo = SW.game.player.current.avator.bullet;
					if (bInfo[1] < 4) {
						SW.game.player.current.avator.bullet = [bInfo[0], bInfo[1] + 1];
					}
					this.setSelectCount(obj);
				},
				'bullet-speed': function () {
					var obj = SW.game.gift['bullet-speed'],
						v = obj.value,
						bs = 0;
					if (SW.game.gift.able.bulletSpeed) {
						bs = SW.game.gift.able.bulletSpeed;
					} else {
						SW.game.gift.able.bulletSpeed = 0;
					}
					SW.game.gift.able.bulletSpeed = bs + v;
					this.setSelectCount(obj);
				},
				'max-hp': function () {
					var obj = SW.game.gift['max-hp'],
						v = obj.value,
						mh = 0;
					if (SW.game.gift.able.maxHp) {
						mh = SW.game.gift.able.maxHp;
					} else {
						SW.game.gift.able.maxHp = 0;
					}
					SW.game.gift.able.maxHp = mh + v;
					SW.game.panel.updateHp();
					this.setSelectCount(obj);
				},
				'hp': function () {
					var obj = SW.game.gift['hp'],
						v = obj.value,
						hp = SW.game.player.current.hp + v,
						pMax = SW.game.player.current.maxHp || 0,
						eMax = SW.game.equipment.able.maxHp || 0,
						gMax = SW.game.gift.able.maxHp || 0,
						max = pMax + eMax + gMax;
					SW.game.player.current.hp = hp <= max ? hp : max;
					SW.game.panel.updateHp();
					this.setSelectCount(obj);
				},
				'max-power': function () {
					var obj = SW.game.gift['max-power'],
						v = obj.value,
						mp = 0;
					if (SW.game.gift.able.maxPower) {
						mp = SW.game.gift.able.maxPower;
					} else {
						SW.game.gift.able.maxPower = 0;
					}
					SW.game.gift.able.maxPower = mp + v;
					SW.game.panel.updatePower();
					this.setSelectCount(obj);
				},
				'power-num': function () {
					var obj = SW.game.gift['power-num'],
						v = obj.value,
						power = SW.game.player.current.power.count,
						pMax = SW.game.player.current.maxPower || 0,
						eMax = SW.game.equipment.able.maxPower || 0,
						gMax = SW.game.gift.able.maxPower || 0,
						max = pMax + eMax + gMax;
					SW.game.player.current.power.count = (power + v) <= max ? (power + v) : max;
					SW.game.panel.updatePower();
					this.setSelectCount(obj);
				},
				'power-up': function () {
					var obj = SW.game.gift['power-up'],
						v = obj.value,
						pp = 0;
					if (SW.game.gift.able.powerPower) {
						pp = SW.game.gift.able.powerPower;
					} else {
						SW.game.gift.able.powerPower = 0;
					}
					SW.game.gift.able.powerPower = pp + v;
					this.setSelectCount(obj);
				},
				setSelectCount: function (obj) {
					if (obj.selectCount !== undefined) {
						obj.selectCount = obj.selectCount + 1;
						if (obj.max && obj.selectCount === obj.max) {
							obj.unshow = true;
						}
					} else {
						obj.selectCount = 1;
					}
				}
			},
			awordArr: ['speed', 'bullet-power', 'bullet-lv', 'bullet-speed', 'max-hp', 'hp', 'max-power', 'power-up'],
			exchangeArr: ['bullet-1', 'bullet-2', 'bullet-3'],
			'bullet-1': {
				value: 0,
				desc: '玩家子弹装备更换为1号弹。如果当前是1号弹，玩家的子弹将会升级，最高5级',
				name: '1号弹',
				cla: 'bullet-1'
			},
			'bullet-2': {
				value: 0,
				desc: '玩家子弹装备更换为2号弹。如果当前是2号弹，玩家的子弹将会升级，最高5级',
				name: '2号弹',
				cla: 'bullet-2'
			},
			'bullet-3': {
				value: 0,
				desc: '玩家子弹装备更换为3号弹。如果当前是3号弹，玩家的子弹将会升级，最高5级',
				name: '3号弹',
				cla: 'bullet-3'
			},
			'speed': {
				value: 0.1,
				desc: '齿轮就要不停的转动。玩家的速度增加10%',
				name: '加速齿轮',
				cla: 'speed',
				max: 20//最多20次
			},
			'bullet-power': {
				value: 0.1,//10%
				desc: '玩家子弹威力增加10%',
				name: '火力增幅装置',
				cla: 'bullet-power',
				max: 50
			},
			'bullet-lv': {
				value: 1,
				desc: '玩家装备的子弹等级+1，子弹最高5级',
				name: '武器升级',
				cla: 'bullet-lv'
			},
			'bullet-speed': {
				value: 0.1,
				desc: '玩家子弹速度增加10%',
				name: '燃料研究',
				cla: 'bullet-speed',
				max: 50
			},
			'max-hp': {
				value: 1,
				desc: '玩家生命值上限加1',
				name: '合金装甲',
				cla: 'max-hp',
				max: 10
			},
			'max-power': {
				value: 1,
				desc: '玩家装载的POWER上限加1',
				name: '格纳库扩容',
				cla: 'max-power',
				max: 5
			},
			'hp': {
				value: 2,
				desc: '雇佣机械修理组，为你补满生命值',
				name: '机械修理组',
				cla: 'hp'
			},
			'power-num': {
				value: 1,
				desc: '立刻获得一个power',
				name: 'POWER',
				cla: 'power-num'
			},
			'power-up': {
				value: 0.1,
				desc: 'POWER威力增加10%',
				name: 'POWER增幅装置',
				cla: 'power-up',
				max: 20
			}
		},
		shop: {
			getEle: function () {
				this.jShop = $('.popup-shop');
				this.jShopList = this.jShop.find('.content .shop .list');
				this.jShopStore = this.jShop.find('.content .store .list');
				this.jCurrentInfo = this.jShop.find('.current-info');
				this.jCloseShopBtn = this.jShop.find('.close-shop');
				this.jSellConfirm = $('.popup-confirm-sell');
				this.jUnequipConfirm = $('.popup-unequip');
				this.jMsg = this.jShop.find('.msg');
				this.msgHideTimer = null;
			},
			showMsg: function (html) {
				var jMsg = this.jMsg;
				clearTimeout(this.msgHideTimer);
				jMsg.css('opacity', 0).html('').animate({
					opacity: 1
				}, 300, function () {
					jMsg.html(html);
				});
				this.msgHideTimer = setTimeout(function () {
					jMsg.animate({
						opacity: 0
					}, 300, function () {
						jMsg.html('').css('opacity', 1);
					});
				}, 5000);
			},
			open: function () {
				SW.game.stage.stop();
				this.updateEquipment();
				this.updateCoinPart();
				SW.UI.dialog.open('.popup-shop');
				SW.game.config.isShopOpening = true;
			},
			close: function () {
				SW.UI.dialog.close('.popup-shop');
				SW.game.config.isShopOpening = false;
				SW.game.stage.goOn();
			},
			buy: function (idx, cate) {
				var good = SW.game[cate][idx],
					coin = good.shop.cost.coin,
					part = good.shop.cost.part,
					playerCoin = SW.game.player.coin,
					playerPart = SW.game.player.part;
				if (coin && playerCoin >= coin) {
					SW.game.player.coin = playerCoin - coin;
					SW.game.player.store[cate].push(idx);
					this.businessSuccess();
					this.showMsg('购买成功，请在仓库中查看或装备');
					return;
				}
				if (part && playerPart >= part) {
					SW.game.player.part = playerPart - part;
					SW.game.player.store[cate].push(idx);
					this.businessSuccess();
					this.showMsg('购买成功，请在仓库中查看或装备');
					return;
				}
				this.showMsg('<b class="warn">您没有足够的金币或零件购买该组件</b>');
			},
			sellConfirm: {
				open: function (idx, cate) {
					var cateIdx = SW.game.player.store[cate][idx],
						good = SW.game[cate][cateIdx];
					this.sellIdx = idx;
					this.sellCate = cate;
					SW.game.shop.jSellConfirm.find('strong').text(good.shop.name);
					SW.UI.dialog.open('.popup-confirm-sell');
				},
				close: function () {
					SW.UI.dialog.close('.popup-confirm-sell');
				},
				ok: function () {
					SW.game.shop.sell(this.sellIdx, this.sellCate);
					this.close();
				}
			},
			unequipConfirm: {
				open: function (idx, cate) {
					var cateIdx = 0,
						good = null;
					if (cate === 'equipment') {
						cateIdx = SW.game.player.avator.equipment[idx];
						good = SW.game.equipment[cateIdx];
					} else {
						good = SW.game.ship[idx];
					}
					this.unequipIdx = idx;
					this.unequipCate = cate;
					SW.game.shop.jUnequipConfirm.find('strong').text(good.shop.name);
					SW.UI.dialog.open('.popup-unequip');
				},
				close: function () {
					SW.UI.dialog.close('.popup-unequip');
				},
				ok: function () {
					SW.game.shop.unequip(this.unequipIdx, this.unequipCate);
					this.close();
				}
			},
			unequip: function (idx, cate) {
				//handle equipment
				if (cate === 'equipment') {
					var arr = SW.game.player.avator.equipment,
						eqIdx = arr[idx],
						able = SW.game.equipment[eqIdx].able;
					arr[idx] = undefined;
					SW.game.player.avator.equipment = SW.game.clearArr(arr);
					SW.game.player.store.equipment.push(eqIdx);
					this.unequipSuccess();
					SW.game.equipment.disAble[able]();
					this.showMsg('组件卸载成功，已经放入仓库中');
				}
				//handle ship
				if (cate === 'ship') {
					if (idx !== 0) {
						SW.game.ship.exchange(0);
						SW.game.player.store.ship.push(+idx);
						this.unequipSuccess();
						this.showMsg('船体卸载成功，已经放入仓库中。<b class="warn">您现在使用的是最基础的船体</b>');
					} else {
						this.showMsg('<b class="warn">已经没有可卸载船体</b>');
					}
				}
			},
			equip: function (idx, cate) {
				if (cate === 'equipment') {
					var arr = SW.game.player.avator.equipment,
						storeArr = SW.game.player.store.equipment,
						eqIdx = storeArr[idx],
						able = SW.game.equipment[eqIdx].able;
					if (SW.game.player.current.maxEqLen > arr.length) {
						storeArr[idx] = undefined;
						SW.game.player.store.equipment = SW.game.clearArr(storeArr);
						SW.game.player.avator.equipment.push(eqIdx);
						this.equipSuccess();
						SW.game.equipment.setAble[able]();
						this.showMsg('组件装备成功');
						
						var i = 0,
							equipmentArr = SW.game.player.avator.equipment,
							eqLen = equipmentArr.length;
						for (i; i < eqLen; i++) {
							SW.game.equipment.animate(equipmentArr[i]);
							SW.game.equipment.handle(equipmentArr[i]);
						}
					} else {
						this.showMsg('<b class="warn">组件槽已满，请先卸载组件后再装备</b>');
					}
				}
				//handle ship
				if (cate === 'ship') {
					idx = parseInt(idx, 10);
					var ss = SW.game.player.store.ship;
					if (SW.game.player.avator.ship === 0) {
						SW.game.ship.exchange(ss[idx]);
						ss[idx] = undefined;
						SW.game.player.store.ship = SW.game.clearArr(ss);
						this.equipSuccess();
						this.showMsg('船体装备成功。');
					} else {
						this.showMsg('<b class="warn">您已经装备了船体，请先卸载后再装备</b>');
					}
				}
			},
			equipSuccess: function () {
				this.updateStore();
				this.updateEquipment();
				SW.game.panel.updateHp();
				SW.game.panel.updatePower();
			},
			unequipSuccess: function () {
				this.updateStore();
				this.updateEquipment();
				SW.game.panel.updateHp();
				SW.game.panel.updatePower();
			},
			sell: function (idx, cate) {
				var arr = SW.game.player.store[cate],
					cateIdx = arr[idx],
					good = SW.game[cate][cateIdx],
					goodDepreciationRate = SW.game.config.goodDepreciationRate,
					coin = good.shop.cost.coin,
					part = good.shop.cost.part,
					playerCoin = SW.game.player.coin,
					playerPart = SW.game.player.part;
				if (coin) {
					SW.game.player.coin = playerCoin + Math.ceil(coin * goodDepreciationRate);
					arr[idx] = undefined;
					SW.game.player.store[cate] = SW.game.clearArr(arr);
					this.businessSuccess();
					this.showMsg('出售成功');
					return;
				}
				if (part) {
					SW.game.player.part = playerPart + Math.ceil(part * goodDepreciationRate);
					arr[idx] = undefined;
					SW.game.player.store[cate] = SW.game.clearArr(arr);
					this.businessSuccess();
					this.showMsg('出售成功');
					return;
				}
				this.showMsg('<b class="warn">该组件无法出售</b>');
			},
			businessSuccess: function () {
				this.updateCoinPart();
				this.updateStore();
				SW.game.panel.updateCoin();
				SW.game.panel.updatePart();
			},
			updateShop: function () {
				var jShop = this.jShopList,
					eqs = SW.game.equipment,
					ship = SW.game.ship,
					max = 1000,
					i = 0,
					temp = null,
					str = [],
					html = [];
				//show equipment
				for (i; i < max; i++) {
					if (eqs[i]) {
						temp = eqs[i];
						str = [
							'<li data-idx="' + i + '" data-category="equipment" class="' + temp.cla + '">',
								'<div class="img"></div>',
								'<div class="name">' + temp.shop.name + '</div>',
								'<div class="coin">' + (temp.shop.cost.coin ? ('<strong>COIN:</strong><span>' + temp.shop.cost.coin + '</span>') : '') + '</div>',
								'<div class="part">' + (temp.shop.cost.part ? ('<strong>PART:</strong><span>' + temp.shop.cost.part + '</span>') : '') + '</div>',
								'<div class="desc">' + temp.shop.desc + '</div>',
								'<div class="btn-box"><a class="buy">购买</a></div>',
							'</li>'
						];
						html.push(str.join(''));
					} else {
						break;
					}
				}
				jShop.html(html.join(''));
				//show ship
				i = 0;
				html = [];
				for (i; i < max; i++) {
					if (ship[i]) {
						if (i === 0) {continue;}
						temp = ship[i];
						str = [
							'<li data-idx="' + i + '" data-category="ship" class="ship ship-' + i + '">',
								'<div class="img"></div>',
								'<div class="name">' + temp.shop.name + '</div>',
								'<div class="coin">' + (temp.shop.cost.coin ? ('<strong>COIN:</strong><span>' + temp.shop.cost.coin + '</span>') : '') + '</div>',
								'<div class="part">' + (temp.shop.cost.part ? ('<strong>PART:</strong><span>' + temp.shop.cost.part + '</span>') : '') + '</div>',
								'<div class="desc">',
									'<p>' + temp.shop.desc + '</p>',
									'<dl>',
										'<dt>能力:</dt>',
										'<dd>生命:<span class="max-hp">' + temp.maxHp + '</span></dd>',
										'<dd>POWER:<span class="max-power">' + temp.maxPower + '</span></dd>',
										'<dd>组件槽:<span class="max-eqlen">' + temp.maxEqLen + '</span></dd>',
									'</dl>',
								'</div>',
								'<div class="btn-box"><a class="buy">购买</a></div>',
							'</li>'
						];
						html.push(str.join(''));
					} else {
						break;
					}
				}
				jShop.append(html.join(''));
			},
			updateStore: function () {
				var jStore = this.jShopStore,
					storeEquipment = SW.game.player.store.equipment,
					eqLen = storeEquipment.length,
					storeShip = SW.game.player.store.ship,
					shipLen = storeShip.length,
					goodDepreciationRate = SW.game.config.goodDepreciationRate,
					i = 0,
					temp = null,
					str = [],
					html = [];
				//show equipment
				for (i; i < eqLen; i++) {
					temp = SW.game.equipment[storeEquipment[i]];
					str = [
						'<li data-idx="' + i + '" data-category="equipment" class="' + temp.cla + '">',
							'<div class="img"></div>',
							'<div class="name">' + temp.shop.name + '</div>',
							'<div class="coin">' + (temp.shop.cost.coin ? ('<strong>COIN:</strong><span>' + Math.ceil(temp.shop.cost.coin * goodDepreciationRate) + '</span>') : '') + '</div>',
							'<div class="part">' + (temp.shop.cost.part ? ('<strong>PART:</strong><span>' + Math.ceil(temp.shop.cost.part * goodDepreciationRate) + '</span>') : '') + '</div>',
							'<div class="desc">' + temp.shop.desc + '</div>',
							'<div class="btn-box"><a class="equip">装备</a><a class="sell">出售</a></div>',
						'</li>'
					];
					html.push(str.join(''));
				}
				jStore.html(html.join(''));
				//show ship
				i = 0;
				html = [];
				for (i; i < shipLen; i++) {
					temp = SW.game.ship[storeShip[i]];
					str = [
						'<li data-idx="' + i + '" data-category="ship" class="ship ship-' + i + '">',
							'<div class="img"></div>',
							'<div class="name">' + temp.shop.name + '</div>',
							'<div class="coin">' + (temp.shop.cost.coin ? ('<strong>COIN:</strong><span>' + temp.shop.cost.coin/2 + '</span>') : '') + '</div>',
							'<div class="part">' + (temp.shop.cost.part ? ('<strong>PART:</strong><span>' + temp.shop.cost.part/2 + '</span>') : '') + '</div>',
							'<div class="desc">',
								'<p>' + temp.shop.desc + '</p>',
								'<dl>',
									'<dt>能力:</dt>',
									'<dd>生命:<span class="max-hp">' + temp.maxHp + '</span></dd>',
									'<dd>POWER:<span class="max-power">' + temp.maxPower + '</span></dd>',
									'<dd>组件槽:<span class="max-eqlen">' + temp.maxEqLen + '</span></dd>',
								'</dl>',
							'</div>',
							'<div class="btn-box"><a class="equip">装备</a><a class="sell">出售</a></div>',
						'</li>'
					];
					html.push(str.join(''));
				}
				jStore.append(html.join(''));
			},
			updateEquipment: function () {
				var jCurrentInfo = this.jCurrentInfo,
					jEquipment =  jCurrentInfo.find('.equipment'),
					jEqList = jEquipment.find('.eq-list'),
					jShip = jEquipment.find('.ship'),
					pe = SW.game.player.avator.equipment,
					max = SW.game.player.current.maxEqLen,
					ps = SW.game.player.avator.ship,
					len = pe.length,
					i = 0,
					html = [],
					str = '',
					temp = null;
				//show current equipment
				for (i; i < len; i++) {
					temp = SW.game.equipment[pe[i]];
					str = '<li data-idx="' + i + '" data-category="equipment" class="' + temp.cla + '" title="' + temp.shop.desc + '">' + temp.shop.name + '</li>';
					html.push(str);
				}
				len = max - len;
				i = 0;
				for (i; i < len; i++) {
					str = '<li class="empty"></li>';
					html.push(str);
				}
				jEqList.html(html.join(''));
				//show current ship
				str = '';
				temp = SW.game.ship[ps];
				if (ps) {
					str = '<li data-idx="' + ps + '" data-category="ship" class="ship-' + ps + '" title="' + temp.shop.desc + '">' + temp.shop.name + '</li>';
				} else {
					str = '<li class="empty"></li>';
				}
				jShip.html(str);
			},
			updateCoinPart: function () {
				var jCurrentInfo = this.jCurrentInfo,
					jCoin = jCurrentInfo.find('.coin span'),
					jPart = jCurrentInfo.find('.part span'),
					pc = SW.game.player.coin,
					pp = SW.game.player.part;
				jCoin.text(pc);
				jPart.text(pp);
			},
			bind: function () {
				this.jCloseShopBtn.bind('click', function () {
					SW.game.shop.close();
				});
				this.jShopList.find('.btn-box .buy').bind('click', function () {
					var p = $(this).parents('li'),
						idx = p.attr('data-idx'),
						cate = p.attr('data-category');
					SW.game.shop.buy(idx, cate);
				});
				this.jShopStore.find('.btn-box .sell').live('click', function () {
					var p = $(this).parents('li'),
						idx = p.attr('data-idx'),
						cate = p.attr('data-category');
					SW.game.shop.sellConfirm.open(idx, cate);
				});
				this.jSellConfirm.find('.btn-box .ok').bind('click', function () {
					SW.game.shop.sellConfirm.ok();
				});
				this.jSellConfirm.find('.btn-box .cancel').bind('click', function () {
					SW.game.shop.sellConfirm.close();
				});
				this.jCurrentInfo.find('.equipment li').live('click', function () {
					var _this = $(this),
						idx = _this.attr('data-idx'),
						cate = _this.attr('data-category');
					if (!cate) {
						return;
					}
					SW.game.shop.unequipConfirm.open(idx, cate);
				});
				this.jUnequipConfirm.find('.btn-box .ok').bind('click', function () {
					SW.game.shop.unequipConfirm.ok();
				});
				this.jUnequipConfirm.find('.btn-box .cancel').bind('click', function () {
					SW.game.shop.unequipConfirm.close();
				});
				this.jShopStore.find('.btn-box .equip').live('click', function () {
					var p = $(this).parents('li'),
						idx = p.attr('data-idx'),
						cate = p.attr('data-category');
					SW.game.shop.equip(idx, cate);
				});
			},
			ini: function () {
				this.getEle();
				this.updateShop();
				this.updateStore();
				this.bind();
				new SW.UI.carousel($('.popup-shop .shop .list'), {autoFix: false});
				new SW.UI.carousel($('.popup-shop .store .list'));
			}
		},
		equipment: {
			draw: function (equipmentId, currentPosition, dir) {
				var ctx = SW.game.ctx,
					img = new Image(),
					w = SW.game.canvas.width,
					eqInfo = this[equipmentId],
					cf = eqInfo.currentFrame || 0,
					pheight = eqInfo.height / eqInfo.frames,
					c = SW.game.player.current,
					cw = c.width,
					ch = c.pheight,
					hW = eqInfo.width,
					x = 0,
					y = 0,
					that = this;
				img.src = SW.game.imgPath + eqInfo.img;
				if (dir === 'l') {
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					x = currentPosition[0] + eqInfo.pos[0];
					y = currentPosition[1] + ch - pheight + eqInfo.pos[1];
					ctx.drawImage(img, 0 , cf * pheight, hW, pheight, x, y, hW, pheight);
				} else {
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.translate(w, 0);
					ctx.scale(-1, 1);
					x = w - cw - currentPosition[0] + eqInfo.pos[0];
					y = currentPosition[1] + ch - pheight + eqInfo.pos[1];
					ctx.drawImage(img, 0, cf * pheight, hW, pheight, x, y, hW, pheight);
				}
				if (equipmentId == 7 && this.able.guard) {
					var c = this.guard['7'],
						cd = c.cd || 0;
					if (cd > 0) {
						c.cd = cd - 1;
					} else {
						if (SW.game.enemy.cXY.length <= 0 && SW.game.boss.cXY.length <= 0) {
							return;
						} 
						x = dir === 'l' ? (x + hW/2) : (w - x - hW/2);
						y = y + pheight;
						this.guard.shot(7, [x, y]);
						c.cd = c.cooldown;
					}
				}
			},
			guard: {
				shot: function (idx, XY) {
					var arr = SW.game.bullet.current.guard,
						eq = SW.game.equipment[idx],
						b = SW.game.bullet[eq.bullet],
						temp = {};
					temp = {
						img: b.img,
						speed: b.speed,
						width: b.width,
						height: b.height,
						power: b.power,
						XY: [XY[0], XY[1] + b.height/2],
						hitRange: b.hitRange,
						rotate: 90
					};
					arr.push(temp);
					SW.game.effect.launch.create(100, XY, 0);
				},
				'7': {}//use for guard current
			},
			equipmentTimer: [],
			handle: function (idx) {
				var able = this[idx].able;
				this.setAble[able]();
				if (idx == 7) {
					var temp = {},
						step = SW.game.config.step,
						cd = this['7'].cooldown;
					cd = Math.ceil(cd / step);
					temp = {
						XY: [0, 0],
						cooldown: cd,
						cd: 0
					}
					this.guard['7'] = temp;
				}
			},
			able: {
				maxHp: 0,
				canFly: false,
				canDive: false,
				speed: 0,
				guard: false,
				bulletPower: 0,
				bulletSpeed: 0,
				bulletLv: 0,
				maxPower: 0
			},
			setAble: {
				'fly': function () {
					SW.game.equipment.able.canFly = true;
				},
				'dive': function () {
					SW.game.equipment.able.canDive = true;
				},
				'guard': function () {
					SW.game.equipment.able.guard = true;
				},
				'speed-1': function () {
					SW.game.equipment.able.speed = SW.game.equipment.able.speed + 0.1;
				},
				'bullet-harm-1': function () {
					SW.game.equipment.able.bulletPower = SW.game.equipment.able.bulletPower + 0.1;
				},
				'bullet-speed-1': function () {
					SW.game.equipment.able.bulletSpeed = SW.game.equipment.able.bulletSpeed + 0.1;
				},
				'bullet-lv-1': function () {
					SW.game.equipment.able.bulletLv = SW.game.equipment.able.bulletLv + 1;
				},
				'bullet-lv-2': function () {
					SW.game.equipment.able.bulletLv = SW.game.equipment.able.bulletLv + 2;
				}
			},
			disAble: {
				'fly': function () {
					SW.game.equipment.able.canFly = false;
				},
				'dive': function () {
					SW.game.equipment.able.canDive = false;
				},
				'guard': function () {
					SW.game.equipment.able.guard = false;
				},
				'speed-1': function () {
					SW.game.equipment.able.speed = SW.game.equipment.able.speed - 0.1;
				},
				'bullet-harm-1': function () {
					SW.game.equipment.able.bulletPower = SW.game.equipment.able.bulletPower - 0.1;
				},
				'bullet-speed-1': function () {
					SW.game.equipment.able.bulletSpeed = SW.game.equipment.able.bulletSpeed - 0.1;
				},
				'bullet-lv-1': function () {
					SW.game.equipment.able.bulletLv = SW.game.equipment.able.bulletLv - 1;
				},
				'bullet-lv-2': function () {
					SW.game.equipment.able.bulletLv = SW.game.equipment.able.bulletLv - 2;
				}
			},
			animate: function (idx) {
				var that = this,
					eq = this[idx];
				if (this.equipmentTimer && this.equipmentTimer[idx]) {
					clearTimeout(this.equipmentTimer[idx]);
				}
				if (eq.currentFrame === undefined) {return false;}
				this.equipmentTimer[idx] = setTimeout(function () {
					eq.currentFrame = (eq.currentFrame + 1) % eq.frames;
					that.animate(idx);
				}, eq.preFrameTime);
			},
			ableArr: ['fly', 'dive', 'guard', 'speed-1', 'bullet-harm-1', 'bullet-speed-1', 'bullet-lv-1', 'bullet-lv-2'],
			'0': {
				able: 'dive',
				img: 'bubble_57x25.png',
				shop: {
					cost: {
						'coin': 1000,
						'part': 10
					},
					name: '下潜装置',
					desc: '使船体潜入水中一段时间，【向下键】使用'
				},
				width:57,
				height: 50,
				pos: [-5, 5],
				frames: 2,
				currentFrame: 0,
				preFrameTime: 1000,
				cla: 'dive'
			},
			'1': {
				able: 'fly',
				img: 'wing_15x21.png',
				shop: {
					cost: {
						'coin': 1000,
						'part': 10
					},
					name: '上升装置',
					desc: '使船体脱离水面一段时间，【向上键】使用'
				},
				width: 15,
				height: 42,
				pos: [38, 0],
				frames: 2,
				currentFrame: 0,
				preFrameTime: 200,
				cla: 'fly'
			},
			'2': {
				able: 'speed-1',
				nodraw: true,
				shop: {
					cost: {
						'coin': 1000,
						'part': 10
					},
					name: '加速装置1',
					desc: '使船体速度增加10%'
				},
				cla: 'speed-1'
			},
			'3': {
				able: 'bullet-harm-1',
				nodraw: true,
				shop: {
					cost: {
						'coin': 1000,
						'part': 10
					},
					name: '火力提升装置1',
					desc: '使子弹威力增加10%'
				},
				cla: 'bullet-harm-1'
			},
			'4': {
				able: 'bullet-speed-1',
				nodraw: true,
				shop: {
					cost: {
						'coin': 1000,
						'part': 10
					},
					name: '子弹加速装置1',
					desc: '使子弹速度增加10%'
				},
				cla: 'bullet-speed-1'
			},
			'5': {
				able: 'bullet-lv-1',
				nodraw: true,
				shop: {
					cost: {
						'coin': 1000,
						'part': 10
					},
					name: '火力恒久装置1',
					desc: '使子弹等级不低于2级'
				},
				cla: 'bullet-lv-1'
			},
			'6': {
				able: 'bullet-lv-2',
				nodraw: true,
				shop: {
					cost: {
						'part': 10
					},
					name: '火力恒久装置2',
					desc: '使子弹等级不低于3级'
				},
				cla: 'bullet-lv-2'
			},
			'7': {
				able: 'guard',
				img: 'guard_26x78.png',
				shop: {
					cost: {
						'coin': 1000,
						'part': 10
					},
					name: '电子守卫',
					desc: '购买一个电子守卫，它会帮助玩家射击敌人'
				},
				bullet: 100,
				cooldown: 100,
				width: 26,
				height: 78,
				pos: [-20, -20],
				frames: 3,
				currentFrame: 0,
				preFrameTime: 200,
				cla: 'guard'
			}
		},
		power: {
			current: [],
			draw: function () {
				if (this.current.length <= 0) {return;}
				this.shelling = true;
				var ctx = SW.game.ctx,
					canvas = SW.game.canvas,
					c = this.current,
					len = c.length,
					needClear = false,
					i = 0,
					temp = null;
				for (i; i < len; i++) {
					temp = c[i];
					if (temp) {
						if (temp.id === 0) {
							var frame = temp.frame;
							if (frame > 0) {
								var w = temp.width,
									h = temp.height;
								ctx.setTransform(1, 0, 0, 1, 0, 0);
								ctx.fillRect(0, 0, w, h);
								ctx.fillStyle = 'white';
								ctx.stroke();
								temp.frame = frame - 1;
							} else {
								c[i] = undefined;
								needClear = true;
							}
						}
						if (temp.id === 1) {
							var delay = temp.delay;
							if (delay === 0) {
								var img = new Image(),
									XY = temp.XY,
									currentFrame = temp.currentFrame;
								img.src = SW.game.imgPath + temp.img;
								ctx.setTransform(1, 0, 0, 1, 0, 0);
								ctx.drawImage(img, currentFrame * temp.width, 0, temp.width, temp.height, XY[0], XY[1], temp.width, temp.height);
								if (temp.XY[1] < canvas.height) {
									temp.XY[1] = XY[1] + temp.speed;
									temp.currentFrame = (currentFrame + 1) % temp.frames;
								} else {
									c[i] = undefined;
									needClear = true;
								}
							} else {
								temp.delay = delay - 1;
							}
						}
					}
				}
				if (needClear) {
					this.current = SW.game.clearArr(c);
					if (this.current.length <= 0) {
						this.shelling = false;
						this.changeBg.recover();
					}
				}
			},
			shell: function () {
				if (SW.game.config.isSelectGifting || SW.game.config.isShopOpening || SW.game.config.isPause) {return}
				var power = SW.game.player.current.power,
					idx = power.type,
					name = this[idx].name;
				if (power.count <= 0) {return;}
				power.count = power.count - 1;
				this.handle[idx]();
				SW.game.panel.updatePower();
				SW.game.panel.showTextInfo(name);
				SW.game.stage.setTimer(1000, function () {
					SW.game.panel.hideTextInfo();
				});
				this.changeBg.change(idx);
			},
			changeBg: {
				recover: function () {
					var sea = SW.game.jSea,
						sky = SW.game.jSky;
					sea.removeClass('power-shell');
					sky.removeClass('power-shell');
				},
				change: function (idx) {
					var sea = SW.game.jSea,
						sky = SW.game.jSky;
					sea.addClass('power-shell');
					sky.addClass('power-shell');
				}
			},
			handle: {
				'0': function () {
					var data = SW.game.power[0],
						step = SW.game.config.step,
						canvas = SW.game.canvas,
						w = canvas.width,
						h = canvas.height,
						temp = {
							id: 0,
							idx: 0,
							name: data.name,
							rect: true,
							width: w,
							height: h,
							flag: +new Date(),
							XY: [0, 0],
							hitRange: [0, 0, w, h],
							power: data.power,
							frame: Math.ceil(data.duration / step)
						};
					SW.game.power.current.push(temp);
				},
				'1': function () {
					var data = SW.game.power[1],
						step = SW.game.config.step,
						canvas = SW.game.canvas,
						w = canvas.width,
						h = canvas.height,
						perDelay = Math.ceil(data.perDelay / step),
						dw = data.pwidth,
						dh = data.height,
						img = data.img,
						num = data.num,
						c = SW.game.power.current,
						margin = (w - 2*dw) / num,
						i = 0,
						temp = {
							id: 1,
							idx: 0,
							name: data.name,
							img: data.img,
							width: dw,
							height: dh,
							flag: 0,
							speed: data.speed,
							XY: [0, 0],
							hitRange: [0, 0, dw, dh],
							power: data.power,
							frames: data.frames,
							currentFrame: 0,
							delay: 0
						};
					for (i; i < num; i++) {
						temp.idx = i;
						temp.flag = + new Date();
						temp.delay = i * perDelay;
						temp.XY = [dw + margin * i, -1 * dh];
						c.push($.extend({},temp));
					}
				}
			},
			'0': {
				name: '阳光普照',
				img: null,
				power: 10,
				duration: 50
			},
			'1': {
				name: '电闪雷鸣',
				img: 'lightning_40x1000.png',
				width: 40,
				height: 1000,
				pwidth: 20,
				power: 5,
				perDelay: 100,
				speed: 100,
				num: 18,
				frames: 2,
				currentFrame: 0
			}
		},
		skill: {
			handle: {
				'v-shot': function (XY, bullet) {
					var b = SW.game.bullet[bullet],
						bce = SW.game.bullet.current.enemy,
						temp = {};
					temp = {
						img: b.img,
						speed: b.speed,
						width: b.width,
						height: b.height,
						power: b.power,
						XY: XY,
						rotate: 90
					};
					bce.push(temp);
				},
				'point-shot': function (XY, bullet) {
					var b = SW.game.bullet[bullet],
						bce = SW.game.bullet.current.enemy,
						pXY = SW.game.player.current.XY,
						temp = {};
					temp = {
						img: b.img,
						speed: b.speed,
						width: b.width,
						height: b.height,
						power: b.power,
						XY: XY,
						trackXY: pXY,
						type: 'point-shot'
					};
					bce.push(temp);
				},
				'three-shot': function (XY, bullet) {
					var b = SW.game.bullet[bullet],
						bce = SW.game.bullet.current.enemy,
						rotate = [90, 60, 120],
						i = 0,
						t = {},
						len = rotate.length;
					for (i; i < len; i++) {
						t = {};
						t = {
							img: b.img,
							speed: b.speed,
							width: b.width,
							height: b.height,
							power: b.power,
							XY: XY,
							rotate: rotate[i],
							delay: 3
						};
						bce.push(t);
					}
				},
				'tilted-l-shot': function (XY, bullet) {
					var b = SW.game.bullet[bullet],
						bce = SW.game.bullet.current.enemy,
						temp = {};
					temp = {
						img: b.img,
						speed: b.speed,
						width: b.width,
						height: b.height,
						power: b.power,
						XY: XY,
						rotate: 135
					};
					bce.push(temp);
				},
				'tilted-r-shot': function (XY, bullet) {
					var b = SW.game.bullet[bullet],
						bce = SW.game.bullet.current.enemy,
						temp = {};
					temp = {
						img: b.img,
						speed: b.speed,
						width: b.width,
						height: b.height,
						power: b.power,
						XY: XY,
						rotate: 45
					};
					bce.push(temp);
				},
				'flower-launch-boss': function (XY, bullet) {
					var b = SW.game.bullet[bullet],
						bcb = SW.game.bullet.current.boss,
						rotate = [30, 60, 90, 120, 150, 120, 90, 60, 30],
						i = 0,
						t = {},
						len = rotate.length;
					for (i; i < len; i++) {
						t = {};
						t = {
							img: b.img,
							speed: b.speed,
							width: b.width,
							height: b.height,
							power: b.power,
							XY: XY,
							rotate: rotate[i],
							delay: i * 10,
							needRegulate: true
						};
						bcb.push(t);
					}
				},
				'four-cannon-boss': function (XY, bullet) {
					var b = SW.game.bullet[bullet],
						bcb = SW.game.bullet.current.boss,
						rotate = [36, 72, 108, 144],
						i = 0,
						t = {},
						len = rotate.length;
					for (i; i < len; i++) {
						t = {};
						t = {
							img: b.img,
							speed: b.speed,
							width: b.width,
							height: b.height,
							power: b.power,
							XY: XY,
							rotate: rotate[i],
							delay: 3
						};
						bcb.push(t);
					}
				},
				'trace-missile': function (XY, bullet) {
					var data = SW.game.enemy['1000'],
						temp = {},
						step = SW.game.config.step;
					temp = {
						hp: data.hp,
						img: data.img,
						speed: data.speed,
						width: data.width,
						height: data.height,
						pheight: data.height / data.frames,
						score: data.score,
						coin: data.coin,
						hitRange: data.hitRange,
						power: data.power,
						XY: XY,
						rotate: 90,
						delay: 0,
						type: data.type,
						turnTime: data.turnTime / step,
						currentTurn: 0
					};
					if (!SW.game.enemy.animateTimer['1000']) {
						SW.game.enemy.animate(1000);
					}
					SW.game.enemy.current.push(temp);
				}
			}
		},
		mission: {
		
		},
		panel: {
			getEle: function () {
				this.jScore = $('.control .score span');
				this.jCoin = $('.control .coin span');
				this.jPart = $('.control .part span');
				this.jPause = $('.control .pause-go');
				this.jShop = $('.control .shop');
				this.jLv = $('.control .lv');
				this.jHp = $('.control .hp');
				this.jLife = $('.control .life');
				this.jPowerHouse = $('.power-house');
				this.jStage = $('.control .stage strong');
				this.jTextInfo = $('.canvas-bg .text-info');
			},
			textMsg: {
				'pause': '<div class="msg">PAUSE</div>',
				'clearStage': '<div class="msg">STAGE <strong class="stage-idx">0</strong> CLEAR</div>',
				'start': '<div class="msg">STAGE <strong class="stage-idx">0</strong> START</div>'
			},
			showTextInfo: function (msg) {
				if (this.textMsg[msg]) {
					msg = this.textMsg[msg];
				} else {
					msg = '<div class="msg">' + msg + '</div>';
				}
				var tinfo = this.jTextInfo;
				tinfo.show();
				tinfo.html(msg);
			},
			hideTextInfo: function () {
				this.jTextInfo.hide();
			},
			updateLife: function () {
				var life = SW.game.player.life;
				this.jLife.text(life);
			},
			updateHp: function () {
				var pMax = SW.game.ship[SW.game.player.avator.ship].maxHp,
					eMax = SW.game.equipment.able.maxHp,
					gMax = SW.game.gift.able.maxHp,
					max = pMax + eMax + gMax,
					hp = SW.game.player.current.hp,
					hps = this.jHp.find('li'),
					currentMax = hps.length,
					currentHp = 0;
				if (currentMax !== max) {
					var i = 0,
						n = hp,
						html = [];
					for (i; i < max; i++) {
						if (n > 0) {
							html.push('<li class="red"></li>');
							n = n - 1;
						} else {
							html.push('<li></li>');
						}
					}
					this.jHp.html(html.join(''));
				}
				currentHp = this.jHp.find('li.red').length;
				if (currentHp !== hp) {
					if (hp > max) {
						SW.game.player.current.hp = max;
						hp = max;
					}
					hps.removeClass('red');
					this.jHp.find('li:lt(' + hp + ')').addClass('red');
				}
			},
			updateScore: function () {
				var s = SW.game.player.score;
				this.jScore.text(s);
			},
			updateCoin: function () {
				var s = SW.game.player.coin;
				this.jCoin.text(s);
			},
			updatePart: function () {
				var s = SW.game.player.part;
				this.jPart.text(s);
			},
			updateStage: function () {
				var c = SW.game.stage.currentIdx + 1;
				this.jStage.text(c);
			},
			updatePower: function () {
				var pMax = SW.game.ship[SW.game.player.avator.ship].maxPower,
					eMax = SW.game.equipment.able.maxPower,
					gMax = SW.game.gift.able.maxPower,
					max = pMax + eMax + gMax,
					pInfo = SW.game.player.current.power,
					power = pInfo.count,
					powers = this.jPowerHouse.find('li'),
					currentMax = powers.length,
					currentPower = 0;
				if (currentMax !== max) {
					var i = 0,
						n = power,
						html = [];
					for (i; i < max; i++) {
						if (n > 0) {
							html.push('<li class="green"></li>');
							n = n - 1;
						} else {
							html.push('<li></li>');
						}
					}
					this.jPowerHouse.html(html.join(''));
				}
				currentPower = this.jPowerHouse.find('li.green').length;
				if (currentPower !== power) {
					if (power > max) {
						SW.game.player.current.power = max;
						power = max;
					}
					powers.removeClass('green');
					this.jPowerHouse.find('li:lt(' + power + ')').addClass('green');
				}
			},
			showClearInfo: function (idx) {
				idx = idx || 1;
				msg = this.textMsg.clearStage.replace('0', idx);
				this.showTextInfo(msg);
			},
			showStartInfo: function (idx) {
				idx = idx || 1;
				msg = this.textMsg.start.replace('0', idx);
				this.showTextInfo(msg);
			},
			bind: function () {
				var that = this;
				SW.game.giftSelectBox.find('li').live('click', function () {
					SW.game.gift.selectList.select($(this));
					return false;
				});
				SW.game.jRestart.bind('click', function () {
					SW.game.stage.restart();
					return false;
				});
				this.jPause.bind('click', function () {
					var _this = $(this);
					if (_this.hasClass('pause')) {
						SW.game.stage.stop();
					} else {
						SW.game.stage.goOn();
					}
				});
				this.jShop.bind('click', function () {
					SW.game.shop.open();
				});
			},
			ini: function () {
				this.getEle();
				this.bind();
				this.updateHp();
				this.updatePower();
				this.updateScore();
				this.updateCoin();
				this.updatePart();
				this.updateLife();
			}
		},
		score: {
			current: 0,
			addScore: function (num) {
				SW.game.player.score = SW.game.player.score + num;
				this.current = this.current + num;
				this.checkIsGetLife();
				SW.game.panel.updateScore();
			},
			checkIsGetLife: function () {
				var s2l = SW.game.config.scoreToLife;
				if (this.current >= s2l) {
					SW.game.player.life += 1;
					this.current = 0;
					SW.game.panel.updateLife();
				}
			}
		},
		collide: {
			test: function (x1, y1, x2, y2, x3, y3, x4, y4) {
				if (x3 >= x2 || y3 >= y2 || x4 <= x1 || y4 <= y1) {
					return false;
				} else {
					return true;
				}
			},
			attack: function (bullet, obj, idx, type) {
				if (!bullet) {
					log('bullet ... undefined???');
					return;
				}
				var hp = obj.hp,
					power = bullet.power;
				if (hp - power > 0) {
					obj.hp = hp - power;
					if (obj.status) {
						obj.status.attacked = true;
					} else {
						obj.status = {};
						obj.status.attacked = true;
					}
				} else {
					//obj.hp = 0;
					if (!obj.type) {
						SW.game.stage.queue.shift();
					}
					this.destroy(idx, type);
					SW.game.stage.checkStageOver();
				}
			},
			harm: function (bullet, player) {
				if (SW.game.player.current.status.invincible) {return;}
				var hp = player.hp,
					power = bullet.power,
					xy = player.XY,
					pw = player.width,
					ph = player.pheight;
				SW.game.effect.harmed.create(0, [xy[0] + pw/2, xy[1] + ph], 0);
				player.hp = hp - power;
				SW.game.panel.updateHp();
				if (hp - power <= 0) {
					if (SW.game.player.life > 0) {
						var p = SW.game.player.current,
							step = SW.game.config.step;
						p.status.invincible = true;
						p.status.dead = true;
						p.reliveTime = Math.ceil(SW.game.player.reliveTime / step);
						p.invincibleTime = Math.ceil(2000 / step);
						p.invinciblePerTime = Math.ceil(100 / step);
						p.isHide = false;
					} else {
						SW.game.stage.gameOver();
					}
				}
			},
			destroy: function (idx, type) {
				var c = SW.game[type].current,
					temp = c[idx];
				if (temp) {
					var	XY = temp.XY,
						x = XY[0],
						y = XY[1];
					XY = [x + temp.width/2, y + temp.height/2];
					if (temp.gift) {
						if (temp.gift.egg) {
							SW.game.gift.create(XY, 'egg');
						}
					}
					if (temp.gift) {
						if (temp.gift.p) {
							SW.game.gift.create(XY, 'p');
						}
					}
					SW.game.effect.boom.create(temp.boom, XY, 0);
					if (type === 'boss') {
						var b = SW.game.bullet.current.boss,
							l = b.length,
							i = 0;
						for (i; i < l; i++) {
							if (b[i].delay !== 0) {
								b[i] = undefined;
							}
						}
						SW.game.bullet.boss.clearBossCurrentArr();
					}
					if (temp.score) {
						SW.game.score.addScore(temp.score);
					}
					if (temp.coin) {
						SW.game.player.coin = SW.game.player.coin + temp.coin;
						SW.game.panel.updateCoin();
					}
					if (temp.part) {
						SW.game.player.part = SW.game.player.part + temp.part;
						SW.game.panel.updatePart();
					}
					c[idx] = undefined;
				}
			},
			powerRush: function (power, obj, idx, type) {
				if (!power) {
					log('power ... undefined???');
					return;
				}
				if (obj[power.flag]) {
					return;
				}
				obj[power.flag] = true;
				var hp = obj.hp,
					harmPoint = power.power;
				if (hp - harmPoint > 0) {
					obj.hp = hp - harmPoint;
				} else {
					//obj.hp = 0;
					SW.game.stage.queue.shift();
					this.destroy(idx, type);
					SW.game.stage.checkStageOver();
				}
			},
			check: function () {
				var cp = SW.game.player.current,
					ce = SW.game.enemy.current,
					cb = SW.game.boss.current,
					cg = SW.game.gift.current,
					cpo = SW.game.power.current,
					pbid = cp.avator.bullet[0],
					pb = SW.game.bullet.current.player[pbid],
					eb = SW.game.bullet.current.enemy,
					bb = SW.game.bullet.current.boss,
					gb = SW.game.bullet.current.guard,
					pbNeedClear = false,
					ebNeedClear = false,
					bbNeedClear = false,
					cgNeedClear = false,
					gbNeedClear = false,
					x1 = 0,
					y1 = 0,
					x2 = 0,
					y2 = 0,
					x3 = 0,
					y3 = 0,
					x4 = 0,
					y4 = 0;
				//player to enemy
				var pbLen = pb.length,
					ceLen = ce.length,
					i = 0,
					j = 0,
					hitRange = [],
					temp = null;
				if (pbLen > 0 && ceLen > 0) {
					for (i = 0; i < pbLen; i++) {
						temp = pb[i];
						if (temp) {
							if (pbid !== 1) {
								x1 = temp.XY[0];
								y1 = temp.XY[1];
								x2 = x1 + temp.width;
								y2 = y1 + temp.height;
								for (j = 0; j < ceLen; j++) {
									temp = ce[j];
									if (temp && !temp.delay) {
										hitRange = temp.hitRange;
										x3 = temp.XY[0] + hitRange[0];
										y3 = temp.XY[1] + hitRange[1];
										x4 = x3 + hitRange[2];
										y4 = y3 + hitRange[3];
										if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
											this.attack(pb[i], ce[j], j, 'enemy');
											pb[i] = undefined;
											//log(temp);
											pbNeedClear = true;
										}
									}
								}
							} else {
								x1 = temp.XY[0];
								y1 = temp.XY[1];
								x2 = x1 + temp.width;
								y2 = y1 + temp.height;
								var flag = temp.flag;
								for (j = 0; j < ceLen; j++) {
									temp = ce[j];
									if (temp && !temp.delay) {
										if (temp[flag]) {
											continue;
										}
										hitRange = temp.hitRange;
										x3 = temp.XY[0] + hitRange[0];
										y3 = temp.XY[1] + hitRange[1];
										x4 = x3 + hitRange[2];
										y4 = y3 + hitRange[3];
										if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
											temp[flag] = true;
											this.attack(pb[i], ce[j], j, 'enemy');
										}
									}
								}
							}
						}
					}
				}
				//player to boss
				var pbLen = pb.length,
					cbLen = cb.length,
					i = 0,
					j = 0,
					hitRange = [],
					temp = null;
				if (pbLen > 0 && cbLen > 0) {
					for (i = 0; i < pbLen; i++) {
						temp = pb[i];
						if (temp) {
							if (pbid !== 1) {
								x1 = temp.XY[0];
								y1 = temp.XY[1];
								x2 = x1 + temp.width;
								y2 = y1 + temp.height;
								for (j = 0; j < cbLen; j++) {
									temp = cb[j];
									if (temp && !temp.delay) {
										hitRange = temp.hitRange;
										x3 = temp.XY[0] + hitRange[0];
										y3 = temp.XY[1] + hitRange[1];
										x4 = x3 + hitRange[2];
										y4 = y3 + hitRange[3];
										if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
											this.attack(pb[i], cb[j], j, 'boss');
											pb[i] = undefined;
											//log(temp);
											pbNeedClear = true;
										}
									}
								}
							} else {
								x1 = temp.XY[0];
								y1 = temp.XY[1];
								x2 = x1 + temp.width;
								y2 = y1 + temp.height;
								var flag = temp.flag;
								for (j = 0; j < cbLen; j++) {
									temp = cb[j];
									if (temp && !temp.delay) {
										if (temp[flag]) {
											continue;
										}
										hitRange = temp.hitRange;
										x3 = temp.XY[0] + hitRange[0];
										y3 = temp.XY[1] + hitRange[1];
										x4 = x3 + hitRange[2];
										y4 = y3 + hitRange[3];
										if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
											temp[flag] = true;
											this.attack(pb[i], cb[j], j, 'boss');
										}
									}
								}
							}
						}
					}
				}
				//guard to enemy & boss
				var gbLen = gb.length,
					i = 0,
					j = 0,
					hitRange = [],
					temp = null;
				if (gbLen > 0) {
					for (i = 0; i < gbLen; i++) {
						temp = gb[i];
						if (temp) {
							hitRange = temp.hitRange;
							x1 = temp.XY[0] + hitRange[0];
							y1 = temp.XY[1] + hitRange[1];
							x2 = x1 + hitRange[2];
							y2 = y1 + hitRange[3];
							for (j = 0; j < ceLen; j++) {
								temp = ce[j];
								if (temp && !temp.delay) {
									hitRange = temp.hitRange;
									x3 = temp.XY[0] + hitRange[0];
									y3 = temp.XY[1] + hitRange[1];
									x4 = x3 + hitRange[2];
									y4 = y3 + hitRange[3];
									if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
										this.attack(gb[i], ce[j], j, 'enemy');
										gb[i] = undefined;
										gbNeedClear = true;
									}
								}
							}
							
							for (j = 0; j < cbLen; j++) {
								temp = cb[j];
								if (temp && !temp.delay) {
									hitRange = temp.hitRange;
									x3 = temp.XY[0] + hitRange[0];
									y3 = temp.XY[1] + hitRange[1];
									x4 = x3 + hitRange[2];
									y4 = y3 + hitRange[3];
									if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
										this.attack(gb[i], cb[j], j, 'boss');
										gb[i] = undefined;
										gbNeedClear = true;
									}
								}
							}
						}
					}
				}
				//player to egg/p
				var cgLen = cg.length,
					j = 0,
					hitRange = [],
					temp = null;
				for (j = 0; j < cgLen; j++) {
					temp = cg[j];
					if (temp) {
						hitRange = temp.hitRange;
						x3 = temp.XY[0] - temp.width/2 + hitRange[0];
						y3 = temp.XY[1] + hitRange[1];
						x4 = x3 + hitRange[2];
						y4 = y3 + hitRange[3];
						temp = cp;
						if (temp && !temp.status.dead) {
							x1 = temp.XY[0];
							y1 = temp.XY[1];
							x2 = x1 + temp.width;
							y2 = y1 + temp.pheight;
							if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
								SW.game.gift.getGift(cg[j].type);
								cg[j] = undefined;
								cgNeedClear = true;
							}
						}
					}
				}
				//enemy to player
				var ebLen = eb.length,
					i = 0,
					hitRange = [],
					temp = null;
				if (ebLen > 0) {
					for (i = 0; i < ebLen; i++) {
						temp = eb[i];
						if (temp) {
							x1 = temp.XY[0];
							y1 = temp.XY[1];
							x2 = x1 + temp.width;
							y2 = y1 + temp.height;
							temp = cp;
							if (temp && !temp.status.dead) {
								hitRange = temp.hitRange;
								x3 = temp.XY[0] + hitRange[0];
								y3 = temp.XY[1] + hitRange[1];
								x4 = x3 + hitRange[2];
								y4 = y3 + hitRange[3];
								if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
									this.harm(eb[i], cp);
									eb[i] = undefined;
									//log(temp);
									ebNeedClear = true;
								}
							}
						}
					}
				}
				//boss to player
				var bbLen = bb.length,
					i = 0,
					hitRange = [],
					temp = null;
				if (bbLen > 0) {
					for (i = 0; i < bbLen; i++) {
						temp = bb[i];
						if (temp) {
							x1 = temp.XY[0];
							y1 = temp.XY[1];
							x2 = x1 + temp.width;
							y2 = y1 + temp.height;
							temp = cp;
							if (temp && !temp.status.dead) {
								hitRange = temp.hitRange;
								x3 = temp.XY[0] + hitRange[0];
								y3 = temp.XY[1] + hitRange[1];
								x4 = x3 + hitRange[2];
								y4 = y3 + hitRange[3];
								if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
									this.harm(bb[i], cp);
									bb[i] = undefined;
									//log(temp);
									bbNeedClear = true;
								}
							}
						}
					}
				}
				
				//power to enemy bullet & boss bullet & enemy & boss
				var cpoLen = cpo.length,
					i = 0,
					j = 0,
					hitRange = [],
					temp = null;
				if (cpoLen > 0) {
					for (i = 0; i < cpoLen; i++) {
						temp = cpo[i];
						if (temp) {
							hitRange = temp.hitRange;
							x1 = temp.XY[0] + hitRange[0];
							y1 = temp.XY[1] + hitRange[1];
							x2 = x1 + hitRange[2];
							y2 = y1 + hitRange[3];
							for (j = 0; j < ebLen; j++) {
								temp = eb[j];
								if (temp && !temp.delay) {
									x3 = temp.XY[0];
									y3 = temp.XY[1];
									x4 = x3 + temp.width;
									y4 = y3 + temp.height;
									if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
										eb[j] = undefined;
										ebNeedClear = true;
									}
								}
							}
							
							for (j = 0; j < bbLen; j++) {
								temp = bb[j];
								if (temp && !temp.delay) {
									x3 = temp.XY[0];
									y3 = temp.XY[1];
									x4 = x3 + temp.width;
									y4 = y3 + temp.height;
									if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
										bb[j] = undefined;
										bbNeedClear = true;
									}
								}
							}
							
							for (j = 0; j < ceLen; j++) {
								temp = ce[j];
								if (temp && !temp.delay) {
									hitRange = temp.hitRange;
									x3 = temp.XY[0] + hitRange[0];
									y3 = temp.XY[1] + hitRange[1];
									x4 = x3 + hitRange[2];
									y4 = y3 + hitRange[3];
									if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
										this.powerRush(cpo[i], ce[j], j, 'enemy');
									}
								}
							}
							
							for (j = 0; j < cbLen; j++) {
								temp = cb[j];
								if (temp && !temp.delay) {
									hitRange = temp.hitRange;
									x3 = temp.XY[0] + hitRange[0];
									y3 = temp.XY[1] + hitRange[1];
									x4 = x3 + hitRange[2];
									y4 = y3 + hitRange[3];
									if (this.test(x1, y1, x2, y2, x3, y3, x4, y4)) {
										this.powerRush(cpo[i], cb[j], j, 'boss');
									}
								}
							}
						}
					}
				}
				//clear Arr
				if (pbNeedClear) {
					SW.game.bullet.player.clearPlayerCurrentArr(pbid);
				}
				if (ebNeedClear) {
					SW.game.bullet.enemy.clearEnemyCurrentArr();
				}
				if (bbNeedClear) {
					SW.game.bullet.boss.clearBossCurrentArr();
				}
				if (cgNeedClear) {
					SW.game.gift.clearGiftCurrentArr();
				}
				if (gbNeedClear) {
					SW.game.bullet.guard.clearGuardCurrentArr();
				}
			}
		},
		movePath: {
			handlePath: function (idx, aw, ah) {
				var result = {
						path: [],
						XY: [],
						dir: ''
					},
					canvas = SW.game.canvas,
					path = this[idx],
					len = path.length,
					i = 0,
					temp = [];
				for (i; i < len; i++) {
					temp = path[i].slice(0);
					result.path.push(this.transData(temp, aw, ah));
					if (i === 0) {
						result.XY = result.path.shift();
						if (result.XY[0] < canvas.width / 2) {
							result.dir = 'r';
						} else {
							result.dir = 'l';
						}
					}
				}
				return result;
			},
			transData: function (arr, aw, ah) {
				var result = [],
					canvas = SW.game.canvas,
					seaLevel = SW.game.config.seaLevel,
					seaHeight = canvas.height - seaLevel;
				if (arr[0] < 5) {	
					result[0] = Math.ceil(arr[0] * 0.1 * canvas.width) - aw;
				} else if (arr[0] === 5){
					result[0] = Math.ceil(0.5 * canvas.width) - aw/2;
				} else if (arr[0] > 5) {
					result[0] = Math.ceil(arr[0] * 0.1 * canvas.width) + aw;
				}
				if (arr[1] < 5) {	
					result[1] = Math.ceil(arr[1] * 0.1 * seaHeight) + seaLevel;
				} else if (arr[1] === 5){
					result[1] = Math.ceil(0.5 * seaHeight) - ah/2 + seaLevel;
				} else if (arr[1] > 5) {
					result[1] = Math.ceil(arr[1] * 0.1 * seaHeight) - ah + seaLevel;
				}
				return result;
			},
			'0': [[0, 5], [1, 4], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 4], [10, 5], [9, 6], [8, 7], [7, 8], [6, 9], [5, 10], [4, 9], [3, 8], [2, 7], [1, 6], [0, 5]],
			'1': [[10, 5], [9, 4], [8, 3], [7, 2], [6, 1], [5, 0], [4, 1], [3, 2], [2, 3], [1, 4], [0, 5], [1, 6], [2, 7], [3, 8], [4, 9], [5, 10], [6, 9], [7, 8], [8, 7], [9, 6], [10, 5]],
			'100': [[0, 2], [5, 2], [10, 6]],//-------- 0 - 99 for boss, 99+ for enemy
			'101': [[0, 5], [5, 2], [5, 1], [10, 1]],
			'102': [[0, 10], [5, 5], [10, 5]],
			'103': [[10, 5], [5, 2], [0, 5]],
			'104': [[10, 2], [6, 3], [3, 5], [0, 6]],
			'105': [[8, 10], [8,2], [8,8], [10, 8]],
			'106': [[10, 10], [9, 9], [0, 9]]
		},
		stage: {
			gravity: 0.5,
			floating: -0.5,
			currentIdx: 0,
			queue: [],//current stage data queue, for check is enemy/boss all cleared as its length = 0
			checkStageOver: function () {
				if (this.queue.length === 0) {
					SW.game.enemy.stopAnimate();
					SW.game.boss.stopAnimate();
					this.animateIds = {};
					if (this.prevHalfLoadComplate) {
						this.loadStage(this.currentIdx, 1);
					} else {
						this.currentIdx++;
						var idx = this.currentIdx,
							that = this;
						SW.game.panel.showClearInfo(idx);
						this.setTimer(SW.game.config.stageSwitchTime, function () {
							SW.game.stage.loadStage(idx, 0);
						});
					}
					this.prevHalfLoadComplate = false;
				}
			},
			fnArr: [],
			setTimer: function (time, fn) {
				var step = SW.game.config.step;
				time = Math.ceil(time / step);
				this.fnArr.push([time, fn]);
			},
			runTimer: function () {
				var arr = this.fnArr,
					len = arr.length;
				if (len > 0) {
					var timer = arr[0][0];
					if (timer > 0) {
						arr[0][0] = timer - 1;
					} else if (timer === 0) {
						arr[0][1]();
						this.fnArr.shift();
					}
				}
			},
			clearTimer: function () {
				this.fnArr = [];
			},
			clear: function () {
				var ctx = SW.game.ctx;
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.translate(0 , 0);
				ctx.clearRect(0, 0, 1000, 500);
			},
			gameOver: function () {
				SW.game.player.stopDraw = true;
				setTimeout(function () {
					SW.game.stage.stop();
					SW.UI.dialog.open('.popup-fail');
				}, 2000);
			},
			win: function () {
				this.stop();
				SW.UI.dialog.open('.popup-win');
				SW.game.unbind();
				this.clearTimer();
				SW.game.panel.hideTextInfo();
			},
			stop: function () {
				SW.game.config.isPause = true;
				SW.game.panel.showTextInfo('pause');
				SW.game.panel.jPause.removeClass('pause').addClass('go');
			},
			goOn: function () {
				SW.game.config.isPause = false;
				SW.game.panel.hideTextInfo();
				SW.game.panel.jPause.removeClass('go').addClass('pause');
				//SW.game.draw();
			},
			restart: function () {
				location.reload();
			},
			animateIds: {},
			loadData: function (idx, pn) {//pn: prev || next; 0 || 1;
				var data = this.stageData[idx],
					len = data.length,
					queue = this.queue = [],
					isNextHalf = false,
					i = 0;
				for (i; i < len; i++) {
					if (!pn || pn === 'prev') {//prev
						if (data[i].half) {
							this.prevHalfLoadComplate = true;
							break;
						}
						this.pushDataToCurrent(data[i], i);
						if (data[i].type !== 'egg' && data[i].type !== 'p') {
							queue.push(i);
						}
					} else {
						if (data[i].half) {
							isNextHalf = true;
							continue;
						}
						if (isNextHalf) {
							this.pushDataToCurrent(data[i], i);
							if (data[i].type !== 'egg' && data[i].type !== 'p') {
								queue.push(i);
							}
						}
					}					
				}
			},
			pushDataToCurrent: function (data, idx) {
				var c = null,
					frame = 0,
					step = SW.game.config.step,
					avator = null,
					moveInfo = null,
					skill = [],
					temp = {};
				frame = Math.ceil(data.time / step);
				if (data.type === 'enemy') {
					c = SW.game.enemy.current;
					avator = SW.game.enemy[data.idx];
					moveInfo = SW.game.movePath.handlePath(data.move, avator.width, avator.height / avator.frames);
					if (!this.animateIds['enemy' + data.idx]) {
						SW.game.enemy.animate(data.idx);
						this.animateIds['enemy' + data.idx] = true;
					}
					temp = {
						idx: idx,
						id: data.idx,
						img: avator.img,
						bullet: avator.bullet,
						width: avator.width,
						height: avator.height / avator.frames,
						hp: avator.hp,
						speed: avator.speed,
						score: avator.score,
						boom: avator.boom,
						hitRange: avator.hitRange,
						coin: avator.coin,
						movePath: moveInfo.path,
						XY: moveInfo.XY,
						dir: moveInfo.dir,
						delay: frame
					}
				} else if (data.type === 'boss') {
					c = SW.game.boss.current;
					avator = SW.game.boss[data.idx];
					moveInfo = SW.game.movePath.handlePath(data.move, avator.width, avator.height / avator.frames);
					if (!this.animateIds['boss' + data.idx]) {
						SW.game.boss.animate(data.idx);
						this.animateIds['boss' + data.idx] = true;
					}
					temp = {
						idx: idx,//enemy index in stage 
						id: data.idx,//enemy's id in enemy data
						img: avator.img,
						bullet: avator.bullet,
						width: avator.width,
						height: avator.height / avator.frames,
						hp: avator.hp,
						speed: avator.speed,
						score: avator.score,
						coin: avator.coin,
						boom: avator.boom,
						skill: avator.skill,
						hitRange: avator.hitRange,
						gift: avator.gift,
						movePath: moveInfo.path,
						pathCount: moveInfo.path.length,
						nextPath: 0,
						XY: moveInfo.XY,
						dir: moveInfo.dir,
						delay: frame
					}
				} else if (data.type === 'egg' || data.type === 'p') {
					//c = SW.game.gift.current;
					avator = SW.game.gift[data.type];
					var XY = SW.game.movePath.transData(data.XY, avator.width, avator.height);
					SW.game.gift.create(XY, data.type, frame);
					return;
				} else {return;}
				if (avator.skill) {
					skill = avator.skill;
					skill = this.transTimeToFramesForSkill(skill);
					temp.skill = skill.skill;
					temp.skillFrame = skill.skillFrame;
				}
				if (data.gift) {
					temp.gift = data.gift;
				}
				c.push(temp);
			},
			transTimeToFramesForSkill: function (arr) {
				var skill = [],
					skillFrame = [],
					len = arr.length,
					i = 0,
					step = SW.game.config.step,
					temp = 0;
				for (i = 0; i < len; i++) {
					temp = arr[i][1] / step;
					skill.push([arr[i][0], temp]);
					skillFrame.push(temp);
				}
				return {'skill': skill, 'skillFrame': skillFrame};
			},
			loadStage: function (idx, pn) {
				idx = idx || 0;
				pn = pn || 0;
				if (this.stageData[idx]) {
					this.currentIdx = idx;
					this.loadData(idx, pn);
					if (pn === 0) {
						SW.game.panel.showStartInfo(idx + 1);
						SW.game.panel.updateStage();
						this.setTimer(SW.game.config.stageSwitchTime, function () {
							SW.game.panel.hideTextInfo();
						});
					}
				} else {
					this.win();
				}
			},
			prevHalfLoadComplate: false,
			stageData: {
				'0': [
					{
						type: 'enemy',//enemy, boss, gift
						move: 104,//object move path, 0-1000 enemy's path, 1000+ boss's path
						idx: 0,//enemy or boss's index
						time: 1000//when appear
					},
					{type: 'enemy',move: 104,idx: 0,time: 1400,gift: {p: 1/*,equipment: [0]*/}},
					{type: 'enemy',move: 104,idx: 0,time: 1800},
					{type: 'enemy',move: 100,idx: 0,time: 3000},
					{type: 'enemy',move: 100,idx: 0,time: 3600},
					{type: 'enemy',move: 100,idx: 0,time: 4200},
					{type: 'enemy',move: 100,idx: 0,time: 5800},
					{type: 'enemy',move: 101,idx: 0,time: 7400},
					{type: 'p',time: 8000, XY: [5, 10]},
					{type: 'enemy',move: 101,idx: 0,time: 8000},
					{type: 'enemy',move: 101,idx: 0,time: 8600},
					{type: 'enemy',move: 103,idx: 4,time: 10000},
					{type: 'enemy',move: 103,idx: 4,time: 11000},
					{type: 'enemy',move: 103,idx: 4,time: 12000,gift: {egg: 1}},
					{type: 'enemy',move: 105,idx: 4,time: 13000},
					{type: 'enemy',move: 105,idx: 4,time: 14000},
					{type: 'enemy',move: 105,idx: 4,time: 15000},
					{type: 'enemy',move: 106,idx: 5,time: 17000},
					{type: 'enemy',move: 106,idx: 5,time: 17400},
					{type: 'enemy',move: 106,idx: 5,time: 17800},
					{type: 'enemy',move: 106,idx: 5,time: 18200},
					{type: 'enemy',move: 106,idx: 5,time: 18600},
					{type: 'enemy',move: 101,idx: 6,time: 18000,gift: {egg: 1}},
					{type: 'enemy',move: 101,idx: 6,time: 18400},
					{type: 'enemy',move: 101,idx: 6,time: 18800},
					{type: 'enemy',move: 101,idx: 6,time: 19200},
					{type: 'egg',time: 20000, XY: [5, 10]},
					{type: 'boss',move: 0,idx: 0,time: 25000},
					{'half': true},
					{type: 'enemy',move: 100,idx: 5,time: 2000},
					{type: 'enemy',move: 100,idx: 5,time: 3000},
					{type: 'enemy',move: 100,idx: 5,time: 4000},
					{type: 'enemy',move: 104,idx: 0,time: 3000},
					{type: 'enemy',move: 104,idx: 0,time: 3800},
					{type: 'enemy',move: 104,idx: 0,time: 4600},
					{type: 'egg',time: 6000, XY: [2, 10]},
					{type: 'enemy',move: 101,idx: 0,time: 5000},
					{type: 'enemy',move: 101,idx: 0,time: 6000},
					{type: 'enemy',move: 101,idx: 0,time: 7000},
					{type: 'enemy',move: 103,idx: 4,time: 8000},
					{type: 'enemy',move: 103,idx: 4,time: 8600, gift: {p: 1}},
					{type: 'enemy',move: 103,idx: 4,time: 9200},
					{type: 'enemy',move: 106,idx: 4,time: 8000},
					{type: 'enemy',move: 106,idx: 4,time: 8600},
					{type: 'enemy',move: 106,idx: 4,time: 9200},
					{type: 'enemy',move: 102,idx: 5,time: 10000},
					{type: 'enemy',move: 102,idx: 5,time: 10600},
					{type: 'enemy',move: 102,idx: 5,time: 11200,gift: {egg: 1}},
					{type: 'enemy',move: 105,idx: 6,time: 13000},
					{type: 'enemy',move: 105,idx: 6,time: 14000},
					{type: 'enemy',move: 105,idx: 6,time: 15000},
					{type: 'boss',move: 0,idx: 1,time: 20000,gift: {p: 1}}
				],
				'1': [
					{type: 'enemy',move: 104,idx: 7,time: 1400},
					{type: 'enemy',move: 104,idx: 7,time: 1800},
					{type: 'enemy',move: 100,idx: 7,time: 3000},
					{type: 'enemy',move: 100,idx: 7,time: 3600},
					{type: 'enemy',move: 100,idx: 7,time: 4200,gift: {egg: 1/*,equipment: [0]*/}},
					{type: 'enemy',move: 100,idx: 7,time: 5800},
					{type: 'enemy',move: 101,idx: 7,time: 7400},
					{type: 'enemy',move: 101,idx: 7,time: 8000},
					{type: 'enemy',move: 101,idx: 7,time: 8600},
					{type: 'enemy',move: 103,idx: 7,time: 10000},
					{type: 'enemy',move: 103,idx: 7,time: 11000},
					{type: 'enemy',move: 103,idx: 7,time: 12000,gift: {p: 1}},
					{type: 'enemy',move: 105,idx: 7,time: 13000},
					{type: 'enemy',move: 105,idx: 7,time: 14000},
					{type: 'enemy',move: 105,idx: 7,time: 15000},
					{type: 'enemy',move: 106,idx: 7,time: 17000},
					{type: 'enemy',move: 106,idx: 7,time: 17400},
					{type: 'enemy',move: 106,idx: 7,time: 17800},
					{type: 'enemy',move: 106,idx: 7,time: 18200},
					{type: 'enemy',move: 106,idx: 7,time: 18600},
					{type: 'enemy',move: 101,idx: 7,time: 18000},
					{type: 'enemy',move: 101,idx: 7,time: 18400},
					{type: 'enemy',move: 101,idx: 7,time: 18800},
					{type: 'enemy',move: 101,idx: 7,time: 19200},
					{type: 'egg',time: 20000, XY: [5, 10]},
					{type: 'boss',move: 0,idx: 0,time: 25000,gift: {p: 1}},
					{'half': true},
					{type: 'enemy',move: 100,idx: 7,time: 2000},
					{type: 'enemy',move: 100,idx: 7,time: 3000},
					{type: 'enemy',move: 100,idx: 7,time: 4000},
					{type: 'enemy',move: 104,idx: 7,time: 3000},
					{type: 'enemy',move: 104,idx: 7,time: 3800},
					{type: 'enemy',move: 104,idx: 7,time: 4600},
					{type: 'egg',time: 6000, XY: [2, 10]},
					{type: 'enemy',move: 101,idx: 7,time: 5000},
					{type: 'enemy',move: 101,idx: 7,time: 6000,gift: {p: 1}},
					{type: 'enemy',move: 101,idx: 7,time: 7000},
					{type: 'enemy',move: 103,idx: 7,time: 8000},
					{type: 'enemy',move: 103,idx: 7,time: 8600},
					{type: 'enemy',move: 103,idx: 7,time: 9200},
					{type: 'enemy',move: 106,idx: 7,time: 8000},
					{type: 'enemy',move: 106,idx: 7,time: 8600},
					{type: 'enemy',move: 106,idx: 7,time: 9200},
					{type: 'enemy',move: 102,idx: 7,time: 10000},
					{type: 'enemy',move: 102,idx: 7,time: 10600},
					{type: 'enemy',move: 102,idx: 7,time: 11200,gift: {egg: 1}},
					{type: 'enemy',move: 105,idx: 7,time: 13000},
					{type: 'enemy',move: 105,idx: 7,time: 14000},
					{type: 'enemy',move: 105,idx: 7,time: 15000},
					{type: 'boss',move: 0,idx: 1,time: 20000,gift: {p: 1}}
				]
			}
		},
		ftp: {
			show: function () {
				if (!$('#ftp')[0]) {
					$('body').append('<div id="ftp"></div>');
				}
				this.jFtp = $('#ftp');
				if (!SW.game.debug) {
					this.jFtp.hide();
				}
				this.calt();
			},
			calt: function () {
				var that = this,
					f = SW.game.frames;
				this.interval = setTimeout(function () {
					that.calt();
				}, 1000);
				if (SW.game.config.isPause) {return};
				this.jFtp.text(f);
				if (!SW.game.config.isRegulated) {
					this.regulateStep();
				}
				SW.game.frames = 0;
			},
			regulateStep: function () {
				var f = SW.game.frames;
				log(f);
				if (f > 70 && !SW.game.config.isPause) {
					SW.game.config.step += 1;
				} else if (f < 60 && !SW.game.config.isPause) {
					SW.game.config.step -= 1;
				} else {
					SW.game.config.isRegulated = true;
					SW.game.stage.loadStage();
					return;
				}
			},
			hide: function () {
				this.jFtp.hide();
				clearTimeout(this.interval);
			},
			ini: function () {
				this.show();
			}
		},
		getEle: function () {
			var canvas = this.canvas = document.getElementById('canvas');
			if (canvas.getContext) {
				this.ctx = canvas.getContext('2d');
			} else {
				log('浏览器不支持canvas');
				return false;
			}
			this.debug = true;
			this.imgPath = 'image/';
			this.jSky = $('.sky');
			this.jSea = $('.sea');
			this.giftSelectBox = $('.gift-select-box ul');
			this.jRestart = $('a.restart');
			this.frames = 0;//ftp
		},
		createRandomNum: function (args) {//数组 范围，数字 0-数字，无参数 0 or 1;
			var r = 0;
			if($.isArray(args)){
				if (args[0] < args[1]) {
					r = Math.round(Math.random()*(args[1] - args[0]) + args[0]);
				} else {
					r = args[1];
				}
			} else if(typeof args === 'number') {
				r = Math.round(Math.random() * args);
			} else {
				r = Math.round(Math.random());
			}
			return r;
		},
		clearArr: function (arr) {
			var temp = {},
				result = [];
			for (temp in arr) {
				if (arr[temp] !== undefined) {
					result.push(arr[temp]);
				}
			}
			return result;
		},
		draw: function () {
			if (!SW.game.config.isPause) {
				this.stage.clear();
				this.player.draw();
				this.enemy.draw();
				this.boss.draw();
				this.bullet.draw();
				this.collide.check();
				this.gift.draw();
				this.power.draw();
				this.effect.draw();
				this.frames = this.frames + 1;
				this.stage.runTimer();
			}
			//this.testDraw();
			setTimeout(function () {
				SW.game.draw();
			}, this.config.step);
		},
		testDraw: function () {
			var ctx = this.ctx,
				img = new Image();
			img.src = 'image/bullet2_30x30.png';
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.globalAlpha = 0.5;
			ctx.translate(0 + 30, 0 + 30);
			ctx.rotate(1.5 *Math.PI);
			ctx.drawImage(img, 0, 0, 30, 30, -15, -15, 30, 30);
			ctx.globalAlpha = 1;
			ctx.fillStyle = '#000';
			ctx.rect(-15,-15,30, 30);
			ctx.stroke();
		},
		drawBg: function () {
			var sl = this.config.seaLevel;
			this.jSky.css({
				'height': sl + 'px'
			});
			this.jSea.css({
				'top': sl + 'px',
				'height': this.canvas.height - sl
			});
		},
		bind: function () {
			var that = this;
			$(document).keydown(function(e){
				switch(e.keyCode) {
					case 37: //zuo
						e.preventDefault();
						that.player.setDir('l');
						break;
					case 39: //you
						e.preventDefault();
						that.player.setDir('r');
						break;
					case 38: //shang
						e.preventDefault();
						that.player.setFlyForce();
						break;
					case 40: //xia
						e.preventDefault();
						that.player.setDiveForce();
						break;
					case 32: //空格
						e.preventDefault();
						//that.bullet.player.create();
						SW.game.player.current.createBullet = true;
						break;
					case 27: //esc
						e.preventDefault();
						if (SW.game.config.isSelectGifting || SW.game.config.isShopOpening) {return}
						if (SW.game.config.isPause) {
							SW.game.stage.goOn();
						} else {
							SW.game.stage.stop();
						}
						break;
					case 80: //p
						e.preventDefault();
						if (SW.game.config.isPause) {
							SW.game.stage.goOn();
						} else {
							SW.game.stage.stop();
						}
						break;
				}
			});
			$(document).keyup(function(e){
				//log(e.keyCode);
				switch(e.keyCode) {
					case 37: //zuo
						e.preventDefault();
						SW.game.player.current.keydown = false;
						break;
					case 39: //you
						e.preventDefault();
						SW.game.player.current.keydown = false;
						break;
					case 38: //shang
						e.preventDefault();
						break;
					case 40: //xia
						e.preventDefault();
						break;
					case 66: //power B
						e.preventDefault();
						that.power.shell();
						break;
					case 32: //空格
						e.preventDefault();
						//that.bullet.player.create();
						SW.game.player.current.createBullet = false;
						break;
				}
			});
		},
		unbind: function () {
			$(document).unbind('keydown keyup');
		},
		ini: function () {
			this.getEle();
			this.player.ini();
			this.panel.ini();
			this.drawBg();
			this.ftp.ini();
			this.bind();
			this.shop.ini();
			SW.game.draw();
		}
	},
	editor: {
		data: {
		},
		win: {
			getEle: function () {
				this.wrapper = $('.editor-win');
				this.wrapper.height(SW.UI.rootElem.clientHeight).show();
			},
			resize: function () {
				this.wrapper.height(SW.UI.rootElem.clientHeight);
			},
			topBar: {
				ini: function () {
				
				}
			},
			bottomBar: {
				ini: function () {
					SW.editor.bottomBar = new SW.UI.bottomBar({
						parent: '.editor-win',
						height: 35,
						cla: 'bottom-bar'
					});
				}
			},
			toolBar: {
				clickEvent: function (arg) {
					/*
					@param {
						*name: '',
						title: '',
						parent: '',
						isShowMask: false,
						*content: ''
					}
					*/
					var def = {
						parent: '.editor-win'
					};
					var cfg = $.extend({}, def, arg);
					if (!SW.editor[cfg.name]) {
						SW.editor[cfg.name] = new SW.UI.floatWin({
							parent: cfg.parent,
							title: cfg.title || '',
							content: cfg.content || '',
							cla: cfg.cla || '',
							isShowMask: cfg.isShowMask || false
						});
					} else {
						SW.editor[cfg.name].open();
					}
				},
				ini: function () {
					var that = this;
					SW.editor.toolBar = new SW.UI.toolBar({
						parent: '.editor-win',
						position: [0, 100],
						button: [
							{
								title: '玩家编辑器',
								text: '玩家编辑器',
								cla: 'btn-player',
								clickEvent: function () {
									that.clickEvent({
										name: 'playerPanel',
										title: '玩家编辑器',
										content: '.player-panel'
									});
								}
							},
							{
								title: '敌兵编辑器',
								text: '敌兵编辑器',
								cla: 'btn-enemy',
								clickEvent: function () {
									that.clickEvent({
										name: 'enemyPanel',
										title: '敌兵编辑器',
										content: '.enemy-panel'
									});
								}
							},
							{
								title: 'BOSS编辑器',
								text: 'BOSS编辑器',
								cla: 'btn-boss',
								clickEvent: function () {
									log('click btn-boss');
								}
							},
							{
								title: '路径编辑器',
								text: '路径编辑器',
								cla: 'btn-path',
								clickEvent: function () {
									log('click btn-path');
								}
							}
						]
					});
				}
			},
			canvas: {
				ini: function () {
					SW.editor.canvas = new SW.UI.asCanvas({
						parent: '.editor-win',
						canvasWidth: 1000,
						canvasHeight: 500,
						dragMin: 50,
						dragMax: 400
					});
				}
			},
			bind: function () {
				var a = null,
					that = this;
				$(window).resize(function () {
					clearTimeout(a);
					a = setTimeout(function () {
						that.resize();
					}, 400);
				});
			},
			ini: function () {
				this.getEle();
				this.bind();
				this.toolBar.ini();
				this.bottomBar.ini();
				this.canvas.ini();
			}
		},
		ini: function () {
			this.win.ini();
		}
	},
	ini: function () {
		this.UI.ini();
		this.loader.ini();
	}
};

$(function () {
	SW.ini();
});