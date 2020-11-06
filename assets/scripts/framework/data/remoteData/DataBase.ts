/**
 * Created by xujiawei on 2020-07-08 15:02:02
 */

export class DataBase {
    // 从服务器请求下来的数据
    updateData (data: any) {
        if (typeof(data) != 'object') {
            data = JSON.parse(data);
        }
        for (let k in data) {
            if (this.hasOwnProperty(k) && data[k] != undefined) {
                this[k] = data[k];
            }
        }
     }
}