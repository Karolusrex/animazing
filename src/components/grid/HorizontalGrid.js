/**
 * Created by lundfall on 6/13/16.
 */
import Surface               from 'famous/core/Surface.js';

import {View}                from 'arva-js/core/View.js';
import {layout, options}     from 'arva-js/layout/decorators.js';


export class HorizontalGrid extends View {
    constructor(options){
        super(options);
        this._noLines = 5;
        for(let i=0;i<this._noLines-1;i++){
        /* In order to make thinner lines, we set double the size and scale it down by 2 */
            this.addRenderable(new Surface({properties: {borderTop: `${this.options.borderThickness} ${i === Math.floor(this._noLines/2) || i === Math.ceil(this._noLines/2) ? 'solid': 'dashed'} ${this.options.color}`}}),`top${i}`);
        }
        this.addRenderable(new Surface({properties: {borderTop: `${this.options.borderThickness} dashed ${this.options.color}`,borderBottom: `${this.options.borderThickness} dashed ${this.options.color}`}}),`top${this._noLines-1}`);

        this.layouts.push((context) => {
            for(let i=0;i<this._noLines;i++){
                context.set(`top${i}`,{
                    size: [context.size[0]*2,context.size[1]*0.4],
                    translate: [0, i*context.size[0]*0.2, 0],
                    scale: [0.5, 0.5]
                });
            }
        })
    }

}