/**
 * Created by lundfall on 5/31/16.
 */
import Transitionable       from 'famous/transitions/Transitionable';

import {View}               from 'arva-js/core/View.js';
import {layout}             from 'arva-js/layout/decorators.js';


import {ShapeWithGrid}      from './ShapeWithGrid.js';
import Easing               from 'famous/transitions/Easing';


export class ShapeSelector extends View {



    constructor(options = {}) {
        super(options);
        this._transition = {
            duration: 500,
            curve: Easing.inOutQuad
        };
        this._fading = new Transitionable(options.showInitally ? 1 : 0);
        this._sliding = new Transitionable(options.showInitially ? 0 : 1);

        let shapeSpecEntries = options.shapeSpecs.entries();
        for(let [i, shapeSpec] of shapeSpecEntries){
            let shapeRenderable = new ShapeWithGrid({colorScheme: 'transparent', autoSpin: false, shapeSpec, startRotation:i*Math.PI/2});
            this.addRenderable(shapeRenderable, `shape${i}`);
            shapeRenderable.on('click', this._onShapeClicked.bind(this,i));

        }
        options.margins = options.margins || [10,10,10,10];
        this._displaySpacing = 10;
        this._arrowSpace = 40;
        this.layouts.push((context)=> {
            this.layout.options.alwaysLayout = this._fading.isActive;
            let noRenderables = options.shapeSpecs.length;
            let contextSize = context.size;
            let gridLength = Math.min(contextSize[1] - options.margins[0] - options.margins[2],(contextSize[0] - options.margins[1] - options.margins[3] - this._displaySpacing*(noRenderables-1))/noRenderables);
            let betweenSpace = Math.max(gridLength + this._displaySpacing,(contextSize[0] - options.margins[3] - options.margins[1])/(noRenderables-1) - gridLength/(noRenderables-1));
            let xOffset = options.margins[3];
            for(let i=0;i<noRenderables;i++){
                let gridName = `shapeGrid${i}`;
                let shapeName = `shape${i}`;
                let isChosen = i===this._selectedIndex;
                let size = [gridLength, gridLength];
                if(isChosen){
                    for(let i of [0,1]){
                        size[i] = size[i] - (size[i] - (contextSize[1] - this._arrowSpace))*this._sliding.get();
                    }
                }
                context.set(shapeName, {
                    size,
                    origin: [0,0],
                    rotate: [0,0,0],
                    opacity:  isChosen ? 1 : this._fading.get(),
                    translate: [xOffset - (xOffset - context.size[0]/2 + size[0]/2)*this._sliding.get(), options.margins[0], 0]
                });
                xOffset += betweenSpace;
            }
        });
    }

    offerSelection() {
        this._selectedIndex = null;
        this.expand();
    }

    _collapse(shouldCollapse) {
        this.layout.reflowLayout();
        this._fading.set(+!shouldCollapse,this._transition);
        this._sliding.set(+shouldCollapse,this._transition);
        if(!shouldCollapse){
            for(let i=0;i<this.options.shapeSpecs.length;i++){
                this[`shape${i}`].setAutoSpin(true);
            }
        }
        this._isCollapsed = shouldCollapse;
    }

    hideAll() {
        this._selectedIndex = null;
        this.layout.reflowLayout();
        this._fading.set(0,this._transition);
        for(let i=0;i<this.options.shapeSpecs.length;i++){
            this[`shape${i}`].setAutoSpin(false);
        }
    }




    expand() {
        this._collapse(false);
    }

    collapse() {
        this._collapse(true);
    }

    _onShapeClicked(index){
        if(!this._isCollapsed){
            this._selectedIndex = index;
            this.collapse();
            for(let i=0;i<this.options.shapeSpecs.length;i++){
                this[`shape${i}`].setAutoSpin(i===index);
            }
            this._eventOutput.emit("shapeSelected", this.options.shapeSpecs[index]);
        }
    }
}
