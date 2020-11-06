/**
 * Created by xujiawei on 2020-07-08 15:37:27
 */

import { gameHttp } from './GameHttp';
import { DataMng } from '../../data/remoteData/DataMng';
import { isString } from '../../common/TypeOf';

function generateData(resp) {
    let data = resp.getBody();
    if (isString(data)) {
        data = JSON.parse(data);
    }

    let ret: any = {};
    ret.json = () => {
        return Promise.resolve(data);
    }
    ret.text = () => {
        return Promise.resolve(resp.getBody());
    }
    return ret;
}

function testFetch(url: string, options) {
    return new Promise((resolve, reject) => {
        let method = options.method;
        if (method == "GET") {
            gameHttp.httpGet(url, (resp) => {
                if (resp.isOk()) {
                    cc.log("get rq suc: " + url);
                    resolve(generateData(resp));
                } else {
                    let body = resp.getBody();
                    if (typeof body == 'object') {
                        body = JSON.stringify(body);
                    }
                    cc.log("get rq failed->" + url, resp.getError().message);
                    reject(resp.getError());
                }
            }, options);
        } else {
            gameHttp.httpPost(url, options.body || {}, (resp) => {
                if (resp.isOk()) {
                    cc.log("post rq suc: " + url);
                    resolve(generateData(resp));
                } else {
                    let body = resp.getBody();
                    if (typeof body == 'object') {
                        body = JSON.stringify(body);
                    }
                    cc.log("get rq failed->" + url, resp.getError().message);
                    reject(resp.getError());
                }
            }, options);
        }
    });
}

export {
    testFetch
}