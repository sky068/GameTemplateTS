/**
 * Created by xujiawei on 2020-07-08 15:28:59
 */

export class Headers {
    constructor(args = {}) {
        for (let k in args) {
          if (!args.hasOwnProperty(k)) {
            continue;
          }
          this[k] = args[k];
        }
      }
      set(k: string, v: any) {
        this[k] = v;
      }
    
      forEach(cb) {
        if (!cb) {
          return;
        }
        for (let key in this) {
          if (this.hasOwnProperty(key)) {
            cb(this[key], key, this);
          }
        }
      }
}