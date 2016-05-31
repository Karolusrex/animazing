/**
 * Created by lundfall on 4/28/16.
 */
import Surface               from 'famous/core/Surface.js';

import {View}                from 'arva-js/core/View.js';
import {layout, options}     from 'arva-js/layout/decorators.js';

export class AnimatedHamburger extends View {
    constructor(options){
        super(options);
        for(let [renderableName, renderable] of Object.entries(options.renderables)){
            this.addRenderable(renderable, renderableName);
        }

        this.layouts.push()
    }

}