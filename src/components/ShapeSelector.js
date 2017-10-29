/**
 * Created by lundfall on 5/31/16.
 */
import Surface                      from 'famous/core/Surface.js';
import ImageSurface                 from 'famous/Surfaces/ImageSurface.js';
import Transitionable               from 'famous/transitions/Transitionable';
import Timer                        from 'famous/utilities/Timer.js';
import Easing                       from 'famous/transitions/Easing';

import {View}                       from 'arva-js/core/View.js';
import {layout}                     from 'arva-js/layout/decorators.js';
import {OutlineTextButton}          from 'arva-kit/buttons/OutlineTextButton.js'
import {ImageButton}                from 'arva-kit/buttons/ImageButton.js'

import {turnShape}                  from '../util/SpecProcessing.js';
import {Settings}                   from '../util/Settings.js';
import {DraggableShape}     from './DraggableShapeWithGrid.js';
import AnimationController          from 'famous-flex/AnimationController.js';
import {combineOptions}             from 'arva-js/utils/CombineOptions.js';

import arrowImage                   from './next.png';
import {RotateRightIcon}            from './icons/RotateRightIcon.js';
import {RotateLeftIcon}             from './icons/RotateLeftIcon.js';
import {RotateIcon}                 from './icons/RotateIcon.js';
import {RotationMode}               from '../util/SpecProcessing.js';

let margin = 30;

export class ShapeSelector extends View {

    @layout.translate(0, 0, -10)
    @layout.dock.right(0.5)
    background = new Surface({properties: {backgroundColor: 'white'}});

    @layout.animate({ showInitially: false })
    @layout.origin(1, 0.2)
    @layout.align(0.5, 0)
    @layout.size(40, 40)
    rotateRightButton = new ImageButton({
        imageOnly: true,
        alwaysEnabled: true,
        easyPress: true,
        makeRipple: false,
        clickEventName: 'rotate',
        clickEventData: ['right'],
        icon: RotateRightIcon
    });

    @layout.animate({ showInitially: false })
    @layout.origin(1, 0.2)
    @layout.align(0.56, 0)
    @layout.size(50, 50)
    flipButton = new ImageButton({
        imageOnly: true,
        alwaysEnabled: true,
        easyPress: true,
        makeRipple: false,
        clickEventName: 'rotate',
        clickEventData: ['flip'],
        icon: RotateIcon
    });

    @layout.animate({ showInitially: false })
    @layout.origin(0, 0.2)
    @layout.align(0.5, 0)
    @layout.size(40, 40)
    rotateLeftButton = new ImageButton({
        imageOnly: true,
        alwaysEnabled: true,
        easyPress: true,
        makeRipple: false,
        clickEventName: 'rotate',
        clickEventData: ['left'],
        icon: RotateLeftIcon
    });


    constructor(options = {}) {
        super(combineOptions({
            rotationMode: RotationMode.all
        }, options));

        options = this.options;

        this.layout.on('layoutstart', ({ size: [width, height] }) => {
            this._onNewSize(width, height);
        });
        this._transition = {
            duration: 500,
            curve: Easing.inOutQuad
        };
        this._fading = new Transitionable(options.showInitally ? 1 : 0);
        this._sliding = new Transitionable(options.showInitially ? 0 : 1);
        this.on('accept', () => {
            let rotation = this._selectedShape.getDeterminedRotation();
            let { shapeSpec } = this._selectedShape.options;
            Timer.setTimeout(() => {
                /* The turn shape calculates the rotation backwards from what famous does, so it's inverted here */
                this._eventOutput.emit('shapeSelected', turnShape(Math.round((4 - (rotation % (Math.PI * 2)) / (Math.PI / 2))) % 4, shapeSpec));
            }, this._transition.duration);
        });
        this.on('cancel', () => {
            this._selectedShape = null;
            this.offerSelection();
        });

        this.on('rotate', (direction) => {
            let selectedShape = this._selectedShape;
            let currentRotation = selectedShape.getDeterminedRotation();
            if (direction === 'right') {
                selectedShape.setRotation(currentRotation + Math.PI / 2);
            } else if (direction === 'left') {
                selectedShape.setRotation(currentRotation - Math.PI / 2);
            } else if (direction === 'flip') {
                selectedShape.flip();
            }
        });

        this.setSelection(options.shapeSpecs, this.options.rotationMode);

        options.margins = options.margins || [10, 10, 10, 10];
        this._displaySpacing = Settings.shapeSpacing;

    }

    /**
     * Shows the different renderables that can be chosen between, disabling certain ones possibly
     */
    offerSelection(exceptThese = this._previousExceptions) {
        if (this.options.shapeSpecs.length === 1) {
            this._selectShape(0, this.shape0);
        }

        if (this._selectedShape) {
            return;
        }

        for (let i = 0; i < this.options.shapeSpecs.length; i++) {
            let exception;
            let shapeWithGrid = this[`shape${i}`];
            if (exception = exceptThese.find((possibleException) => shapeWithGrid.getSpec().isSameUnrotated(possibleException))) {
                shapeWithGrid.disable();
            } else {
                shapeWithGrid.enable();
            }
        }
        this._previousExceptions = exceptThese;
        this.expand();
        this._eventOutput.emit('offerSelection');
    }

    setSelection(shapeSpecs, rotationMode) {
        this.options.rotationMode = rotationMode;
        if (this.options.shapeSpecs) {
            this._clearSelection();
        }

        this.options.shapeSpecs = shapeSpecs;
        let numberOfShapes = shapeSpecs.length;

        for (let [i, shapeSpec] of shapeSpecs.entries()) {
            let shapeRenderable = new DraggableShape({
                colorScheme: 'transparent',
                autoSpin: rotationMode !== RotationMode.noRotation,
                shapeSpec,
                startRotation: i * Math.PI / 2
            });

            this.addRenderable(shapeRenderable, `shape${i}`
                /* Size is set properly later in the pre-layout function */
                , layout.size(100, 100), layout.translate(0, 0, 10), layout.animate());
            shapeRenderable.on('click', this._onShapeClicked.bind(this, i, shapeRenderable));
            shapeRenderable.on('isDragged', () => this._currentlyDraggedShape = shapeRenderable);
            shapeRenderable.on('finishedDragging', () => this._onShapeFinishedDrag(shapeRenderable));
        }
    }

    expand() {
        this._collapse(false);
    }

    collapse() {
        this._collapse(true);
    }

    notifyShouldNotSnap(){
        this._currentlyDraggedShape.snapToPositionWhenDropped([0, 0]);
    }


    notifyShapeWillSnap(shapeWillSnapAtPosition) {
        this._shapeWillSnapAtPosition = shapeWillSnapAtPosition;
        let calculateRelativePositionForDimension = (dimension) =>
            shapeWillSnapAtPosition[dimension] - this._currentlyDraggedShape.decorations.translate[dimension];
        this._currentlyDraggedShape.snapToPositionWhenDropped([
            calculateRelativePositionForDimension(0),
            calculateRelativePositionForDimension(1)
        ]);
    }

    _onNewSize(width, height) {
        let shapeHeight = this.options.shapeWidth || 0;
        for(let [shapeIndex] of this.options.shapeSpecs.entries()){
            this[`shape${shapeIndex}`].decorations.size = [shapeHeight, shapeHeight];
            this[`shape${shapeIndex}`].decorations.translate[0] = width * .75 - shapeHeight / 2;
            this[`shape${shapeIndex}`].decorations.translate[1] = margin / 2 +
                Math.max(0, (shapeIndex) * (margin + shapeHeight));
        }
    }

    _clearSelection() {
        //TODO Remove all shape0, shape1, etc.
    }


    _collapse(shouldCollapse, delayButtonModification = false) {
        this.layout.reflowLayout();
        this._fading.set(+!shouldCollapse, this._transition);
        this._sliding.set(+shouldCollapse, this._transition);
        let { options } = this;
        let buttonModification = () => {

        };
        if (delayButtonModification) {
            Timer.setTimeout(buttonModification, this._transition.duration * 1.5);
        } else {
            buttonModification();
        }
        if (!shouldCollapse) {
            for (let i = 0; i < this.options.shapeSpecs.length; i++) {
                let shapeWithGrid = this[`shape${i}`];
                if (this.options.rotationMode !== RotationMode.noRotation && shapeWithGrid.isEnabled()) {
                    shapeWithGrid.setAutoSpin(true);
                } else {
                    shapeWithGrid.setAutoSpin(false);
                    shapeWithGrid.resetRotation();
                }
            }
        }
        this._isCollapsed = shouldCollapse;
    }

    _onShapeFinishedDrag(shapeRenderable) {
        if(!shapeRenderable.willSnapToOtherPosition()){
            return;
        }
        shapeRenderable.once('didSnapToPosition', () => {
            shapeRenderable.setAutoSpin(false);
        });
        for(let [index] of this.options.shapeSpecs.entries()){
            let otherShapeRenderableName = `shape${index}`;
            let otherShapeRenderable = this[otherShapeRenderableName];
            if(otherShapeRenderable === shapeRenderable){
                continue;
            }
            this.hideRenderable(otherShapeRenderableName);
        }
        this.showRenderable('rotateRightButton');
        this.showRenderable('rotateLeftButton');
    }

    _onShapeClicked(index, shapeRenderable) {
        if (!shapeRenderable.isEnabled()) {
            this._eventOutput.emit('invalidSelection', shapeRenderable.getSpec());
            return;
        }
        if (!this._isCollapsed) {
            this._selectShape(index, shapeRenderable);
        }
    }

    _selectShape(index, shapeRenderable) {
        this._selectedShape = shapeRenderable;
        this._collapse(true, true);
        for (let i = 0; i < this.options.shapeSpecs.length; i++) {
            this[`shape${i}`].setAutoSpin(false);
        }
        Timer.setTimeout(() => {
            let currentRotation = shapeRenderable.getRotation();
            let rotationPrecision = this.options.rotationMode === RotationMode.all ? Math.PI / 2 : Math.PI;
            shapeRenderable.setRotation(Math.round(currentRotation / rotationPrecision) * rotationPrecision);
            this._eventOutput.emit('rotatingShape', shapeRenderable.getSpec());
        }, this._transition.duration);
    }


}
