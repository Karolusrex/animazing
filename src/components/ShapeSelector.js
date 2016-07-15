/**
 * Created by lundfall on 5/31/16.
 */
import Surface              from 'famous/core/Surface.js';
import ImageSurface         from 'famous/Surfaces/ImageSurface.js';
import Transitionable       from 'famous/transitions/Transitionable';
import Timer                from 'famous/utilities/Timer.js';
import Easing               from 'famous/transitions/Easing';

import {View}               from 'arva-js/core/View.js';
import {layout}             from 'arva-js/layout/decorators.js';
import {OutlineTextButton}  from 'arva-kit/buttons/OutlineTextButton.js'

import {turnShape}                  from '../util/SpecProcessing.js';
import {ShapeWithGrid}              from './ShapeWithGrid.js';
import AnimationController          from 'famous-flex/AnimationController.js';
import arrowImage                   from './next.png';

export class ShapeSelector extends View {

    @layout.animate({showInitially: false})
    @layout.origin(0.8, 1)
    @layout.align(0.8, 1)
    @layout.size(100, 30)
    okButton = new OutlineTextButton({variation: 'bold', content: 'OK'});

    constructor(options = {}) {
        super(options);
        this._transition = {
            duration: 500,
            curve: Easing.inOutQuad
        };
        this._fading = new Transitionable(options.showInitally ? 1 : 0);
        this._sliding = new Transitionable(options.showInitially ? 0 : 1);
        this.okButton.on('buttonClick', () => {
            let rotation = this._selectedShape.getDeterminedRotation();
            let {shapeSpec} = this._selectedShape.options;
            this.hideAll();
            Timer.setTimeout(() => {
                /* The turn shape calculates the rotation backwards from what famous does, so it's inverted here */
                this._eventOutput.emit('shapeSelected', turnShape((4 - rotation / (Math.PI / 2)) % 4, shapeSpec));
            }, this._transition.duration);
        });

        let shapeSpecEntries = options.shapeSpecs.entries();
        for (let [i, shapeSpec] of shapeSpecEntries) {
            let shapeRenderable = new ShapeWithGrid({
                colorScheme: 'transparent',
                autoSpin: false,
                shapeSpec,
                startRotation: i * Math.PI / 2
            });
            this.addRenderable(shapeRenderable, `shape${i}`);
            shapeRenderable.on('click', this._onShapeClicked.bind(this, i, shapeRenderable));
        }
        this._arrowSpace = 40;
        this._arrowMargin = 5;
        let arrowSize = [this._arrowSpace - this._arrowMargin, this._arrowSpace - this._arrowMargin];
        for (let [index, arrowDirection] of ['right', 'down', 'left', 'up'].entries()) {
            let rotation = index * Math.PI / 2;
            let arrowRenderable = new ImageSurface({content: arrowImage});
            arrowRenderable.on('click', () => {
                if (this._selectedShape) {
                    /* By default, shapes are facing upwards, so we shift the rotation to make more sense from a visual perspective */
                    this._selectedShape.setRotation(rotation + Math.PI / 2);
                }
            });
            this.addRenderable(arrowRenderable, `${arrowDirection}Arrow`, layout.rotate(0, 0, rotation), layout.origin(0.5, 0.5), layout.size(...arrowSize), layout.animate({
                showInitially: false,
                animation: function () {
                    return {
                        ...AnimationController.Animation.Slide[arrowDirection.charAt(0).toUpperCase() + arrowDirection.slice(1)](...arguments),
                        opacity: 0
                    }
                }
            }));
        }
        options.margins = options.margins || [10, 10, 10, 10];
        this._displaySpacing = 10;
        this.layouts.push((context)=> {
            this.layout.options.alwaysLayout = this._fading.isActive();
            let noRenderables = options.shapeSpecs.length;
            let contextSize = context.size;
            let gridLength = Math.min(contextSize[1] - options.margins[0] - options.margins[2], (contextSize[0] - options.margins[1] - options.margins[3] - this._displaySpacing * (noRenderables - 1)) / noRenderables);
            let betweenSpace = Math.max(gridLength + this._displaySpacing, (contextSize[0] - options.margins[3] - options.margins[1]) / (noRenderables - 1) - gridLength / (noRenderables - 1));
            let xOffset = options.margins[3];
            for (let i = 0; i < noRenderables; i++) {
                let gridName = `shapeGrid${i}`;
                let shapeName = `shape${i}`;
                let isChosen = this.renderables[shapeName] === this._selectedShape;
                let size = [gridLength, gridLength];
                if (isChosen) {
                    for (let i of [0, 1]) {
                        size[i] = size[i] - (size[i] - (contextSize[1] - this._arrowSpace * 2)) * this._sliding.get();
                    }
                    let horizontalArrowVerticalTranslate = 0;
                    let verticalArrowHorizontalTranslate = context.size[0] / 2;
                    let arrowZindex = 50;
                    this.leftArrow.decorations.translate = [context.size[0] / 2 - size[0] / 2 - this._arrowSpace / 2, contextSize[1] / 2 + this._arrowSpace / 2,
                        horizontalArrowVerticalTranslate, arrowZindex];
                    this.rightArrow.decorations.translate = [context.size[0] / 2 + size[0] / 2 + this._arrowSpace / 2, contextSize[1] / 2 + this._arrowSpace / 2,
                        horizontalArrowVerticalTranslate, arrowZindex];
                    this.upArrow.decorations.translate = [verticalArrowHorizontalTranslate, options.margins[0] + this._arrowSpace / 2, arrowZindex];
                    this.downArrow.decorations.translate = [verticalArrowHorizontalTranslate, options.margins[0] + size[1] + (this._arrowSpace) + this._arrowMargin * 3, arrowZindex];
                }
                let opacity = isChosen ? 1 : this._fading.get();
                if(opacity){
                    context.set(shapeName, {
                        size,
                        origin: [0, 0],
                        rotate: [0, 0, 0],
                        opacity,
                        translate: [xOffset - (xOffset - context.size[0] / 2 + size[0] / 2) * this._sliding.get(), this._arrowSpace * this._sliding.get() + options.margins[0], 0]
                    });
                }
                xOffset += betweenSpace;
            }
        });
    }

    offerSelection() {
        this._selectedShape = null;
        this.expand();
    }

    _collapse(shouldCollapse) {
        this.layout.reflowLayout();
        this._fading.set(+!shouldCollapse, this._transition);
        this._sliding.set(+shouldCollapse, this._transition);
        this.showRenderable('rightArrow', shouldCollapse);
        this.showRenderable('leftArrow', shouldCollapse);
        this.showRenderable('downArrow', shouldCollapse);
        this.showRenderable('upArrow', shouldCollapse);
        this.showRenderable('okButton', shouldCollapse);
        if (!shouldCollapse) {
            for (let i = 0; i < this.options.shapeSpecs.length; i++) {
                this[`shape${i}`].setAutoSpin(true);
            }
        }
        this._isCollapsed = shouldCollapse;
    }

    hideAll() {
        this._selectedShape = null;
        this.layout.reflowLayout();
        this._fading.set(0, this._transition);
        this.hideRenderable('okButton');
        this.hideRenderable('rightArrow');
        this.hideRenderable('leftArrow');
        this.hideRenderable('upArrow');
        this.hideRenderable('downArrow');
        for (let i = 0; i < this.options.shapeSpecs.length; i++) {
            this[`shape${i}`].setAutoSpin(false);
        }
    }


    expand() {
        this._collapse(false);
    }

    collapse() {
        this._collapse(true);
    }

    _onShapeClicked(index, shapeRenderable) {
        if (!this._isCollapsed) {
            this._selectedShape = shapeRenderable;
            this._selectedIndex = index;
            this.collapse();
            for (let i = 0; i < this.options.shapeSpecs.length; i++) {
                this[`shape${i}`].setAutoSpin(false);
            }
            Timer.setTimeout(() => {
                shapeRenderable.setRotation(0);
            }, this._transition.duration);
            this.showRenderable('okButton');
        }
    }
}
