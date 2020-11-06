/**
 * Created by xujiawei on 2020-07-06 19:52:00
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class ShaderUtils {    
    static Shader = {
        Normal: '2d-sprite',
        Gray: '2d-gray-sprite',
        Bright: 'materials/bright',
    }

    static setShader(renderComp: cc.RenderComponent, shader: string) {
        if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
            return;
        }

        if (shader == this.Shader.Bright) {
            cc.loader.loadRes(shader, cc.Material, (err, material)=>{
                if (err) {
                    cc.log('设置高亮材质失败!error: ', err.message);
                } else {
                    let matierialVar = cc.MaterialVariant.create(material, renderComp);
                    renderComp.setMaterial(0, matierialVar);
                }
            });
        } else {
            let material = cc.MaterialVariant.createWithBuiltin(shader, renderComp);
            if (material) {
                renderComp.setMaterial(0, material);
            } else {
                cc.log("ShaderUtils: matrial: " + shader + " is not exsit");
            }
        }
    }
}