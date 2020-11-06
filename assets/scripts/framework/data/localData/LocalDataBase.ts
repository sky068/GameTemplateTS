/**
 * Created by xujiawei on 2020-07-08 11:53:20
 */

export class LocalDataBase {
    dataObj: any = null;
    fileDir: string = '';

    initData(data: any) {
        if (!data) {
            return;
        }

        this.dataObj = data;
    }
}