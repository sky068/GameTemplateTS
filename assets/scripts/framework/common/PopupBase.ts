/*
 * @Author: xujiawei 
 * @Date: 2021-01-29 16:35:18 
 * @Last Modified by: xujiawei
 * @Last Modified time: 2021-06-18 10:46:07
 * @ref https://chenpipi.cn/post/cocos-creator-popup-manage/
 * @ref https://gitee.com/ifaswind/eazax-ccc/blob/master/components/popups/PopupBase.ts
 * 
 * 弹窗基类
 * 使用了TypeScript的范型(https://www.tslang.cn/docs/handbook/generics.html)
 * 弹窗结构固定为:
 * Pop-
 *    - mask
 *    - main
 *          -弹窗内容
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class PopupBase<Options> extends cc.Component {
    @property({ type: cc.Node, tooltip: CC_DEV && '背景遮罩' })
    public mask: cc.Node = null;

    @property({ type: cc.Node, tooltip: CC_DEV && '弹窗的主题节点' })
    public main: cc.Node = null;

    @property({ tooltip: CC_DEV && '点击空白区域是否关闭' })
    public touchClose: boolean = false;

    // 用于拦截点击的节点
    private blocker: cc.Node = null;

    // 动画时间
    public aniTime: number = 0.3;

    // 弹窗选项
    protected options: Options = null;

    // 弹窗流程结束回调（!!!注意：该回调为PopupManager专用， 重写hide函数时记得调用该回调以告知PopupMng)
    protected finishCallback: Function = null;

    // 弹窗已经完全展示（子类重写此函数以实现自定义逻辑)
    protected onShow(): void { };

    // 弹窗已经完全隐藏（子类重写此函数以实现自定义逻辑)
    protected onHide(): void { };

    protected onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClicked, this);
    }

    // 强制刷新所有的widget，解决因为播放tween动画导致widget(嵌套)计算错误的问题
    private recursiveUpdateWigetForced(node: cc.Node) {
        let children = node.children;
        let childrenCount = node.childrenCount;
        if (childrenCount) {
            for (let child of children) {
                let widget = child.getComponent(cc.Widget);
                if (widget) {
                    widget.updateAlignment();
                }
                this.recursiveUpdateWigetForced(child);
            }
        }
    }

    /**
     * 展示弹窗 通过PopupMng调用
     * @param options 弹窗选项
     * @param ani 是否使用弹出动画
     */
    public show(options?: Options, ani: boolean = true): void {
        // 保存选项
        this.options = options;
        // ？？mark: 如果把init和updateDisplay放到重置节点下面执行则Slider就显示异常
        // 初始化
        this.init(this.options);
        // 更新样式
        this.updateDisplay(this.options);

        if (ani) {
            // 重置节点
            this.mask.opacity = 0;
            this.mask.active = true;
            this.main.scale = 0;
            this.main.active = true;
            this.node.active = true;

            // 播放动画时禁止点击，防止误操作
            let swallowNode = new cc.Node();
            swallowNode.width = this.main.width;
            swallowNode.height = this.main.height;
            swallowNode.addComponent(cc.BlockInputEvents);
            this.main.addChild(swallowNode);

            // 播放背景动画
            cc.tween(this.mask).to(this.aniTime * 0.8, { opacity: 100 }).start();
            // 播放主题动画
            cc.tween(this.main).to(this.aniTime, { scale: 1 }, { easing: 'backOut' }).call(() => {
                // 弹窗已经完全展示
                this.onShow();
                swallowNode.removeFromParent(true);
                swallowNode.destroy();
                this.recursiveUpdateWigetForced(this.node.parent);
            }).start();
        } else {
            this.mask.active = true;
            this.main.active = true;
            this.node.active = true;
        }
    }

    /**
     * 隐藏弹窗
     * !!!子类重写的话一定要记得调用finishCallback
     * @param ani 是否使用隐藏动画
     */
    public hide(ani: boolean = true): void {
        if (ani) {
            // 拦截点击事件
            if (!this.blocker) {
                this.blocker = new cc.Node('blocker');
                this.blocker.addComponent(cc.BlockInputEvents);
                this.blocker.setParent(this.node);
                this.blocker.setContentSize(this.node.getContentSize());
            }
            this.blocker.active = true;
            // 播放背景动画
            cc.tween(this.mask).delay(this.aniTime * 0.2).to(this.aniTime * 0.8, { opacity: 0 }).call(() => {
                this.mask.active = false;
            }).start();
            // 播放主题动画
            cc.tween(this.main).to(this.aniTime, { scale: 0 }, { easing: 'backIn' }).call(() => {
                // 取消拦截
                this.blocker.active = false;
                // 关闭节点
                this.main.active = false;
                this.node.active = false;
                // 弹窗已经完全隐藏（动画结束）
                this.onHide();
                // 弹窗完成回调（该回调为 PopupManager 专用）
                // 用来通知PopupMng该窗口关闭了
                // 注意：子类重写 hide 函数时记得调用该回调
                if (this.finishCallback) {
                    this.finishCallback();
                    this.finishCallback = null;
                }
            }).start();
        } else {
            // 关闭节点
            this.mask.active = false;
            this.main.active = false;
            this.node.active = false;
            // 弹窗已经完全隐藏（动画结束）
            this.onHide();
            // 弹窗完成回调（该回调为 PopupManager 专用）
            // 用来通知PopupMng该窗口关闭了
            // 注意：子类重写 hide 函数时记得调用该回调
            if (this.finishCallback) {
                this.finishCallback();
                this.finishCallback = null;
            }
        }
    }

    /**
     * 初始化（子类重写此函数以实现自定义逻辑）
     * @param options 
     */
    protected init(options: Options): void { }

    /**
     * 更新样式（子类请重写此函数以实现自定义样式）
     * @param options 弹窗选项
     */
    protected updateDisplay(options: Options): void { }

    /**
     * 设置弹窗完成回调（该回调为 PopupManager 专用）
     * @param callback 回调
     */
    public setFinishCallback(callback: Function): void {
        if (this.finishCallback) {
            return cc.warn('[PopupBase]', '无法重复指定完成回调！');
        }
        this.finishCallback = callback;
    }

    /**
     * 弹窗窗体被点击
     */
    protected onClicked() {
        if (this.touchClose) {
            this.hide();
        }
    }
}
