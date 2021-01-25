/**
 * Created by xujiawei on 2020-07-07 11:08:07
 * 
 * 为cc.ProgressBar补充设置进度的过渡动画
 */

const { ccclass, property } = cc._decorator;


@ccclass 
export class ProgressBar extends cc.ProgressBar {
    speed: number = 0;
    desProgress: number = 0;
    progressCb: ()=>void = null;

    /**
     * 
     * @param t 时间
     * @param p 目标进度
     * @param cb 完成回调
     */
    setProgressBarToPercent(t: number, p: number, cb: ()=>void) {
        if (t <= 0) {
            this.progress = p;
            if (cb) {
                cb();
            }
            return;
        }
        this.unscheduleAllCallbacks();
        p = Math.min(p, 1);
        p = Math.max(p, 0);
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