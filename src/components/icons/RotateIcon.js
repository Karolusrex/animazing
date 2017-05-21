/**
 * Created by lundfall on 12/08/16.
 */

import {BaseIcon}                  from 'arva-kit/icons/views/BaseIcon.js';
import iconImage                   from './rotate.svg.txt!text';

export class RotateIcon extends BaseIcon {
    constructor(options){
        super({...options, icon: iconImage});
    }
}