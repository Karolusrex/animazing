/**
 * Created by lundfall on 12/08/16.
 */

import {BaseIcon}                  from 'arva-kit/icons/views/BaseIcon.js';
import iconImage                   from './play.svg.txt!text';

export class PlayIcon extends BaseIcon {
    constructor(options){
        super({...options, icon: iconImage});
    }
}