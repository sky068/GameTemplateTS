/**
 * Created by xujiawei on 2020-07-06 11:01:46
 * 
 * 多边形按钮功能暂不能用，ts没有notify功能，set/get无法和自定义inspector进行绑定
 */

import { Sprite } from './Sprite';
import { Node } from './Node';
import { Audio } from './Audio';
import { ShaderUtils } from './../common/ShaderUtils';

const { ccclass, property, inspector, executeInEditMode, menu, help } = cc._decorator;

@ccclass
@executeInEditMode
@menu('i18n:MAIN_MENU.component.ui/Button')
@help('i18n:COMPONENT.help_url.button')
@inspector('packages://custom-components/button.js')
export class Button extends cc.Button {
    @property({
        type: cc.AudioClip,
        tooltip: '按钮点击音效'
    })
    clickAudio: cc.AudioClip = null;

    @property({
        tooltip: '是否使用多边形按钮(暂时无效)'
    })
    usePolygonCollider = false;

    // todo: 无法在inspector里进行绑定
    // @property(cc.Boolean)
    // _usePolygonCollider: boolean = false;

    // set usePolygonCollider(use) {
    //     this._usePolygonCollider = use;
    //     this._updatePolygonCollider();
    // }
    // get usePolygonCollider(): boolean {
    //     return this._usePolygonCollider;
    // }

    @property({
        type: [cc.RenderComponent],
        tooltip: '点击按钮需要高亮的渲染节点'
    })
    brightTargets: cc.RenderComponent[] = [];

    static createNode(params: any) {
        let node: cc.Node = new cc.Node();
        node.addComponent(Sprite);
        Sprite.updateNode(node, params);
        node.addComponent(Button);
        Button.updateNode(node, params);

        return node;
    }

    static updateNode(node: cc.Node, params: any) {
        let button = node.getComponent(Button);
        if (!button) {
            return;
        }

        if (params.hasOwnProperty('clickAudio')) {
            if (typeof params.clickAudio == 'string') {
                cc.loader.loadRes(params.clickAudio, cc.AudioClip, (err, clip)=>{
                    if (!err) {
                        button.clickAudio = clip;
                    }
                });
            } else {
                button.clickAudio = params.clickAudio;
            }
        }

        if (params.hasOwnProperty('usePolygonCollider')) {
            button.usePolygonCollider = !!params.usePolygonCollider;
        }

        if (params.hasOwnProperty('enableAutoGrayEffect')) {
            button.enableAutoGrayEffect = params.enableAutoGrayEffect;
        }

        if (params.hasOwnProperty('interactable')) {
            button.interactable = params.interactable;
        }

        let eventHandler = params.eventHandler;
        if (eventHandler) {
            let clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = eventHandler.target;  //这个node节点是你的事件处理代码组件所属的节点
            clickEventHandler.component = eventHandler.component;  // 这个是事件所在组件的名字
            clickEventHandler.customEventData = eventHandler.customEventData;
            clickEventHandler.handler = eventHandler.handler;
            button.clickEvents.push(clickEventHandler);
        }

        Node.updateNode(node, params);
    }

    onLoad() {
        this.node._oldHitTest = this.node._hitTest.bind(this.node);
        this.node._hitTest = this.polygonHitTest.bind(this.node);
    }

    // touch event handler
    _onTouchBegan(event) {
        if (!this.interactable || !this.enabledInHierarchy) return;

        this._pressed = true;
        this._updateState();
        event.stopPropagation();

        this.setBrightEffect(true);
    }

    _onTouchEnded(event) {
        if (!this.interactable || !this.enabledInHierarchy) return;

        if (this._pressed) {
            cc.Component.EventHandler.emitEvents(this.clickEvents, event);
            this.node.emit('click', this);
            if (this.clickAudio) {
                Audio.playEffect(this.clickAudio);
            }
        }
        this._pressed = false;
        this._updateState();
        event.stopPropagation();

        this.setBrightEffect(false);
    }

    _onTouchCancel () {
        if (!this.interactable || !this.enabledInHierarchy) return;

        this._pressed = false;
        this._updateState();

        this.setBrightEffect(false);
    }

    polygonHitTest(point, listener) {
        // 这里的this其实是指node
        let polygon = this.getComponent(cc.PolygonCollider);
        if (polygon) {
            let camera = cc.Camera.findCamera(this);
            let cameraPt = cc.v2();
            if (camera) {
                camera.getScreenToWorldPoint(point, cameraPt);
            }
            else {
                cameraPt.set(point);
            }

            cameraPt = this.convertToNodeSpaceAR(cameraPt);

            return cc.Intersection.pointInPolygon(cameraPt, polygon.points);
        } else {
            return this._oldHitTest(point, listener);
        }
    }

    updatePolygonCollider(): void {
        let polygon: cc.PolygonCollider = this.getComponent(cc.PolygonCollider);
        if (!this.usePolygonCollider && polygon) {
            this.node.removeComponent(cc.PolygonCollider);
        } else {
            if (!polygon) {
                polygon = this.node.addComponent(cc.PolygonCollider);
            }
            // 重新生成points
            cc.log('需要生成多边形ponits');
            if (CC_EDITOR) {
                this.resetPointsByContour(polygon);
            }
        }
    }

    private resetPointsByContour(polygon: cc.PolygonCollider) {
        let PhysicsUtils = Editor.require('scene://utils/physics');
        PhysicsUtils.resetPoints(polygon, { threshold: polygon.threshold });
    }

    private setBrightEffect(bright) {
        if (this.brightTargets.length != 0) {
            let shader = bright ? ShaderUtils.Shader.Bright : ShaderUtils.Shader.Normal;

            for (const i in this.brightTargets) {
                let _rendCmp = this.brightTargets[i];
                let material = _rendCmp.getMaterial(0);
                // 置灰状态无高亮
                if (material == this.grayMaterial) {
                    return;
                }
                ShaderUtils.setShader(_rendCmp, shader);
            }
        }
    }
}