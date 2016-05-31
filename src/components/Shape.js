/**
 * Created by lundfall on 5/31/16.
 */

import {View}               from 'arva-js/core/View.js';
import Surface              from 'famous/core/Surface.js';

import {specAttributes}     from '../util/SpecProcessing.js';

export class Shape extends View{
    constructor(options){
        super(options);
        options.renderableType = options.renderableType || Surface;
        options.colorScheme = options.colorScheme || ['#2ecc71','#8e44ad', '#27ae60','#d35400','#e67e22','#9b59b6'];

        for(let [i, renderableName] of Object.keys(options.shape).entries()){
            this.addRenderable(new options.renderableType({
                properties: {
                    webkitBoxShadow: '1px 3px 37px 0px rgba(168,91,132,1)',
                    backgroundColor: [options.colorScheme][i]
                }}),renderableName);
        }
        this.layouts.push((context) => {
            for(let renderableName in options.shape){
                let spec = {};
                for(let [specAttribute,{defaultValue,dimensions}] of Object.entries(specAttributes)){
                    spec[specAttribute] = options.shape[renderableName][specAttribute] || defaultValue;
                }
                context.set(renderableName, spec);
            }
        });
    }

}