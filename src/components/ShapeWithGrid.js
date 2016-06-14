/**
 * Created by lundfall on 6/14/16.
 */
import Surface               from 'famous/core/Surface.js';

import {View}                from 'arva-js/core/View.js';
import {layout, options}     from 'arva-js/layout/decorators.js';

import {Shape}               from './Shape.js';
import {ShapeGrid}           from './ShapeGrid.js';


export class ShapeWithGrid extends View {

    @layout.origin(0.5,0.5)
    grid = new ShapeGrid();

    @layout.size(function(size) { return this.determineShapeSize(size,0)},function(size) {return this.determineShapeSize(size, 1)})
    @layout.origin(0.5,0.5)
    @layout.rotate(0, 0, 0)
    @layout.translate(0, 0, 30)
    shape = new Shape({shape: this.options.shape});

    setAutoSpin(autoSpin){
        this._autoSpin = this.layout.options.alwaysLayout = autoSpin;
    }
    determineShapeSize(contextSize, dimension){
        return this.shape.getSize()[dimension]/(this.grid.getSize()[dimension]/contextSize);
    }

    constructor(options){
        super(options);
        this.setAutoSpin(options.autoSpin);
        this._spinSpeed = options.spinSpeed || 0.02;
        this._currentRotation = options.startRotation || 0;

        this.layouts.push((context) => {
            if(this._autoSpin){
                this.shape.decorations.rotate = [0, 0, this._currentRotation+=this._spinSpeed];
            }
        })
    }

}