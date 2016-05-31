/**
 * Created by lundfall on 5/31/16.
 */

import {View}               from 'arva-js/core/View.js';
import Surface              from 'famous/core/Surface.js';


export class Shape extends View{
    constructor(options){
        super(options);
        options.renderableType = options.renderableType || Surface;
        options.colorScheme = options.colorScheme || ['#2ecc71','#8e44ad', '#27ae60','#d35400','#e67e22','#9b59b6'];

        for([i, renderableName] of Object.keys(options.shape).entries()){
            this.addRenderable(new options.renderableType({
                properties: {
                    backgroundColor: [options.colorScheme][i]
                }}),renderableName);
        }
        this.layouts.push((context) => {
            for([renderableName,spec] of Object.entries(options.shape)){
                context.set(renderableName, spec);
            }
        });
    }

}