/**
 * Created by xujiawei on 2020-07-03 20:22:00
 * 开关组件
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class SwitchControl extends cc.Component {
    @property
    _isOn: boolean = true;

    @property
    set isOn(on: boolean) {
        this.setIsOn(on, true);
    }
    get isOn(): boolean {
        return this._isOn;
    }

    @property
    interactable: boolean = true;

    @property(cc.Sprite)
    bgOnSp: cc.Sprite = null;

    @property(cc.Sprite)
    bgOffSp: cc.Sprite = null;

    @property(cc.Sprite)
    barSp: cc.Sprite = null;

    @property([cc.Component.EventHandler])
    switchEvents: cc.Component.EventHandler[] = [];

    setIsOn(isOn: boolean, withAni: boolean) {
        this._isOn = isOn;
        this.updateState(withAni);
    }

    private updateState(ani) {
        let posX = this.isOn ? this.bgOffSp.node.x : this.bgOnSp.node.x ;
        if (CC_EDITOR || !ani) {
            this.barSp.node.x = posX;
        } else {
            this.barSp.node.stopAllActions();
            this.barSp.node.runAction(cc.moveTo(0.1, cc.v2(posX, this.barSp.node.y)));
        }
    }

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }
    
    onClick (event) {
        if (!this.interactable){
            return;
        }
        this.isOn = !this.isOn;
        if (this.switchEvents){
            cc.Component.EventHandler.emitEvents(this.switchEvents, this);
        }
    }
}