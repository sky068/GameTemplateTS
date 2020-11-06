/**
 * Created by xujiawei on 2020-07-07 16:34:07
 */

/**
 * 默认的Http超时时间，毫秒
 * @const {number}
 */
const DEFAULT_HTTP_TIMEOUT = 10000;

/**
 * @enum {string}
 */
let HttpError = {
    TIMEOUT: 'timeout',
    ERROR: 'error',
    ABORT: 'abort',
    OTHER: 'other_error' 
};

/**
 * 统一封装Http的响应，方便使用。
 * 目前暂时只支持XMLHttpRequest。
 * @type {HttpResponse}
 */
class HttpResponse {
    /**
     * @type {XMLHttpRequest}
     */
    private xhr_: XMLHttpRequest = null;
    private error_: any = null;

    init(xhr: XMLHttpRequest) {
        this.xhr_ = xhr;
    }

    /**
    * 请求是否成功并且正确
    * @returns {boolean}
    */
    isOk(): boolean {
        let xhr = this.xhr_;
        return xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207);
    }

    /**
     * Response的数据，
     * @returns {(string|ArrayBuffer|Blob|Object|Document)}
     */
    getBody() {
        return this.xhr_.response;
    }

    /**
     * @param {!HttpError} error
     */
    setError(error) {
        this.error_ = error;
    }

    /**
     * 错误原因，可能为：'timeout', 'error', 'abort'
     * 当isOk()返回false时有效。
     * @returns {?HttpError}
     */
    getError() {
        return this.error_;
    }

    /**
     * 返回所有的Http Response Header
     * @returns {object.<string, Array.<string>>} 每一个key，可能会有多个值
     */
    getHeaders() {
        // todo: 需要实现
    }

    /**
     * 返回指定的Http Response Header
     * @param {string} name Header名字
     * @returns {Array.<string>} 如果不存在，返回[]
     */
    getHeader(name) {
        // todo: 需要实现
    }
}

/**
 * 注册XmlHttpRequest的事件
 * @param {XMLHttpRequest} xhr
 * @param {function} callback
 * @private
 */
let registerEventsForXmlHttpRequest_ = function(xhr, callback) {
    let r = new HttpResponse();
    r.init(xhr);

    xhr.onreadystatechange = function (evt) {
        if (xhr.readyState == 4 ) {
            // mark: response.status可能是500等问题
            if (!r.isOk()) {
                r.setError(new Error(HttpError.OTHER + ', ' + xhr.status + ' ' + xhr.statusText));
            }
            callback(r);
        }
    };

    xhr.ontimeout = function(evt) {
        r.setError(new Error(HttpError.TIMEOUT));
        callback(r);
    };

    xhr.onerror = function (evt) {
        r.setError(new Error(HttpError.ERROR));
        callback(r);
    };

    xhr.onabort = function (evt) {
        r.setError(new Error(HttpError.ABORT));
        callback(r);
    };
};

function httpGet(url: string, callback, options?:{timeout?:number, headers?: any}) {
    let xhr = cc.loader.getXMLHttpRequest();
    let opt_timeout = options.timeout;
    xhr.timeout = opt_timeout ? opt_timeout : DEFAULT_HTTP_TIMEOUT;
    if(callback){
        registerEventsForXmlHttpRequest_(xhr, callback);
    }
    xhr.open('GET', url, true);

    let headers = options.headers;
    if (headers) {
        for (let key in headers) {
            xhr.setRequestHeader(key, String(headers[key]));
        }
    }

    // xhr.setRequestHeader("Accept-Encoding","gzip,deflate");
    // 必须放在open()之后。否则jsb的实现会判断url如果以.json结尾，则设为JSON类型
    //xhr.responseType = 'arraybuffer';

    xhr.send();
}

/**
 * Http Post请求
 * @param url
 * @param data{String} 数据
 * @param callback
 * @param opt_timeout
 */
function httpPost(url: string, data: any, callback, options?:{timeout?:number, headers?: any}) {
    let xhr = cc.loader.getXMLHttpRequest();
    let opt_timeout = options.timeout;
    xhr.timeout = opt_timeout ? opt_timeout : DEFAULT_HTTP_TIMEOUT;
    if (callback){
        registerEventsForXmlHttpRequest_(xhr, callback);
    }

    xhr.open('POST', url, true);
    
    let headers = options.headers;
    if (headers) {
        for (let key in headers) {
            xhr.setRequestHeader(key, String(headers[key]));
        }
    }
    // 默认使用json格式传输数据(否则服务器Express不能正确解析json格式)
    xhr.setRequestHeader("Content-Type", "application/json");
    // xhr.setRequestHeader("Accept", "application/json");
    // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");

    cc.log("===>httpPost: " + typeof data + " | " + (typeof data == 'string' ? data : JSON.stringify(data)));

    // xhr.setRequestHeader("Accept-Encoding","gzip,deflate");
    // 必须放在open()之后。否则jsb的实现会判断url如果以.json结尾，则设为JSON类型
    //xhr.responseType = 'arraybuffer';

    xhr.send(data);
}

export let gameHttp = {
    httpGet: httpGet,
    httpPost: httpPost,
}