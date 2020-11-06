/**
 * Created by xujiawei on 2020-07-09 11:37:58
 */

const { ccclass, property } = cc._decorator;

import { Person } from './Person';

@ccclass
export class Player extends Person {
    start() {
        const values = Object.values(Person.PersonAni);
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch)=>{
            let name = values[Math.floor(Math.random() * values.length)];
            cc.log('player playing ani: ', name);
            this.play(0, name, false);
            this.add(0, Person.PersonAni.BODY_STAND, true);
        }, this, true);
    }
}