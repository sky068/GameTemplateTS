/**
 * Created by xujiawei on 2020-07-03 16:44:17
 */

const { ccclass, property } = cc._decorator;
@ccclass
export class ButtonSafe extends cc.Component {
    @property({
        tooltip: "按钮保护时间，指定间隔内只能点击一次."
    })
    safeTime: number = 0.5;

    clickEvents: cc.Component.EventHandler[] = [];

    start() {
        let button = this.getComponent(cc.Button);
        if (!button) {
            return;
        }
        cc.log('button safe valid, t:', this.safeTime);
        this.clickEvents = button.clickEvents;

        this.node.on('click', () => {
            button.clickEvents = [];
            this.unscheduleAllCallbacks();
            this.scheduleOnce((dt) => {
                button.clickEvents = this.clickEvents;
            }, this.safeTime);
        }, this);
    }
}