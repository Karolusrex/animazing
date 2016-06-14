/**
 * Created by lundfall on 5/31/16.
 */
import _                    from 'lodash';
import Surface              from 'famous/core/Surface.js';
import {View}               from 'arva-js/core/View.js';
import {layout}             from 'arva-js/layout/decorators.js';

import {Shape}              from './Shape.js';
import {ShapeGrid}          from './ShapeGrid.js';


export class ShapeSelector extends View {


    constructor(options = {}) {
        super(options);
        this.layout.options.alwaysLayout = true;
        let shapeEntries = options.shapes.entries();
        for(let [i, shape] of shapeEntries){
            let shapeRenderable = new Shape({shape});
            shapeRenderable.on('mouseover', () => {
                console.log("mouseover");
            });
            this.addRenderable(shapeRenderable, `shape${i}`);
            let shapeGrid = new ShapeGrid();
            //Pipe to get click events
            shapeGrid.pipe(shapeRenderable);
            this.addRenderable(shapeGrid, `shapeGrid${i}`);
        }
        options.margins = options.margins || [10,10,10,10];
        this._currentDisplayRotation = 0;
        this._displaySpacing = 10;
        this.layouts.push((context)=> {
            let noRenderables = options.shapes.length;
            let shapeWidth = context.size[0]/noRenderables - this._displaySpacing;
            let xOffset = options.margins[3] + shapeWidth/2;
            this._currentDisplayRotation+=0.02;
            let width = Math.min(context.size[1],shapeWidth);
            let gridLength = Math.min(width, context.size[0]);
            for(let i=0;i<noRenderables;i++){
                let gridName = `shapeGrid${i}`;
                let shapeName = `shape${i}`;
                context.set(gridName, {
                    size: [gridLength, gridLength],
                    origin: [0.5,0.5],
                    rotate: [0,0,0],
                    translate: [xOffset, gridLength/2, 0]
                });
                let sizeDistorion = this.renderables[gridName].getSize()[0]/gridLength;
                let shapeSize = this.renderables[shapeName].getSize().map((size) => size/sizeDistorion);
                context.set(shapeName, {
                    size: shapeSize,
                    origin: [0.5,0.5],
                    rotate: [0,0,this._currentDisplayRotation + 2*Math.PI/noRenderables],
                    translate: [xOffset, gridLength/2, 10]
                });
                xOffset+=shapeWidth + this._displaySpacing;
            }
        });

    }
}
