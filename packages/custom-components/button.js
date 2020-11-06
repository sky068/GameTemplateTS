"use strict";Vue.component("my-button", {
               dependencies: ["packages://inspector/share/gray-material.js"],
               template:
                `
                <ui-prop
                v-prop="target.target"
                :multi-values="multi"
              ></ui-prop>
          
              <div class="horizontal layout end-justified" style="padding:5px 0;margin-bottom:5px;">
                <ui-button class="blue tiny"
                  @confirm="resetNodeSize"
                  v-disabled="_checkResizeToTarget(target.target, multi)"
                >
                  Resize to Target
                </ui-button>
              </div>
              <ui-prop
                v-prop="target.interactable"
                :multi-values="multi"
              >
              </ui-prop>

              <ui-prop
                v-prop="target.enableAutoGrayEffect"
                v-show="_autoGrayEffectEnabled()"
                :multi-values="multi"  
              ></ui-prop>
              <cc-gray-section
                v-if="_autoGrayEffectEnabled() && target.enableAutoGrayEffect.value"
                :target.sync="target" 
                :multi-values="multi"
              ></cc-gray-section>
              <ui-prop
                v-prop="target.transition"
                :multi-values="multi"
              ></ui-prop>
          
              <div v-if="_checkTransition(target.transition, 1, multi)">
                <ui-prop indent=1
                  v-prop="target.normalColor"
                  :multi-values="multi"
                ></ui-prop>
                <ui-prop indent=1
                  v-prop="target.pressedColor"
                  :multi-values="multi"
                ></ui-prop>
                <ui-prop indent=1
                  v-prop="target.hoverColor"
                  :multi-values="multi"
                ></ui-prop>
                <ui-prop indent=1
                  v-prop="target.disabledColor"
                  :multi-values="multi"
                ></ui-prop>
                <ui-prop indent=1
                  v-prop="target.duration"
                  :multi-values="multi"
                ></ui-prop>
              </div>
          
              <div v-if="_checkTransition(target.transition, 2, multi)">
                <ui-prop indent=1
                  v-prop="target.normalSprite"
                  :multi-values="multi"
                ></ui-prop>
                <ui-prop indent=1
                  v-prop="target.pressedSprite"
                  :multi-values="multi"
                ></ui-prop>
                <ui-prop indent=1
                  v-prop="target.hoverSprite"
                  :multi-values="multi"
                ></ui-prop>
                <ui-prop indent=1
                  v-prop="target.disabledSprite"
                  :multi-values="multi"
                ></ui-prop>
              </div>
          
              <div v-if="_checkTransition(target.transition, 3, multi)">
                <ui-prop indent=1
                  v-prop="target.duration"
                  :multi-values="multi"
                ></ui-prop>
                <ui-prop indent=1
                  v-prop="target.zoomScale"
                  :multi-values="multi"
                ></ui-prop>
              </div>

              // 扩展触发音效支持
              <ui-prop
                v-prop="target.clickAudio"
                :multi-values="multi"
              ></ui-prop>

              // 扩展使用多边形检测支持
              <ui-prop
                v-prop="target.usePolygonCollider"
                :multi-values="multi" @change='updatePolygonCollider()'
              ></ui-prop>

              <cc-array-prop :target.sync="target.brightTargets"></cc-array-prop>
              <cc-array-prop :target.sync="target.clickEvents"></cc-array-prop>
                `,
               props: {
                 target: { twoWay: !0, type: Object },
                 multi: { type: Boolean },
               },
               methods: {
                 T: Editor.T,
                 updatePolygonCollider() {
                    console.log('updatePolygonCollider');
                },
                 resetNodeSize() {
                   var t = {
                     id: this.target.uuid.value,
                     path: "_resizeToTarget",
                     type: "Boolean",
                     isSubProp: !1,
                     value: !0,
                   };
                   Editor.Ipc.sendToPanel("scene", "scene:set-property", t);
                 },
                 _autoGrayEffectEnabled() {
                   return (
                     2 !== this.target.transition.value ||
                     !this.target.disabledSprite.value.uuid
                   );
                 },
                 _checkResizeToTarget: (t, n) => !!n || !t.value.uuid,
                 _checkTransition: (t, n, e) =>
                   e ? t.values.every((t) => t === n) : t.value === n,
               },
             });