/**
 * Created by xujiawei on 2020-07-03 16:17:36
 */

const BGM = {
    MAIN: 'sounds/bgm/kob_BGM',
}

const Effect = {
    CommonClick: 'sounds/effect/common_click',
    Hammer: 'sounds/effect/Hammer Impact 3',
    BuildSuc: 'sounds/effect/Fantasy click sounds 4',
};

const { ccclass, property } = cc._decorator;
@ccclass
export class Audio {
    public static BGM = BGM;
    public static Effect = Effect;

    private static curBGMUrl: string = '';
    private static curBGMClip: cc.AudioClip = null;
    private static bgmVolume: number = 0.9;
    private static effVolume: number = 1;
    private static bgmEnabled: boolean = true;
    private static effEnabled: boolean = true;

    // 游戏启动时初始化一下
    public static init(): void {
        const bgmEnabled = cc.sys.localStorage.getItem('bgmEnabled');
        if (bgmEnabled != null && bgmEnabled == 'false') {
            this.bgmEnabled = false;
        }

        const bgmVol = cc.sys.localStorage.getItem('bgmVolume');
        if (bgmVol != null) {
            this.bgmVolume = parseFloat(bgmVol);
            cc.audioEngine.setMusicVolume(bgmVol);
        } else {
            cc.audioEngine.setMusicVolume(this.bgmVolume);
        }

        const effEnabled = cc.sys.localStorage.getItem('effEnabled');
        if (effEnabled != null && effEnabled == 'false') {
            this.effEnabled = false;
        } 

        const effVol = cc.sys.localStorage.getItem('effVolume');
        if (effVol != null) {
            this.effVolume = parseFloat(effVol);
            cc.audioEngine.setEffectsVolume(effVol);
        } else {
            cc.audioEngine.setEffectsVolume(this.effVolume);
        }
    }

    // 当前bgmurl
    public static getCurBGMUrl(): string {
        return this.curBGMUrl;
    }

    public static playBGM(url: string, force: boolean = true): void {
        // 如果已经在播放就不播了
        if (this.curBGMUrl && this.curBGMUrl == url && !force) {
            return;
        }

        this.curBGMUrl = url;

        if (!this.bgmEnabled) {
            return;
        }

        if (this.curBGMClip) {
            this.uncache(this.curBGMClip);
        }

        cc.loader.loadRes(url, cc.AudioClip, (err, clip) => {
            if (!err) {
                this.curBGMClip = clip;
                cc.audioEngine.playMusic(clip, true);
            }
        });
    }

    public static pauseBGM(): void {
        cc.audioEngine.pauseMusic();
    }

    public static resumeBGM(): void {
        cc.audioEngine.resumeMusic();
    }

    public static stopBGM(): void {
        cc.audioEngine.stopMusic();
    }

    public static playEffect(url: string | cc.AudioClip, loop: boolean = false): void {
        if (!this.effEnabled) {
            return;
        }
        if (url instanceof cc.AudioClip) {
            cc.audioEngine.playEffect(url, loop);
        } else {
            cc.loader.loadRes(url, cc.AudioClip, (err, clip) => {
                if (!err) {
                    cc.audioEngine.playEffect(clip, loop);
                }
            });
        }
    }

    public static setBGMVolume(vol: number): void {
        cc.audioEngine.setMusicVolume(vol);
        this.bgmVolume = vol;
        cc.sys.localStorage.setItem('bgmVolume', vol);
    }

    public static setEffectsVolume(vol: number): void {
        cc.audioEngine.setMusicVolume(vol);
        this.effVolume = vol;
        cc.sys.localStorage.setItem('effVolume', vol);
    }

    public static  pauseAllEffects(): void {
        cc.audioEngine.pauseAllEffects();
    }

    public static resumeAllEffects(): void {
        cc.audioEngine.resumeAllEffects();
    }

    public static setBGMEnabled (enabled: boolean) {
        if (this.bgmEnabled != enabled) {
            cc.sys.localStorage.setItem('bgmEnabled', String(enabled));
            this.bgmEnabled = enabled;
            if (this.bgmEnabled == true && this.curBGMUrl != null) {
                this.playBGM(this.curBGMUrl, true);
            } else {
                this.stopBGM();
            }
        }
    }

    public static stopALlEffects(): void {
        cc.audioEngine.stopAllEffects();
    }

    public static uncache(clip): void {
        cc.audioEngine.uncache(clip);
    }

    public static  getBGMEnabled () {
        return this.bgmEnabled;
    }

    public static getBGMVomue() {
        return this.bgmVolume;
    }

    public static setEffectsEnabled (enabled: boolean) {
        if (this.effEnabled != enabled) {
            cc.sys.localStorage.setItem('effEnabled', String(enabled));
            this.effEnabled = enabled;
            if (!enabled) {
                this.stopALlEffects();
            }
        }
    }

    public static  getEffectsEnabled () {
        return this.effEnabled;
    }

    public static  getEffectsVolume () {
        return this.effVolume;
    }
}