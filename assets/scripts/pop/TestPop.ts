const { ccclass, property } = cc._decorator;
import PopupBase from '../framework/common/PopupBase';

/** 弹窗选项类型 */
export type TestPopOptions = {
    data: any[],
    title: string,
    cb: Function,
}

@ccclass
export class TestPop extends PopupBase<TestPopOptions> {
    @property(cc.Label)
    infoLabel: cc.Label = null;

    private cb: Function = null;

    public static path = 'prefabs/pop/TestPop';

    protected updateDisplay(options: TestPopOptions) {
        this.infoLabel.string = options.data.toString() + "\n" + options.title;
        this.cb = options.cb;
    }

    onHide() {
        this.cb();
    }
}