/**
 * Created by xujiawei on 2020-07-03 15:51:56
 */

export class UI {
    /**
    * 通用工具
    * 全场景查找节点
    */
    static seekChildByName(root: cc.Node, name: string): cc.Node | undefined {
        if (root.name == name) {
            return root;
        }

        for (const i in root.children) {
            const child = root.children[i];
            if (child) {
                let res = UI.seekChildByName(child, name);
                if (res) return res;
            }
        }
    }

    /**
     * 通用UI效果
     */
    static bgScaleAction(node: cc.Node, params: any = {}): void {
        node.scale = 0.5;
        let seq = cc.sequence(
            cc.scaleTo(0.2, 1.05).easing(cc.easeSineOut()),
            cc.scaleTo(0.15, 1.0).easing(cc.easeSineOut()),
            cc.callFunc(function () {
                if (params.callback) params.callback();
            })
        );
        node.runAction(seq);
    }

    // 数字放大
    static numScaleAction(node: cc.Node, params: any = {}): void {
        node.stopAllActions();
        let seq = cc.sequence(
            cc.scaleTo(0.1, 1.2).easing(cc.easeSineOut()),
            cc.scaleTo(0.1, 0.8).easing(cc.easeSineInOut()),
            cc.scaleTo(0.1, 1.1).easing(cc.easeSineInOut()),
            cc.scaleTo(0.1, 0.95).easing(cc.easeSineInOut()),
            cc.scaleTo(0.1, 1).easing(cc.easeSineInOut()),
        );
        node.runAction(seq);
    }

    // 按钮缩放效果
    static btnScaleActoin(btnList: cc.Node[]): void {
        for (const i in btnList) {
            let btn = btnList[i];
            let btnScale = btn.scale;
            btn.stopAllActions();
            btn.scale = btnScale / 4;
            btn.runAction(cc.sequence(
                cc.scaleTo(0.12, btnScale + 0.1),
                cc.scaleTo(0.08, btnScale - 0.1),
                cc.scaleTo(0.08, btnScale),
            ));
        }
    }

    // 屏幕震动
    static shakeScreen(params: any): void {
        let node = params.node; // 节点
        let times = params.times ? params.times : 1; // 次数
        let offsetX = params.hasOwnProperty('offsetX') ? params.offsetX : 20; // 偏移宽度
        let offsetY = params.hasOwnProperty('offsetY') ? params.offsetY : 20; // 偏移高度
        let ratio = params.ratio ? params.ratio : 1; // 递增系数
        let rate = params.rate ? params.rate : 1 / 15; // 帧率

        // 原始Pos
        let basePosition = node.basePosition ? node.basePosition : node.position;
        node.stopAllActions();
        node.setPosition(basePosition);

        node.basePosition = basePosition;

        let actArray = [];

        let moveAction = cc.moveBy(rate, cc.v2(offsetX, offsetY)).easing(cc.easeOut(1.0));
        actArray.push(moveAction);

        for (let i = 0; i < times - 1; i++) {
            let moveAction_1 = cc.moveBy(rate, cc.v2(-offsetX * 2, -offsetY * 2)).easing(cc.easeOut(1.0));
            actArray.push(moveAction_1);

            let moveAction_2 = cc.moveBy(rate, cc.v2(offsetX * 3 / 2, offsetY * 3 / 2)).easing(cc.easeOut(1.0));
            actArray.push(moveAction_2);

            offsetX = offsetX / ratio;
            offsetY = offsetY / ratio;
        }

        let backAction = cc.moveTo(rate, basePosition).easing(cc.easeOut(1.0));
        actArray.push(backAction);

        node.runAction(cc.sequence(actArray));
    }

    /**
     * 创建节点并飞到指定目标点
     * @param node 要飞的节点（比如金币等,可以是Node或者Prefab)
     * @param startPos {cc.Vec2} 起点坐标（注意要世界坐标）
     * @param endPos {cc.Vec2} 终点坐标 （注意要世界坐标）
     * @param num 创建的数量
     * @param cb 飞完结束的回调
     */
    static flyNode(node: cc.Node, parent: cc.Node, startPos: cc.Vec2, endPos: cc.Vec2, num: number, cb: any) {
        if (num <= 0) {
            return;
        }
        startPos = parent.convertToNodeSpaceAR(startPos);
        endPos = parent.convertToNodeSpaceAR(endPos);
        let count = 0;
        for (let i = 0; i < num; i++) {
            let fly: cc.Node = cc.instantiate(node);
            fly.position = cc.v3(startPos);
            fly.parent = parent;

            let midPos = startPos.add(endPos).div(2); // 起始点中心点的坐标
            let midPosVec = midPos.sub(startPos); // 中心点到起点的向量

            // 向量最多旋转50度，间隔5度一个单位，最多旋转180度
            let rotate = Math.round(Math.random() * 10) * 5 * (Math.random() > 0.5 ? 1 : -1); // 向量随机旋转角度
            let desPosVec = midPosVec.rotate(rotate * Math.PI / 180);
            let desPos = startPos.add(desPosVec);
            let distance = Math.sqrt(Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));

            // 执行贝塞尔曲线
            let bezierList = [desPos, desPos, endPos];
            let bezier = cc.bezierTo(distance / 3000 + Math.random() * 0.5, bezierList);
            let seq = cc.sequence(bezier, cc.callFunc(() => {
                count++;
                if (cb) {
                    cb(count >= num);
                }
                fly.destroy();
            }));

            fly.runAction(seq);
        }
    }

    //---------------------模拟屏幕点击--------------------
    static getHTMLElementPosition(element) {
        let docElem = document.documentElement;
        let leftOffset = window.pageXOffset - docElem.clientLeft;
        let topOffset = window.pageYOffset - docElem.clientTop;
        if (typeof element.getBoundingClientRect === 'function') {
            let box = element.getBoundingClientRect();
            return {
                left: box.left + leftOffset,
                top: box.top + topOffset,
                width: box.width,
                height: box.height
            };
        }
        else {
            if (element instanceof HTMLCanvasElement) {
                return {
                    left: leftOffset,
                    top: topOffset,
                    width: element.width,
                    height: element.height
                };
            }
            else {
                return {
                    left: leftOffset,
                    top: topOffset,
                    width: parseInt(element.style.width),
                    height: parseInt(element.style.height)
                };
            }
        }
    }

    // x,y世界坐标
    static touchSimulation(x: number, y: number) {
        let rect;
        //兼容2.2.x 与 2.3.2
        let inputManager = window._cc ? window['_cc'].inputManager : cc.internal.inputManager;
        if (cc.sys.isBrowser) {
            let canvas = document.getElementById("GameCanvas");
            rect = this.getHTMLElementPosition(canvas);
        } else {
            rect = cc.view.getFrameSize();
            rect.left = 0;
            rect.top = 0;
        }

        // 将x,y从Creator世界坐标转换到设备窗口坐标
        let vp = cc.view.getViewportRect();
        let sx = cc.view.getScaleX();
        let sy = cc.view.getScaleY();
        let ratio = cc.view.getDevicePixelRatio();
        let htmlx = (x * sx + vp.x) / ratio + rect.left;
        let htmly = rect.top + rect.height - (y * sy + vp.y) / ratio;
        let pt = cc.v2(htmlx, htmly);

        console.log(`模拟点击坐标：${pt.x}, ${pt.y}`);
        let touch = inputManager.getTouchByXY(pt.x, pt.y, rect);
        inputManager.handleTouchesBegin([touch]);
        setTimeout(() => {
            inputManager.handleTouchesEnd([touch]);
        }, 200);
    }
    //-------------------------------------------------------
}