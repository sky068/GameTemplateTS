/**
 * Created by xujiawei on 2020-07-07 11:53:00
 * 
 *  圆形进度条
 *  把bar 的填充模式设为 cc.Sprite.Type.FILLED
 *  fillStart系统默认0从右侧为起点，一般我们设置为0.25从正上方为起点开始
 *  fillCenter系统默认是(0, 0)，一般我们设为(0.5, 0.5)
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class ProgressCircle extends cc.Component {
    @property(cc.Sprite)
    bar: cc.Sprite = null;

    @property
    _progress: number = 0;

    @property({
        min: 0,
        max: 1
    })
    set progress(p: number) {
        this._progress = p;
        this.updateProgress();
    }
    get progress() {
        return this._progress;
    }

    speed: number = 0;
    desProgress: number = 0;
    progressCb: ()=>void = null;

    private updateProgress() {
        if (!this.bar || this.bar.type != cc.Sprite.Type.FILLED) {
            cc.error("圆形进度条的bar必须设为filled模式。");
            return;
        }
        this.bar.fillRange = this.progress;
    }

     /**
     * 设置进度
     * @param t
     * @param p
     * @param cb
     */
    setProgressBarToPercent(t: number, p: number, cb: ()=>void) {
        if (t <= 0) {
            this.progress = p;
            if (cb) {
                cb();
            }
            return;
        }
        this.unscheduleAllCallbacks(); // 若在进度中则停止重新开始
        this.speed = (p-this.progress) / t;
        this.desProgress = p;
        this.progressCb = cb;
        this.schedule(this.updateProgressBar.bind(this), 0);
    }

    updateProgressBar(dt: number) {
        if ((this.speed > 0 && this.progress < this.desProgress)
            || (this.speed < 0 && this.progress > this.desProgress)) {
            this.progress += this.speed * dt;
        } else {
            this.progress = this.desProgress;
            this.unscheduleAllCallbacks();
            if (this.progressCb) {
                this.progressCb();
            }
        }
    }
}