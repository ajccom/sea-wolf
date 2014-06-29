'use strict'
SW.loader = {
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
};
	