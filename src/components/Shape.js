/**
 * Created by lundfall on 5/31/16.
 */

import {View}               from 'arva-js/core/View.js';
import Surface              from 'famous/core/Surface.js';
import {layout}             from 'arva-js/layout/decorators.js';

import {Snappable}              from '../components/Snappable.js';

import {associateShapesInInterval,
    turnShape,
    specBoundingBoxSize, specAttributes, shapeBoundingBox}     from '../util/SpecProcessing.js';
import {ShapeSpec} from '../logic/ShapeSpecs';

//TODO Disabled the box shadow for now
let boxShadow = '';
// let boxShadow = '1px 3px 37px 0px rgba(168,91,132,1)';
export class Shape extends View{

    constructor(options){
        super(options);
        options.renderableType = options.renderableType || Surface;

        options.colorScheme = options.colorScheme || ['#2ecc71', '#8e44ad', '#d35400', '#e67e22', '#27ae60', '#9b59b6'];
        this._boundingBox = shapeBoundingBox(options.spec);

        options.spec.forEach((renderableName) => {
            this.addRenderable(new options.renderableType({
                properties: {
                    boxShadow,
                    backgroundColor: this.getColorForStick(renderableName)
                }}),renderableName);
        });

        this.layouts.push((context) => {
            let contextSize = context.size;
            let sizeDistortion = this.getSizeDistortion(contextSize);

            options.spec.forEach((renderableName, item) => {
                let spec = {};
                for(let [specAttribute,{defaultValue,dimensions}] of Object.entries(specAttributes)){
                    let attribute = item[specAttribute] || defaultValue;
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
            });

        });
    }

    getColorForStick(renderableName){
        let {colorScheme} = this.options;
        return Array.isArray(colorScheme) ? colorScheme[ShapeSpec.getBarNames().indexOf(renderableName)] : colorScheme
    }

    /**
     * Changes the spec and makes the assumption that the spec displays the same type of renderables
     * @param spec
     */
    adjustSpec(spec) {
        options.spec = spec;
    }

    enableRotation() {

    }

    getSizeDistortion(contextSize){
        let size = this.getSize();
        let absoluteSizeDistortion = [...contextSize.entries()].map(([index, singleContextSize]) => Math.min(singleContextSize/size[index], size[index]/singleContextSize));
        let biggestDistortionIndex = +(absoluteSizeDistortion[1] < absoluteSizeDistortion[0]);
        return size[biggestDistortionIndex]/contextSize[biggestDistortionIndex];
    }

    getSize() {
        return this._boundingBox.size;
    }

    getSpec() {
        return this.options.spec;
    }

    setGlowEnabled(isEnabled){
        let {options} = this;
        let i = 0;
        options.spec.forEach((renderableName) => {
            this[renderableName].setProperties({boxShadow: isEnabled ? boxShadow : 'none', backgroundColor: isEnabled ? this.getColorForStick(renderableName) : 'rgba(255, 255, 255, 0.2)'});
        });
    }


    glow() {
        this.options.spec.forEach((renderableName) => {
            this[renderableName].setProperties({boxShadow: '1px 3px 97px 10px rgba(168,91,132,1)'});
        });
    }
}