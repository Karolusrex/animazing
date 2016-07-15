/**
 * Created by lundfall on 6/14/16.
 */
import Surface              from 'famous/core/Surface.js';
import Transitionable       from 'famous/transitions/Transitionable';
import Easing               from 'famous/transitions/Easing.js';

import {View}               from 'arva-js/core/View.js';
import {layout, options}    from 'arva-js/layout/decorators.js';

import {Shape}              from './Shape.js';
import {ShapeGrid}          from './ShapeGrid.js';
import AnimationController  from 'famous-flex/AnimationController.js';


export class ShapeWithGrid extends View {


    @layout.fullscreen
    grid = new ShapeGrid();

    @layout.animate({
        transition: {duration: 0}, animation: function () {
            return {...AnimationController.Animation.Slide.Up(...arguments), opacity: 0}
        }
    })
    @layout.size(function (size) {
        return this.determineShapeSize(size, 0)
    }, function (size) {
        return this.determineShapeSize(size, 1)
    })
    @layout.origin(0.5, 0.5)
    @layout.rotate(0, 0, 0)
    @layout.translate(0, 0, 30)
    shape = this.options.shapeSpec ? new Shape({spec: this.options.shapeSpec}) : {};

    @layout.animate({showInitially: false})
    @layout.size(undefined, 30)
    @layout.translate(0, 0, 30)
    @layout.place('top')
    placeholder = new Surface({content: '?', properties: {fontSize: '100px', textAlign: 'center'}});

    constructor(options) {
        super(options);
        this.setAutoSpin(options.autoSpin);
        this._rotationTransitionable = new Transitionable(0);
        this._spinSpeed = options.spinSpeed || 0.0225;
        this._currentRotation = options.startRotation || 0;
        this.layout.on('layoutstart', ({size, oldSize}) => {
            if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
                /* Counter-translate the shape since it needed a center origin to rotate center */
                this.shape.decorations.translate[0] = size[0] / 2;
                this.shape.decorations.translate[1] = size[1] / 2;
                let lineHeight = `${size[1]}px`;
                if (this.placeholder.getProperties().lineHeight !== lineHeight) {
                    this.placeholder.setProperties({lineHeight});
                }
            }
        });


        this.layouts.push((context) => {
            if (this._autoSpin) {
                this.shape.decorations.rotate = [0, 0, this._currentRotation += this._spinSpeed];
                this._rotationTransitionable.set(this._currentRotation);
            } else {
                let currentRotation = this._rotationTransitionable.get();
                this.shape.decorations.rotate = [0, 0, currentRotation];
                this.layout.options.alwaysLayout = this._rotationTransitionable.isActive();
                this._currentRotation = currentRotation;
            }
        })
    }

    setAutoSpin(autoSpin) {
        this._autoSpin = this.layout.options.alwaysLayout = autoSpin;
    }

    determineShapeSize(contextSize, dimension) {
        return this.shape.getSize ? this.shape.getSize()[dimension] / (this.grid.getSize()[dimension] / contextSize) : [undefined, undefined];
    }


    setRotation(rotation) {
        let numberOfTurns = Math.floor(rotation/(2*Math.PI));
        /* rotate the shortest way */
        let currentRotation = this._rotationTransitionable.get();
        this._targetRotation = rotation;
        let rotationDiff = currentRotation - rotation;
        if(Math.abs(rotationDiff) > Math.PI){
            if(Math.abs(Math.PI*2 - Math.abs(rotationDiff)) > Math.PI/2){
                currentRotation -= Math.PI*2*(Math.floor((currentRotation % Math.PI*2)/(2*Math.PI)+1));
            }
            this._rotationTransitionable.set((currentRotation % (Math.PI*2)) +numberOfTurns*Math.PI*2);
        }
        this._rotationTransitionable.set(rotation, {curve: Easing.inCubic, duration: 300});
        this.layout.options.alwaysLayout = true;
    }
    
    getDeterminedRotation() {
        return this._targetRotation;
    }


    showShape(spec) {
        this.hideRenderable('shape');
        this.replaceRenderable('shape', new Shape({spec}));
        this.layout.reflowLayout();
        this.renderables.shape.show(this.shape, {transition: {duration: 250}})
        this.hideRenderable('placeholder');
    }

    _restrictToCircle(controllerPosition) {
        let restrictedPosition = [...controllerPosition];
        let angle = Math.atan(controllerPosition[1] / controllerPosition[0]);
        let radius = Math.sqrt(Math.pow(controllerPosition[0], 2) + Math.pow(controllerPosition[1], 2));
        if (radius > this.maxRange) {
            restrictedPosition[0] = Math.cos(angle) * this.maxRange * Math.sign(controllerPosition[0]);
            restrictedPosition[1] = Math.sin(angle) * this.maxRange * Math.sign(controllerPosition[0]);
        }
        return restrictedPosition;
    }

    _ensurePlaceholder() {
        if (!this.renderables.shape.get() || !(this.shape instanceof Shape)) {
            this.showRenderable('placeholder');
        }
    }

    hideShape() {
        this.hideRenderable('shape');
        this.showRenderable('placeholder');
    }

}