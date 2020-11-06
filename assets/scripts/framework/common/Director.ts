/*
 * @Author: xujiawei 
 * @Date: 2020-11-06 15:33:15 
 * @Last Modified by: xujiawei
 * @Last Modified time: 2020-11-06 15:35:15
 * 
 * 用来管理游戏流程，弹窗管理请用PopupMng,不再使用Director管理
 */

import { LocalDataMng } from './../data/localData/LocalDataMng';
import { ConstData } from './../data/ConstData';
import { Loading } from './Loading';

export class Director {
    static scene: cc.Scene = null;  // 当前场景节点
    static sceneCanvas: cc.Node = null;  // 当前场景下的canvas节点
    static sceneComponent: cc.Component = null;  // 当前场景挂载的主脚本组件
    static uiRoot: cc.Node = null;  // 场景下的ui根节点(多个摄像机的情况下可以单独设置一个名为UIRoot的节点作为ui根节点)
    static sceneName: string = '';

    static isBackground: boolean = false;
    static toBackgroundOSTime: number = 0;

    static activePops: any[] = [];  // POP列表
    static persistRootNodeList: any[]; // 常驻节点列表

    static EventType: any = {
        ALL_SINGLE_POP_CLOSE: 'ALL_SINGLE_POP_CLOSE',  // 所有独立的pop被关闭
    }

    // !!!游戏启动第一时间要调用初始化
    static init(initComponent?: any) {
        // 首次进入场景没有走loadSceen导致取不到canvas
        this.sceneCanvas = cc.Canvas.instance.node || null;
        this.uiRoot = this.sceneCanvas || null;  // 多摄像机的情况下ui节点可能不能直接加到canvas上, 这时候可以添加一个uiRoot节点用另外一个摄像机渲染

        // 前后台事件处理
        cc.game.on(cc.game.EVENT_HIDE, this.onEventHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onEventShow, this);

        // 微信小游戏事件处理
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.onShow(this.onWXGShow.bind(this));
            wx.onHide(this.onWXGHide.bind(this));
            // wx.exitMiniProgram({
            //     success: function (res) {
            //         cc.log("wx.exitMiniProgram-success:", res);
            //     },
            //     fail: function (res) {
            //         cc.log("wx.exitMiniProgram-fail:", res);
            //     }
            // })
        }

        // 键盘事件
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);

        // Canvas渲染事件(截屏)
        cc.director.on(cc.Director.EVENT_AFTER_DRAW, this.onAfterDraw, this);

        // 设置屏幕旋转(H5)
        //  cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);

        // 设置屏幕适配
        // this.initResolutionPolicy();
        // this.setSceneResolution(initComponent);

        // 屏幕改变回调
        cc.view.setResizeCallback(function () {
            cc.log('setResizeCallback');
            // this.initResolutionPolicy();
            // this.setSceneResolution(this.getSceneComponent());
        }.bind(this))
    }

    static onEventHide() {
        if (!this.isBackground) {

            this.isBackground = true;

            // 进入后台的时间
            this.toBackgroundOSTime = Date.now();
            cc.log('进入后台:', this.toBackgroundOSTime);

            // zc.audio.pauseAll();
            // 游戏逻辑处理
            LocalDataMng.saveDataToLocal();
        }
    }

    static onEventShow() {
        if (this.isBackground) {

            this.isBackground = false;

            const toForegroundOSTime = Date.now();
            const interval = toForegroundOSTime - this.toBackgroundOSTime;
            cc.log('进入前台-interval:', interval);

            // zc.timer.reduceCDAll(interval);

            // zc.audio.resumeAll();
        }
    }

    // 微信小游戏show
    static onWXGShow(res) {
        cc.log('onWXGShow', res);
    }

    // 微信小游戏hide
    static onWXGHide(res) {
        cc.log('onWXGHide', res);
    }

    static onKeyDown(event: cc.Event.EventKeyboard) {
        cc.log('onKeyDown', event.keyCode);
        switch (event.keyCode) {
            case cc.macro.KEY.back:
                cc.log("on key back down, keyCode: ", event.keyCode);
        }
    }

    // 渲染回调
    static onAfterDraw() {

    }

    static preloadScene(sceneName: string, onProgress?: (completedCount: number, totalCount: number, item: any) => void, onLoaded?: (error: Error) => void): void {
        cc.director.preloadScene(sceneName, onProgress, onLoaded);
    }

    // 加载Scene
    static loadScene(sceneName: string, params?: any, onLaunched?: (scene:cc.Scene, canvas: cc.Node, cmp: cc.Component)=>void): any {
        // 清除所有POP
        this.closeAllPops();

        window[this.sceneName + 'Scene'] = null;

        cc.director.loadScene(sceneName, function () {
            cc.log('loadScene:', sceneName);

            this.scene = cc.director.getScene();
            this.sceneCanvas = this.scene.getChildByName('Canvas');
            this.uiRoot = this.sceneCanvas.getChildByName("UIRoot") || this.sceneCanvas;
            this.sceneName = sceneName;
            this.sceneComponent = this.sceneCanvas.getComponent(sceneName + 'Scene');
            if (this.sceneComponent) {
                this.sceneComponent.sceneName = sceneName + 'Scene';
                if (this.sceneComponent.init) {
                    this.sceneComponent.init(params);
                }
            }

            window[this.sceneName + 'Scene'] = this.sceneComponent;

            if (onLaunched) {
                onLaunched(this.scene, this.sceneCanvas, this.sceneComponent);
            }

            // 解决IOS web下不播放音频的问题
            // zc.audio.showIOSWebMask();

        }.bind(this));
    }

    // 获取当前Scene名字
    static getSceneName() {
        return this.sceneName ? this.sceneName : '';
    }

    // 获取Scene脚本
    static getSceneComponent() {
        return this.sceneComponent;
    }

    // 获取Scene
    static getScene() {
        return this.scene;
    }

    // 获取Scene Canvas
    static getSceneCanvas() {
        return this.sceneCanvas;
    }

    // 获取ui根节点
    static getUiRoot() {
        return this.uiRoot;
    }

    // 加载Prefab
    static createPop(popName: string, params?: any, prefab?: cc.Prefab) {
        const beginTime = Date.now();
        params = params || {};

        let componentName = '';
        const popNameSpArr = popName.split('/');
        if (popNameSpArr.length > 0) {
            componentName = popNameSpArr[popNameSpArr.length - 1];
        }

        cc.log('createPop:' + popName, componentName);
        if (this.isPopActive(popName)) {
            cc.log('当前POP已存在:' + popName);
            return
        }

        Loading.show('loadPop', 0.1);
        let initFunc = function (prefab: cc.Prefab) {
            const beginTime2 = Date.now();
            let popNode: cc.Node = cc.instantiate(prefab);
            popNode.position = cc.v3(0, 0, 0);
            popNode.zIndex = this.getTopPopZIndex() + 10;

            popNode.parent = this.uiRoot;
            // 存到列表
            let popData = { popName: popName, popNode: popNode, popBase: null, popComponent: null };
            this.activePops.push(popData);
            // POPBase
            let popBase = popNode.getComponent('PopBase');
            if (!popBase) {
                cc.error('PopBase not find!');
                return;
            }
            popData.popBase = popBase; // 存入数据

            popBase.initBase(params, popName);
            popData.popComponent = popBase.component;
            Loading.hide("loadPop");
            const endTime = Date.now();
            cc.log('总耗时: ', endTime - beginTime, 'ms');
            cc.log('实例化和添加耗时: ', endTime - beginTime2, 'ms');
        }.bind(this);

        // 如果传入了prefab，直接使用
        if (prefab) {
            initFunc(prefab);
        } else {
            // 加载 Prefab
            cc.loader.loadRes(popName, cc.Prefab, null, function (err, prefab) {
                if (err) {
                    cc.log(popName + '加载失败', err);
                    // zc.ui.loading.hide('pop');
                    return;
                }

                initFunc(prefab);
            }.bind(this));
        }
    }

    // 获取最上层的POP
    static getTopPopData(_topIndex?: number) {
        let topIndex = _topIndex ? _topIndex : 1;
        return this.activePops[this.activePops.length - topIndex];
    }

    static getTopPopZIndex() {
        let topPop = this.getTopPopData();
        if (topPop) {
            return topPop.popNode.zIndex;
        }
        return ConstData.ZIndex.POP_BASE;
    }

    // 获取POP数据
    static getPopData(popName) {
        for (const i in this.activePops) {
            const popData = this.activePops[i];
            if (popData.popName == popName) {
                return popData;
            }
        }
    }

    // 获取POP
    static getPop(popName) {
        let popData = this.getPopData(popName);
        if (popData) {
            return popData.popComponent;
        }
    }

    // POP是否存在
    static isPopActive(popName: string) {
        if (this.getPopData(popName)) {
            return true;
        }
        return false;
    }


    static getActivePops() {
        return this.activePops;
    }

    // 关闭Prefab
    static closePop(popName: string) {
        cc.log('closePop:' + popName);
        const popData = this.getPopData(popName);
        if (popData) {
            for (let i: number = 0; i < this.activePops.length; i++) {
                const _popData = this.activePops[i];
                if (popData == _popData) {
                    this.activePops.splice(i, 1);
                    break;
                }
            }

            // POPBase
            let popBase = popData.popBase;
            popBase.cleanBase();

            // 当所有独立的POP被关闭
            if (this.activePops.length == 0 && !popBase.onClosedCallback) {
                cc.director.emit(Director.EventType.ALL_SINGLE_POP_CLOSE);
            }

        }
    }

    static closeAllPops() {
        while (this.activePops.length > 0) {
            let idx = this.activePops.length - 1;
            let popData = this.activePops[idx];

            let popName = popData.popName;
            cc.log('closeAllPops:' + popName);

            this.activePops.splice(idx, 1);

            let popBase = popData.popBase;
            popBase.cleanBase();
        }

        this.activePops = [];
    }

    // 常驻节点数据
    static addPersistRootNode(node: cc.Node) {
        cc.game.addPersistRootNode(node);
        this.persistRootNodeList.push(node);
    }

    // 清理常驻节点数据
    static cleanPersistRootNode() {
        for (const index in this.persistRootNodeList) {
            const node = this.persistRootNodeList[index];
            cc.game.removePersistRootNode(node);
        }
    }
}