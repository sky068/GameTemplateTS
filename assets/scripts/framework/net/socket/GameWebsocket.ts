/**
 * Created by xujiawei on 2020-07-08 16:05:24
 */

/**
 * @enum {number}
 */
export let GameWebSocketState = cc.Enum({
    CONNECTING: 1,
    OPEN: 2,
    CLOSING: 3,
    CLOSED: 4
});

/**
 * @interface
 */
export class GameWebSocketDelegate {

    onSocketOpen() {

    }

    /**
     * 收到了消息
     * @param {string|Uint8Array} data
     */
    onSocketMessage(data) {

    }

    onSocketError() {

    }

    /**
     * 连接关闭
     * @param {string} reason
     */
    onSocketClosed(reason) {

    }
}

/**
 * @interface
 */
class GameWebSocketInterface {

    connect() {

    }

    send(data: string | Uint8Array) {

    }

    close() {

    }

    getState() {

    }
}

export class GameWebSocket extends GameWebSocketInterface {

    /**
     * @type {String} 服务器地址
     */
    private _address: string = null;

    /**
     * @type {GameWebSocketDelegate}
     */
    _delegate: GameWebSocketDelegate = null;

    /**
     * @type {WebSocket}
     */
    _webSocket: any = null;

    /**
     * @param {string} address 服务器地址
     * @param {GameWebSocketDelegate} delegate 回调接口
     */
    init(address: string, delegate: GameWebSocketDelegate) {
        this._address = address;
        this._delegate = delegate;
        this._webSocket = null;
    }

    connect() {
        cc.log('connect to ' + this._address);

        let ws = this._webSocket = new WebSocket(this._address);
        ws.onopen = this._delegate.onSocketOpen.bind(this._delegate);
        ws.onmessage = function (param) {
            this._delegate.onSocketMessage(param.data);
        }.bind(this);
        ws.onerror = this._delegate.onSocketError.bind(this._delegate);
        // function({code: Number, reason: String, wasClean: Boolean})}
        ws.onclose = function (param) {
            this._delegate.onSocketClosed(param.reason);
        }.bind(this);
    }

    /**
     * 发送数据
     * @param {string|Uint8Array} stringOrBinary
     */
    send(stringOrBinary: string|Uint8Array) {
        this._webSocket.send(stringOrBinary);
    }

    close() {
        if (!this._webSocket) {
            return;
        }

        try {
            this._webSocket.close();
        } catch (err) {
            cc.log('error while closing webSocket', err.toString());
        }
        this._webSocket = null;
    }

    getState() {
        if (this._webSocket) {
            switch (this._webSocket.readyState) {
                case WebSocket.OPEN:
                    return GameWebSocketState.OPEN;
                case WebSocket.CONNECTING:
                    return GameWebSocketState.CONNECTING;
                case WebSocket.CLOSING:
                    return GameWebSocketState.CLOSING;
                case WebSocket.CLOSED:
                    return GameWebSocketState.CLOSED;
            }
        }
        return GameWebSocketState.CLOSED;
    }
}
