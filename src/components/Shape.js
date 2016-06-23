/**
 * Created by lundfall on 5/31/16.
 */

import {View}               from 'arva-js/core/View.js';
import Surface              from 'famous/core/Surface.js';
import {layout}             from 'arva-js/layout/decorators.js';

import {specAttributes, shapeBoundingBox}     from '../util/SpecProcessing.js';

export class Shape extends View{
    constructor(options){
        super(options);
        options.renderableType = options.renderableType || Surface;
        options.colorScheme = options.colorScheme || ['#2ecc71','#8e44ad','#d35400', '#27ae60','#e67e22','#9b59b6'];
        this._boundingBox = shapeBoundingBox(options.shape);
        for(let [i, renderableName] of Object.keys(options.shape).entries()){
            this.addRenderable(new options.renderableType({
                properties: {
                    webkitBoxShadow: '1px 3px 37px 0px rgba(168,91,132,1)',
                    backgroundColor: options.colorScheme[i]
                }}),renderableName);
        }
        this.renderables.background = new Surface({properties: {backgroundColor: 'white'}});
        this.layouts.push((context) => {
            let contextSize = context.size;
            let sizeDistortion = this.getSizeDistortion(contextSize);

            context.set('background', {
                size: this.getSize().map((size) => size/sizeDistortion),
                align: [0, 0],
                origin: [0, 0],
                translate: [0, 0, -10]
            });


            for(let renderableName in options.shape){
                let spec = {};
                for(let [specAttribute,{defaultValue,dimensions}] of Object.entries(specAttributes)){
                    let attribute = options.shape[renderableName][specAttribute] || defaultValue;
                    if(specAttribute === 'align'){
                        attribute = [0, 0];
                    } else if(specAttribute === 'size'){
                        attribute = [attribute[0]/sizeDistortion, attribute[1]/sizeDistortion];
                    } else if(specAttribute === 'translate'){
                        attribute = [...attribute.entries()].map(([index, translate]) => (translate/sizeDistortion +  contextSize[index]/2) || translate);
                    }
                    spec[specAttribute] =  attribute;
                }
                context.set(renderableName, spec);
            }

        });
    }

    getSizeDistortion(contextSize){
        let size = this.getSize();
        let absoluteSizeDistortion = [...contextSize.entries()].map(([index, singleContextSize]) => Math.min(singleContextSize/size[index], size[index]/singleContextSize));
        let biggestDistortionIndex = +(absoluteSizeDistortion[1] > absoluteSizeDistortion[0]);
        return size[biggestDistortionIndex]/contextSize[biggestDistortionIndex];
    }

    getSize() {
        return this._boundingBox.size;
    }

}