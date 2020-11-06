/**
 * 客户端配置
 * 不同的环境使用不同的配置文件(在脚本构建时把对应的config改名为clientConfigLocal.json, 如果已经存在clientConfigLocal.json文件则先删除)
 * clientConfigLocal优先级最高，文件如果存在则会覆盖clientConfig文件的内容
 * ！！！注意 clientConfigLocal.json不要提交git，仅供本地测试用
 */

export class ClientConfig {
    static DEV_ENV: number = 0; // 环境，0:debug， 1:alpha， 2: release
    static GAME_VERSION: string = '';
    static GAME_BUILD: number = 0;
    static CHANNEL: string = '';
    static BUILD_TIME: string = '';
    static SERVER_ROOT: string = '';
    static HOT_UPDATE_OPEN: boolean = false;
    static BASE_LOCAL_VERSION: string = '';
    static HOT_UPDATE_SUB_PATH: string = "pt/download";

    static initConfig(json) {
        const keys = Object.keys(json);
        for (let key of keys) {
            ClientConfig[key] = json[key];
        }
    }

    static async loadConfig() {
        function loadConfigDefault() {
            return new Promise((resolve, reject)=>{
                cc.resources.load('config/clientConfig', cc.JsonAsset, (err, json: cc.JsonAsset)=>{
                    if (err) {
                        reject(err);
                    } else {
                        ClientConfig.initConfig(json.json);
                        resolve();
                    }
                });
            });
        }

        function loadConfigLocal() {
            return new Promise((resolve, reject)=>{
                // local文件有可能不存在
                cc.resources.load('config/clientConfigLocal', cc.JsonAsset, (err, json: cc.JsonAsset)=>{
                    if (!err) {
                        ClientConfig.initConfig(json.json);
                    }
                    resolve();
                });
            });
        }

        await loadConfigDefault();
        await loadConfigLocal();
    }
}