/**
 * Created by lundfall on 12/08/16.
 */

import {BaseIcon}                  from 'arva-kit/icons/views/BaseIcon.js';
import iconImage                   from './leftTurn.svg.txt!text';

export class RotateLeftIcon extends BaseIcon {
    constructor(options){
        super({...options, icon: iconImage});
    }
}