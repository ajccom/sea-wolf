sea wolf
========

javascript,canvas,game
----------------------

##游戏说明

方向键控制移动，空格键发射子弹，B键释放power。暂时是个DEMO，只设置了3关，有BOSS战。玩家子弹可以变换升级，并设置了3种类型的子弹供玩家体验。Power暂时只设计了一种\:\)。

##运营

###如何自行设置关卡

####开发者可以在SW\.game\.stage\.stageData中任意添加关卡以及关卡中的小兵、boss。

>SW.game.stage.stageData['0'] = [...]

设置关卡1

>SW.game.stage.stageData['1'] = [...]

设置关卡2

>SW.game.stage.stageData['2'] = [...]

设置关卡3

>{type: 'enemy',move: 100,idx: 7,time: 4200,gift: {egg: 1,equipment: [0]}}

将会在该关卡开始4\.2s后向舞台添加一个编号为7的小兵(SW.game.enemy)，小兵的行为路线编号是100(SW.game.movePath)，击毁奖励是一个egg(升级能力用)和一个编号为0的装备(SW.game.equipment)(可以从【shop】=》【仓库】中查看)。

>{type: 'egg',time: 20000, XY: [5, 10]}

直接向舞台添加egg和p需要设定XY值，X与Y的值在0-10范围(包含0-10)。

>{'half': true}

代表关卡一半，关卡后半的计时从0开始。

###如何更改游戏数据

>SW.game.enemy

数字编号的属性就是小兵的数据。

>SW.game.boss

数字编号的属性就是boss的数据。boss的技能可以在skill中设置，形如[[技能名, 技能CD]|, [...]]。

>SW.game.ship

数字编号的属性是船体的数据。


##代码说明

\_sea\-wolf\.js是游戏最主要的脚本，除了使用到的jQuery之外，其他程序都在其中。**文件中代码采用字面量形式构建，可以折叠后查看**。下面讲一下这份文件中的内容。

###SW —— namespace

sea wolf的简写，也是程序的命名空间。

###SW\.UI

除了Canvas之外的DOM方面的UI组件都定义在SW\.UI之中。(editor部分不计)

###SW\.loader

游戏加载时候的loader组件

###SW\.game

游戏中各种数据、行为都在其中

###SW\.editor

编辑器组件（开发中）

###SW\.ini

游戏初始化函数

