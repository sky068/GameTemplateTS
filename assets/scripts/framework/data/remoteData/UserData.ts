/**
 * Created by xujiawei on 2020-07-08 15:02:37
 */

import { DataBase} from './DataBase';

export class UserData extends DataBase {
    coins: number = 0;
    diamonds: number = 0;
    shine: number = 0;
    icon: string = '';
    nickname: string = '';
    gender: number = 1; // 1boy, 2girl
}