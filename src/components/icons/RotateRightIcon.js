/**
 * Created by lundfall on 12/08/16.
 */

import {BaseIcon}                  from 'arva-kit/icons/BaseIcon.js';
import iconImage                   from './rightTurn.svg.txt!text';

export class RotateRightIcon extends BaseIcon {
    constructor(options){
        super({...options, icon: iconImage});
    }
}