/*
 * @Author: xujiawei 
 * @Date: 2021-01-29 16:34:10 
 * @Last Modified by: xujiawei
 * @Last Modified time: 2021-05-13 16:02:22
 * @ref https://chenpipi.cn/post/cocos-creator-popup-manage/
 * @ref https://gitee.com/ifaswind/eazax-ccc/blob/master/core/PopupManager.ts
 * 
 * 弹窗管理类(管理PopupBase及子类窗口)
 */

import { ConstData } from '../data/ConstData';
import { Loading } from './Loading';
import { PopupBase } from './PopupBase';

export enum PopupCacheMode {
    // 一次性（立即销毁节点并释放预制体）
    Once = 1,

    // 短期（立即销毁节点，缓存预制体）
    Temporary = 2,

    // 频繁（只关闭节点而不销毁，缓存预制体）
    Frequent = 3
}

export interface PopupRequest {
    // 弹窗预制体的相对路径
    path: string;
    // 弹窗选项
    options: any;
    // 缓存模式
    mode: PopupCacheMode;
    // 是否使用弹窗动画
    ani: boolean;
}

/** 弹窗请求结果 */
export enum PopupShowResult {
    /** 展示成功（已关闭） */
    Done = 1,
    /** 展示失败（加载失败） */
    Fail = 2,
    /** 等待中（已加入等待队列） */
    Wait = 3,
    /** 直接展示（未找到弹窗组件） */
    Dirty = 4
}

class PopupMng {
    // 预制=体表
    private prefabMap: Map<string, cc.Prefab> = new Map<string, cc.Prefab>();

    // 节点表
    private nodeMap: Map<string, cc.Node> = new Map<string, cc.Node>();

    // 缓存模式
    private _cacheModeMap: Map<string, PopupCacheMode> = new Map<string, PopupCacheMode>();

    // 等待队列
    public get queue() { return this._queue; };
    private _queue: PopupRequest[] = [];

    // 当前弹窗
    public get curPopup() { return this._curPopup; }
    private _curPopup: PopupRequest = null;

    // 是否已经有候选弹窗将要显示
    private _locked: boolean = false;

    // 连续展示弹窗的间隔时间（秒）
    public interval: number = 0.05;

    // 弹窗动态加载开始回调
    public loadStartCallback: Function = null;

    // 弹窗动态加载结束回调
    public loadFinishCallback: Function = null;

    private static _instance: PopupMng = null;

    constructor() {
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, () => {
            cc.log('[PopupMng]', '场景切换完毕，清理数据');
            this.clean();
            // 在加载prefab时最好屏蔽操作
            this.loadStartCallback = (name) => {
                Loading.show(name, 0.5);
            }
            this.loadFinishCallback = (name) => {
                Loading.hide(name);
            }
        }, this);
    }

    public static getInstance(): PopupMng {
        if (!PopupMng._instance) {
            cc.log('[PopupMng]', 'new instance');
            PopupMng._instance = new PopupMng();
        }
        return PopupMng._instance;
    }

    /**
     * 展示弹窗，如果当前已有弹窗在展示中则加入等待队列
     * @param path 弹窗预制体的相对路径（比如: prefabs/pop/SettingPopup)
     * @param options 弹窗选项
     * @param mode 缓存模式
     * @param priority 是否优先显示
     * @param ani 是否使用弹窗动画
     */
    public show<Options>(path: string, options: Options = null, mode: PopupCacheMode = PopupCacheMode.Temporary, priority: boolean = false, ani: boolean = true): Promise<PopupShowResult> {
        return new Promise(async res => {
            // 当前已经有弹窗在展示中则加入等待队列
            if (this._curPopup || this._locked) {
                this.push(path, options, mode, priority, ani);
                cc.log('[PopupMng]', '弹窗已经加入等待队列', this._queue);
                return res(PopupShowResult.Wait);
            }

            // 保存为当前弹窗，阻止新的弹窗请求
            this._curPopup = { path, options, mode, ani };

            // 先尝试在缓存中获取
            let node: cc.Node = this.getNodeFromCache(path);

            // 缓存中没有，动态加载预制体
            if (!cc.isValid(node, true)) {
                // 建议在动态加载时添加加载提示并屏蔽用户点击，避免多次点击，如下：
                this.loadStartCallback && this.loadStartCallback(path);
                // 等待加载
                await new Promise(res => {
                    cc.resources.load(path, (error: Error, prefab: cc.Prefab) => {
                        if (!error) {
                            prefab.addRef();                    // 增加引用计数
                            node = cc.instantiate(prefab);      // 实例化节点
                            this.prefabMap.set(path, prefab);   // 保存预制体
                            this._cacheModeMap.set(path, mode);  // 记录缓存模式
                        } else {
                            cc.error(error.message);
                        }
                        res();
                    });
                });
                // 加载完成后隐藏加载提示，如下：
                this.loadFinishCallback && this.loadFinishCallback(path);
            }

            // 加载失败（一般都是路径错误导致的）
            if (!cc.isValid(node, true)) {
                cc.warn('[PopupMng]', '弹窗加载失败', path);
                this._curPopup = null;
                return res(PopupShowResult.Fail);
            }

            // 添加到场景中
            node.setParent(cc.Canvas.instance.node);
            // 显示在最上层
            // node.setSiblingIndex(cc.macro.MAX_ZINDEX);
            node.zIndex = ConstData.ZIndex.POP_BASE;

            // 获取继承自Popupbase的组件
            const popup = node.getComponent(PopupBase);
            if (popup) {
                popup.setFinishCallback(async () => {
                    this.recycle(path, node, mode);
                    this._curPopup = null;
                    this._locked = (this._queue.length > 0);
                    res(PopupShowResult.Done);
                    await new Promise(res => {
                        cc.Canvas.instance.scheduleOnce(res, this.interval);
                    });
                    this.next();
                });
                popup.show(options, ani);
            } else {
                // 没有PopupBase组件则直接打开节点
                node.active = true;
                res(PopupShowResult.Dirty);
            }
        });
    }

    /**
     * 强制显示弹窗（多级弹窗时用）
     * @param path 弹窗预制体的相对路径
     * @param options 弹窗选项
     * @param mode 缓存模式
     * @param ani 是否使用弹窗动画
     */
    public showForced<Options>(path: string, options: Options = null, mode: PopupCacheMode = PopupCacheMode.Temporary, ani: boolean = true): Promise<PopupShowResult> {
        return new Promise(async res => {
            // 先尝试在缓存中获取
            let node: cc.Node = this.getNodeFromCache(path);

            // 缓存中没有，动态加载预制体
            if (!cc.isValid(node, true)) {
                // 建议在动态加载时添加加载提示并屏蔽用户点击，避免多次点击，如下：
                this.loadStartCallback && this.loadStartCallback();
                // 等待加载
                await new Promise(res => {
                    cc.resources.load(path, (error: Error, prefab: cc.Prefab) => {
                        if (!error) {
                            prefab.addRef();                    // 增加引用计数
                            node = cc.instantiate(prefab);      // 实例化节点
                            this.prefabMap.set(path, prefab);   // 保存预制体
                            this._cacheModeMap.set(path, mode);  // 记录缓存模式
                        }
                        res();
                    });
                });
                // 加载完成后隐藏加载提示，如下：
                this.loadFinishCallback && this.loadFinishCallback();
            }

            // 加载失败（一般都是路径错误导致的）
            if (!cc.isValid(node, true)) {
                cc.warn('[PopupMng]', '弹窗加载失败', path);
                return res(PopupShowResult.Fail);
            }

            // 添加到场景中
            node.setParent(cc.Canvas.instance.node);
            // 显示在最上层, 强制弹窗层级高于普通弹窗
            // node.setSiblingIndex(cc.macro.MAX_ZINDEX);
            node.zIndex = ConstData.ZIndex.POP_BASE + 1;

            // 获取继承自Popupbase的组件
            const popup = node.getComponent(PopupBase);
            if (popup) {
                popup.setFinishCallback(async () => {
                    this.recycle(path, node, mode);
                    res(PopupShowResult.Done);
                });
                popup.show(options, ani);
            } else {
                // 没有PopupBase组件则直接打开节点
                node.active = true;
                res(PopupShowResult.Dirty);
            }
        });
    }

    /**
     * 从缓存中获取节点
     * @param path 
     */
    private getNodeFromCache(path: string): cc.Node {
        switch (this._cacheModeMap.get(path)) {
            case PopupCacheMode.Temporary:
                const prefab = this.prefabMap.get(path);
                if (cc.isValid(prefab, true)) {
                    return cc.instantiate(prefab);
                }
                this.prefabMap.delete(path);
                return null;
            case PopupCacheMode.Frequent:
                const node = this.nodeMap.get(path);
                if (cc.isValid(node, true)) {
                    return node;
                }
                this.nodeMap.delete(path);
                return null;
            default:
                return null;
        }
    }

    public next(): void {
        if (this._curPopup || this._queue.length == 0) {
            return;
        }
        const request = this._queue.shift();
        this._locked = false;
        this.show(request.path, request.options, request.mode, false, request.ani);
    }

    /**
     * 添加一个弹窗请求到等待队列中，如果当前没有展示到弹窗则直接显示该弹窗
     * @param path 弹窗预制体的相对路径
     * @param options 弹窗选项
     * @param mode 缓存模式
     * @param priority 是否优先显示
     */
    public push<Opations>(path: string, options: Opations = null, mode: PopupCacheMode = PopupCacheMode.Temporary, priority: boolean = false, ani = true) {
        // 直接显示
        if (!this._curPopup && !this._locked) {
            this.show(path, options, mode, ani);
            return;
        }
        // 加入队列
        if (priority) {
            this._queue.unshift({ path, options, mode, ani });
        } else {
            this._queue.push({ path, options, mode, ani });
        }
    }

    /**
     * 
     * @param path 弹窗预制体相对路径
     * @param node 弹窗节点
     * @param mode 缓存模式
     */
    private recycle(path: string, node: cc.Node, mode: PopupCacheMode): void {
        switch (mode) {
            case PopupCacheMode.Once:
                node.destroy();
                if (this.nodeMap.has(path)) {
                    this.nodeMap.delete(path);
                }
                this.release(path);
                break;
            case PopupCacheMode.Temporary:
                node.destroy();
                if (this.nodeMap.has(path)) {
                    this.nodeMap.delete(path);
                }
                break;
            case PopupCacheMode.Frequent:
                if (!this.nodeMap.has(path)) {
                    this.nodeMap.set(path, node);
                }
                node.removeFromParent(false);
                break;
        }
    }

    /**
     * 尝试释放弹窗资源（注意：弹窗内部动态加载的资源请自行释放）
     * @param path 弹窗预制体相对路径
     */
    public release(path: string): void {
        let prefab = this.prefabMap.get(path);
        if (prefab) {
            this.prefabMap.delete(path);
            prefab.decRef();
            prefab = null;
        }
    }

    /**
     * 当切换场景时要移除所有缓存的弹窗信息
     */
    clean() {
        this.nodeMap.forEach((node: cc.Node, path: string) => {
            if (node && cc.isValid(node, true)) {
                node.destroy();
            }
        });
        this.nodeMap.clear();

        this.prefabMap.forEach((p: cc.Prefab, path: string) => {
            if (p) {
                p.decRef();
            }
        });
        this.prefabMap.clear();

        this._cacheModeMap.clear();
        this._queue.splice(0, this._queue.length);
        this._curPopup = null;
        this._locked = false;
    }
}

export let popupMng = PopupMng.getInstance();