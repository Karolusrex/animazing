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
import {
    normalizeRotationToOther
}
    from '../util/SpecProcessing.js';
import {Settings}           from '../util/Settings.js';
import AnimationController  from 'famous-flex/AnimationController.js';
import {combineOptions}      from 'arva-js/utils/CombineOptions.js';

export class ShapeWithGrid extends View {

    @layout.fullscreen
    grid = new ShapeGrid();

    @layout.dock('fill')
    @layout.translate(0, 0, 30)
    overlay = new Surface({
        properties: {
            backgroundColor: this.options.enabled ? 'none' : Settings.transparentBackgroundColor
        }
    });

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
    @layout.translate(0, 0, 50)
    shape = this.options.shapeSpec ? new Shape({spec: this.options.shapeSpec}) : {};

    @layout.animate({showInitially: false})
    @layout.size(undefined, 30)
    @layout.translate(0, 0, 30)
    @layout.place('top')
    placeholder = new Surface({content: '?', properties: {fontSize: '100px', textAlign: 'center'}});

    constructor(options) {
        super(combineOptions(
            {enabled: true}
            , options));
        this._enabled = options.enabled;
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

    isEnabled() {
        return this._enabled;
    }

    setAutoSpin(autoSpin) {
        this._autoSpin = this.layout.options.alwaysLayout = autoSpin;
    }

    determineShapeSize(contextSize, dimension) {
        return this.shape.getSize ? this.shape.getSize()[dimension] / (this.grid.getSize()[dimension] / contextSize) : [undefined, undefined];
    }


    setRotation(rotation) {
        this._targetRotation = rotation;
        /* rotate the shortest way */
        let adjustedCurrentRotation = normalizeRotationToOther(rotation, this._rotationTransitionable.get());
        this._rotationTransitionable.set(adjustedCurrentRotation);
        this._rotationTransitionable.set(rotation, {curve: Easing.outCubic, duration: 300});
        this.layout.options.alwaysLayout = true;
    }

    /** Gets the final rotation, not considering any ongoing animation
     *
     * @returns {*}
     */
    getDeterminedRotation() {
        return this._targetRotation;
    }

    /** Gets the current rotation of the shape
     *
     * @returns Number
     */
    getRotation() {
        return this._currentRotation;
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

    getSpec() {
        return this.shape.getSpec ? this.shape.getSpec() : undefined;
    }

    hideShape() {
        this.hideRenderable('shape');
        this.showRenderable('placeholder');
    }

}