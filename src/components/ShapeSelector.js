/**
 * Created by lundfall on 5/31/16.
 */
import Surface              from 'famous/core/Surface.js';
import ImageSurface         from 'famous/Surfaces/ImageSurface.js';
import Transitionable       from 'famous/transitions/Transitionable';
import Timer                from 'famous/utilities/Timer.js';
import Easing               from 'famous/transitions/Easing';

import {View}               from 'arva-js/core/View.js';
import {combineOptions}     from 'arva-js/utils/CombineOptions.js';
import {layout, event}      from 'arva-js/layout/decorators.js';
import {OutlineTextButton}  from 'arva-kit/buttons/OutlineTextButton.js'
import {ImageButton}        from 'arva-kit/buttons/ImageButton.js'
import {replaceColors}      from 'arva-kit/icons/views/ReplaceColors.js';
import {Colors}             from 'arva-kit/defaults/DefaultColors.js'
import {CirclecheckIcon}    from 'arva-kit/icons/angular/thin/CirclecheckIcon.js'

import {turnShape}          from '../util/SpecProcessing.js';
import {Settings}           from '../util/Settings.js';
import {DraggableShape}     from './DraggableShapeWithGrid.js';
import AnimationController  from 'famous-flex/AnimationController.js';

import arrowImage           from './next.png';
import rightTurn            from './icons/rightTurn.png';
import leftTurn             from './icons/leftTurn.png';
import {RotationMode}       from '../util/SpecProcessing.js';

let margin = 30;


export class ShapeSelector extends View {

    _selectedShape = null;


    @layout.dockPadding(0)
    @layout.animate({showInitially: false})
    @layout.size(44, 20)
    rotateRightButton = new ImageButton({
        imageOnly: true,
        alwaysEnabled: true,
        easyPress: true,
        makeRipple: false,
        clickEventName: 'rotate',
        clickEventData: ['right'],
        image: rightTurn
    });


    @event.on('shapeFinalized', function () {
        this._exitShapeConfigurationMode();
    })
    @layout.animate({showInitially: false})
    @layout.size(44, 20)
    checkButton = new ImageButton({
        imageOnly: true,
        alwaysEnabled: true,
        easyPress: true,
        makeRipple: false,
        clickEventName: 'shapeFinalized',
        icon: CirclecheckIcon,
        properties: {color: 'black'}
    });

    @layout.dockPadding(0)
    @layout.animate({showInitially: false})
    @layout.size(44, 20)
    rotateLeftButton = new ImageButton({
        imageOnly: true,
        alwaysEnabled: true,
        easyPress: true,
        makeRipple: false,
        clickEventName: 'rotate',
        clickEventData: ['left'],
        image: leftTurn
    });


    constructor(options = {}) {
        super(combineOptions({
            rotationMode: RotationMode.all
        }, options));

        options = this.options;

        this.layout.on('layoutstart', ({size: [width, height]}) => {
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
            let {shapeSpec} = this._selectedShape.options;
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
        this._finalSelection = [];

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
            shapeRenderable.on('isDragged', () => this._onShapeDrag(shapeRenderable));
            shapeRenderable.on('finishedDragging', () => this._onShapeFinishedDrag(shapeRenderable));
        }
    }

    expand() {
        this._collapse(false);
    }

    collapse() {
        this._collapse(true);
    }

    notifyShouldNotSnap() {
        this._currentlyDraggedShape.snapToPositionWhenDropped([0, 0]);
    }


    hideAllShapes() {
        this._toggleAllShapes(false);
    }

    lockShapes() {
        this._hideButtons();
        for (let [index] of this.options.shapeSpecs.entries()) {
            let shapeRenderableName = `shape${index}`;
            let shape = this[shapeRenderableName];
            if(shape.isHome){
                this.hideRenderable(shapeRenderableName)
            } else {
                shape.lockShape();
            }
        }
    }

    unlockShapes() {
        for (let [index] of this.options.shapeSpecs.entries()) {
            let shapeRenderableName = `shape${index}`;
            let shape = this[shapeRenderableName];
            this.showRenderable(shapeRenderableName);
            shape.unlockShape();
        }

    }

    notifyShapeWillSnap(shapeWillSnapAtPosition, index) {
        this._shapeWillSnapAtPosition = shapeWillSnapAtPosition;
        let calculateRelativePositionForDimension = (dimension) =>
            shapeWillSnapAtPosition[dimension] - this._currentlyDraggedShape.decorations.translate[dimension];
        this._currentlyDraggedShape.snapToPositionWhenDropped([
            calculateRelativePositionForDimension(0),
            calculateRelativePositionForDimension(1)
        ]);
        this._currentlyDraggedShape.activeExternalIndex = index;
    }

    getSelectedShapeSequence() {
        return this._finalSelection;
    }

    _onNewSize(width, height) {
        this._lastKnownSize = [width, height];
        let shapeHeight = this.options.shapeWidth || 0;
        for (let [shapeIndex] of this.options.shapeSpecs.entries()) {
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
        let {options} = this;
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
        if (!shapeRenderable.willSnapToOtherPosition()) {
            delete this._finalSelection[shapeRenderable.activeExternalIndex];
            return;
        }
        this._finalSelection[shapeRenderable.activeExternalIndex] = shapeRenderable.options.shapeSpec;
        shapeRenderable.once('didSnapToPosition', () => {
            shapeRenderable.setAutoSpin(false);
            this._selectedShape = shapeRenderable;
            let currentRotation = shapeRenderable.getRotation();
            let rotationPrecision = this.options.rotationMode === RotationMode.all ? Math.PI / 2 : Math.PI;
            shapeRenderable.setRotation(Math.round(currentRotation / rotationPrecision) * rotationPrecision);
        });
        for (let [index] of this.options.shapeSpecs.entries()) {
            let otherShapeRenderableName = `shape${index}`;
            let otherShapeRenderable = this[otherShapeRenderableName];
            if (otherShapeRenderable === shapeRenderable) {
                continue;
            }
            this.hideRenderable(otherShapeRenderableName);
        }
        this._setNewButtonPositions();
        this.showRenderable('checkButton');
        this.showRenderable('rotateRightButton');
        this.showRenderable('rotateLeftButton');
    }


    _setNewButtonPositions() {
        let halfOfScreen = this._lastKnownSize[0] / 2;
        let shapeWillSnapAtPosition = this._shapeWillSnapAtPosition, {shapeWidth} = this.options;
        this.rotateLeftButton.decorations.translate = [halfOfScreen, shapeWillSnapAtPosition[1], 10];
        this.rotateRightButton.decorations.translate = [halfOfScreen + 50, shapeWillSnapAtPosition[1], 10];
        this.checkButton.decorations.translate = [halfOfScreen + 25, shapeWillSnapAtPosition[1] + 30, 10];
        /* Reflow in order to put the translates in place */
        this.reflowRecursively();
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
            shapeRenderable.setRotation(Math.ceil(currentRotation / rotationPrecision) * rotationPrecision);
            this._eventOutput.emit('rotatingShape', shapeRenderable.getSpec());
        }, this._transition.duration);
    }

    _onShapeDrag(shapeRenderable) {
        if(!shapeRenderable.isHome){
            shapeRenderable.setAutoSpin(true);
        }
        if (!this._selectedShape) {
            this._currentlyDraggedShape = shapeRenderable
            return;
        }
        this._exitShapeConfigurationMode();
    }

    _exitShapeConfigurationMode() {
        this._hideButtons();
        /* Just for reducing a bit of cognitive load, wait a bit before making the other shapes reappear */
        this._toggleAllShapes(true);
        this._selectedShape = null;
    }

    _toggleAllShapes(shouldShow) {
        for (let [index] of this.options.shapeSpecs.entries()) {
            let otherShapeRenderableName = `shape${index}`;
            this.showRenderable(otherShapeRenderableName, shouldShow);
        }
    }

    _hideButtons() {
        this.hideRenderable('checkButton');
        this.hideRenderable('rotateRightButton');
        this.hideRenderable('rotateLeftButton');
    }


}
