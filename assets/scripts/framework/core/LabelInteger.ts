/**
 * Created by xujiawei on 2020-07-03 18:20:59
 * 
 * 专门用来显示数字的Label，实现滚动效果和逗号分隔以及时间戳转日期
 * !!!通过设置{this.value}来显示数值，不要使用{this.string}来赋值
 */


/**
 * 
 * @param s 秒
 */
function formatTime(s: number): string {
    let t: string = '';
    if (s >= 0) {
        let hour: number = Math.floor(s / 3600);
        let min: number = Math.floor(s / 60) % 60;
        let sec: number = s % 60;
        let day: number = Math.floor(hour / 24);
        if (day == 1) {
            return day + " day";
        }
        if (day > 1) {
            return day + " days";
        }

        if (day > 0) {
            hour = hour - 24 * day;
            t = day + "day " + ('00' + hour).slice(-2) + ":";
        }
        else if (hour > 0) {
            t = ('00' + hour).slice(-2) + ":";
        } else {
            t = "";
        }

        if (min < 10) {
            t += "0";
        }
        t += min + ":";
        if (sec < 10) {
            t += "0";
        }
        t += sec;
    }

    return t;
}

const LabelFormatType = cc.Enum({
    None: 0,  // 不格式化
    ThousandSeparator: 1,  // 3位分隔
    FormatTime: 2,  // 格式化时间
});

const { ccclass, property } = cc._decorator;
@ccclass
export class LabelInteger extends cc.Label {
    static LabelFormatType = LabelFormatType;

    @property({
        type: LabelFormatType
    })
    formatType = LabelFormatType.None;

    @property({
        tooltip: '动画时间',
    })
    animationDuration: number = 0.5;

    // label的实际数值
    @property
    _value: number = 0;

    @property({
        tooltip: '通过value来设置显示的内容',
        override: true,
        type: cc.Integer,
        min: 0,
        step: 1,
    })
    get value(): number {
        return this._value;
    }
    set value(val: number) {
        this._value = val;
        let valStr = '';
        switch(this.formatType){
            case LabelFormatType.ThousandSeparator:
            {
                valStr = val.toString().split('').reverse().join('').replace(/(\d{3}(?=\d)(?!\d+\.|$))/g, '$1,').split('').reverse().join('');
            }
                break;
            case LabelFormatType.FormatTime:
            {
                valStr = formatTime(val);
            }
                break;
        }
        this.string = valStr;
    }

    private _curValue: number = 0;
    private _toValue: number = 0;
    private _delta: number = 0;

    /**
     * 设置数值（可以显示滚动动画）
     * @param val 
     * @param animate 
     */
    setValue(val: number, animate: boolean): void {
       if (animate) {
           this._toValue = val;
       } else {
           this._toValue = val;
           this._curValue = val;
           this.value = val;
       }
       this._delta = 0;
    }

    lateUpdate(dt: number): void {
        if (this._toValue != this._curValue) {
            if (this._delta == 0) {
                this._delta = this._toValue - this._curValue;
            }
            let step = dt / this.animationDuration * this._delta;
            if (this._delta > 0) {
                step = Math.floor(step);
                if (step == 0) {
                    step = 1;
                }
                this._curValue += step;
                this._curValue = Math.min(this._curValue, this._toValue);
            } else {
                step = -step;
                step = Math.floor(step);
                if(step == 0){
                    step = 1;
                }
                this._curValue -= step;
                this._curValue = Math.max(this._curValue, this._toValue);
            }

            this.value = this._curValue;
            if (this._toValue == this._curValue) {
                this._delta = 0;
            }
        }
    }

}