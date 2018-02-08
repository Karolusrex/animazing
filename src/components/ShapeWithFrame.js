/**
 * Created by lundfall on 6/14/16.
 */
import Surface from 'famous/core/Surface.js';
import Transitionable from 'famous/transitions/Transitionable';
import Easing from 'famous/transitions/Easing.js';

import {View} from 'arva-js/core/View.js';
import {layout} from 'arva-js/layout/decorators.js';

import {Shape} from './Shape.js';
import {ShapeGrid} from './ShapeGrid.js';
import {
    normalizeRotationToOther
}
    from '../util/SpecProcessing.js';
import {Settings} from '../util/Settings.js';
import AnimationController from 'famous-flex/AnimationController.js';
import {combineOptions} from 'arva-js/utils/CombineOptions.js';
import {Colors}         from 'arva-kit/defaults/DefaultColors.js';

let boxShadow = 'rgba(0, 0, 0, 0.16) -1px 0px 64px', borderRadius = '20px';
export class ShapeWithFrame extends View {


    @layout.animate({showInitially: false})
    @layout.fullSize()
    @layout.translate(0, 0, -30)
    defaultFrame = new Surface({
        properties: {
            borderRadius,
            boxShadow: `inset ${boxShadow}`
        }
    });

    @layout.rotate(0, 0, 0)
    @layout.stick.center()
    @layout.animate({showInitially: false})
    @layout.size(undefined, undefined)
    @layout.translate(0, 0, -20)
    activatedFrame = new Surface({
        properties: {
            borderRadius,
            boxShadow,
            backgroundColor: 'white'
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
    @layout.stick.top()
    placeholder = new Surface({
        content: '?',
        properties: {fontSize: '80px', textAlign: 'center', color: 'rgba(255,255,255,0.6)'}
    });

    getBoxShadowString() {
        return boxShadow;
    }

    constructor(options) {
        super(combineOptions(
            {
                activated: false
            }
            , options));
        this.showRenderable(this.options.activated ? `activatedFrame` : `defaultFrame`);
        this._enabled = this.options.enabled;
        this.setAutoSpin(options.autoSpin);
        this._rotationTransitionable = new Transitionable(0);
        this._spinSpeed = options.spinSpeed || 0.00185;
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
        let initialSpeed = 0.007;

        this.layouts.push((context) => {

            if (this._autoSpin) {
                let newDiff = getTime(),
                    timeDiffFromLastFrame = (newDiff - this._lastDiff),
                    timeSinceAutoSpinStarted = (newDiff - this._autoSpinStartAt);

                if (this._lastDiff && timeSinceAutoSpinStarted > 400) {
                    let newSpeed = Math.min(0.02,
                        (1 - (this._currentRotation % (Math.PI / 2)) / Math.PI) * initialSpeed
                    );
                    let upcomingRotationDelta = newSpeed * timeDiffFromLastFrame;
                    if ((this._currentRotation + upcomingRotationDelta ) % (Math.PI / 2) < this._currentRotation % (Math.PI / 4)) {
                        if (!this._lockedAt) {
                            this._lockedAt = Date.now();
                            this._spinSpeed = 0;
                            this._currentRotation = Math.ceil(this._currentRotation / (Math.PI / 4)) * (Math.PI / 4);
                        }
                    }
                    if (this._spinSpeed) {
                        this._spinSpeed = newSpeed;
                        this.shape.decorations.rotate = /*this.activatedFrame.decorations.rotate =*/ [0, 0, this._currentRotation += upcomingRotationDelta];
                        this._rotationTransitionable.set(this._currentRotation);
                    } else if (Date.now() - this._lockedAt > 300) {
                        this._lockedAt = null;
                        this._spinSpeed = initialSpeed;
                        this._currentRotation += this._spinSpeed;
                    }
                }
                this._lastDiff = newDiff;
            } else {
                let currentRotation = this._rotationTransitionable.get();
                this.shape.decorations.rotate = /*this.activatedFrame.decorations.rotate =*/ [0, 0, currentRotation];
                this.layout.options.alwaysLayout = this._rotationTransitionable.isActive();
                this._currentRotation = currentRotation;
            }
        })
    }

    select() {
        if(this.options.activated){
            console.log('Cannot select shape because it is permanently activated!');
            return;
        }
        this.showRenderable(`activatedFrame`);
    }

    selectAsForbidden() {
        this.activatedFrame.setProperties({backgroundColor: 'rgba(255, 63, 63, 0.3)'});
        this.select();
    }

    async unselect() {
        if(this.options.activated){
            console.log('Cannot unselect shape because it is permanently activated!');
            return;
        }
        await this.hideRenderable(`activatedFrame`);
        this.activatedFrame.setProperties({backgroundColor: 'white'});
    }

    isEnabled() {
        return this._enabled;
    }

    setAutoSpin(autoSpin) {
        this._autoSpin = this.layout.options.alwaysLayout = autoSpin;
        this._autoSpinStartAt = getTime();
    }

    determineShapeSize(contextSize, dimension) {
        return this.shape.getSize ? this.shape.getSize()[dimension] / (250 / contextSize) : [undefined, undefined];
    }


    resetRotation() {
        this.setRotation(this.getSpec().getNoQuarterTurns(), true);
    }

    setRotation(rotation, instant = false) {
        this._targetRotation = rotation;
        /* rotate the shortest way */
        let adjustedCurrentRotation = normalizeRotationToOther(rotation, this._rotationTransitionable.get());
        this._rotationTransitionable.set(adjustedCurrentRotation);
        this._rotationTransitionable.set(rotation, {curve: Easing.outCubic, duration: instant ? 0 : 300});
        this.layout.options.alwaysLayout = true;

    }

    flip(instant = false) {
        this._targetRotation += Math.PI;
        /* rotate the shortest way */
        this._rotationTransitionable.set(this._targetRotation, {curve: Easing.outCubic, duration: instant ? 0 : 300});
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

    enable() {
        this._setEnabled(true);
    }

    disable() {
        this._setEnabled(false);
    }


    _setEnabled(enabled) {
        this._enabled = enabled;
        //todo
        console.log('TODO: Change the background color or something here when setting enabled');
        /*this.overlay.setProperties({
            backgroundColor: enabled ? 'inherit' : Settings.transparentBackgroundColor
        });*/
        this.shape.setGlowEnabled(enabled);
    }


    showShape(spec) {
        this.hideRenderable('shape');
        this.replaceRenderable('shape', new Shape({spec}));
        this.layout.reflowLayout();
        this.renderables.shape.show(this.shape, {transition: {duration: 250}});
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

    makeEmpty() {
        this.hideRenderable('placeholder');
        this.hideRenderable('shape');
        this.replaceRenderable('shape', {});
        this.layout.reflowLayout();
    }

    getFrame() {
        return this.options.activated ? this.activatedFrame : this.defaultFrame;
    }

    lockShape() {
        this.decorateRenderable('shape', layout.opacity(0.5));
    }

    unlockShape() {
        this.decorateRenderable('shape', layout.opacity(1));
    }
}

function getTime() {
    return (window.performance && window.performance.now) ? window.performance.now() : Date.now();
}