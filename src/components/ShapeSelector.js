/**
 * Created by lundfall on 5/31/16.
 */
import _                    from 'lodash';
import Surface              from 'famous/core/Surface.js';
import Transitionable       from 'famous/transitions/Transitionable';

import {View}               from 'arva-js/core/View.js';
import {layout}             from 'arva-js/layout/decorators.js';


import {Shape}              from './Shape.js';
import {ShapeGrid}          from './ShapeGrid.js';
import {ShapeWithGrid}      from './ShapeWithGrid.js';
import Easing               from 'famous/transitions/Easing';


export class ShapeSelector extends View {


    constructor(options = {}) {
        super(options);

        this._fading = new Transitionable(1);
        this._sliding = new Transitionable(0);

        let shapeEntries = options.shapes.entries();
        for(let [i, shape] of shapeEntries){
            let shapeRenderable = new ShapeWithGrid({colorScheme: 'transparent', shape, autoSpin:true, startRotation:i*Math.PI/2});

            this.addRenderable(shapeRenderable, `shape${i}`);
            shapeRenderable.on('click', this._onShapeClicked.bind(this,i));

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
                let isChosen = i===this._selectedIndex;
                context.set(shapeName, {
                    size: [gridLength, gridLength],
                    origin: [0,0],
                    rotate: [0,0,0],
                    opacity:  isChosen ? 1 : this._fading.get(),
                    translate: [isChosen ? xOffset - (xOffset - context.size[0]/2)*this._sliding.get() : xOffset, gridLength/2, 0]
                });
                xOffset+=shapeWidth + this._displaySpacing;
            }
        });

    }

    _onShapeClicked(index){
        this._selectedIndex = index;
        for(let i=0;i<this.options.shapes.length;i++){
            this.layout.options.alwaysLayout = true;
            this[`shape${i}`].setAutoSpin(i===index);
            let transition = {
                duration: 500,
                curve: Easing.inOutQuad
            };
            this._fading.set(0,transition);
            this._sliding.set(1,transition);
        }
    }
}
