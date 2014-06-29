'use strict'
SW.editor = {
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
};
