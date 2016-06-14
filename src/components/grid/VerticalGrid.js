/**
 * Created by lundfall on 6/13/16.
 */
import Surface               from 'famous/core/Surface.js';

import {View}                from 'arva-js/core/View.js';
import {layout, options}     from 'arva-js/layout/decorators.js';



export class VerticalGrid extends View {
    @layout.dock('left', .2)
    top = new Surface({properties: {borderLeft: `${this.options.borderThickness} dashed ${this.options.color}`}});
    @layout.dock('left', .2)
    top2 = new Surface({properties: {borderLeft: `${this.options.borderThickness} dashed ${this.options.color}`}});
    @layout.dock('left', .2)
    top3 = new Surface({properties: {borderLeft: `${this.options.borderThickness} solid ${this.options.color}`}});
    @layout.dock('left', .2)
    top4 = new Surface({properties: {borderLeft: `${this.options.borderThickness} solid ${this.options.color}`}});
    @layout.dock('left', .2)
    top5 = new Surface({properties: {
        borderLeft: `${this.options.borderThickness} dashed ${this.options.color}`,
        borderRight: `${this.options.borderThickness} dashed ${this.options.color}`
    }});


}