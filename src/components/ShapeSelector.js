/**
 * Created by lundfall on 5/31/16.
 */
import Surface from 'famous/core/Surface.js';
import ImageSurface from 'famous/Surfaces/ImageSurface.js';
import Transitionable from 'famous/transitions/Transitionable';
import Timer from 'famous/utilities/Timer.js';
import Easing from 'famous/transitions/Easing';

import {View} from 'arva-js/core/View.js';
import {combineOptions} from 'arva-js/utils/CombineOptions.js';
import {layout, event} from 'arva-js/layout/decorators.js';
import {OutlineTextButton} from 'arva-kit/buttons/OutlineTextButton.js'
import {ImageButton} from 'arva-kit/buttons/ImageButton.js'
import {replaceColors} from 'arva-kit/icons/views/ReplaceColors.js';
import {Colors} from 'arva-kit/defaults/DefaultColors.js'

import {turnShape} from '../util/SpecProcessing.js';
import {Settings} from '../util/Settings.js';
import {DraggableShape} from './DraggableShapeWithGrid.js';
import AnimationController from 'famous-flex/AnimationController.js';

import arrowImage from './next.png';
import {RotationMode} from '../util/SpecProcessing.js';
import {RotateLeftIcon} from './icons/RotateLeftIcon';
import {CheckIcon} from './icons/CheckIcon';
import {RotateRightIcon} from './icons/RotateRightIcon';


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
        icon: RotateRightIcon
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
        icon: CheckIcon,
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
        icon: RotateLeftIcon
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

        this.setSelection(options.shapeSpecs, this.options.rotationMode, this.options.noInbetweenSpaces);
        options.margins = options.margins || [10, 10, 10, 10];
    }

    setSelection(shapeSpecs, rotationMode, noInbetweenSpaces) {
        this.options.noInbetweenSpaces = noInbetweenSpaces;
        this.options.rotationMode = rotationMode;
        this._finalSelection = [];

        if (this.options.shapeSpecs) {
            this._clearSelection();
        }

        this.options.shapeSpecs = shapeSpecs;
        this._shapeCount = shapeSpecs.length;

        for (let shapeSpec of shapeSpecs) {
            this._addShape(shapeSpec, rotationMode, true);
        }
    }


    notifyShouldNotSnap(draggedShape) {
        draggedShape.snapToPositionWhenDropped([0, 0]);
    }

    hideAllShapes() {
        this._toggleAllShapes(false);
    }

    lockShapes() {
        this._hideButtons();
        this._problematicShape = null;
        for (let index = 0; index < this._shapeCount; index++) {
            let shapeRenderableName = `shape${index}`;
            let shape = this[shapeRenderableName];
            if (!shape) {
                continue;
            }
            if (shape.isHome) {
                this.hideRenderable(shapeRenderableName)
            } else {
                shape.lockShape();
            }
        }
    }

    unlockShapes() {
        for (let index = 0; index < this._shapeCount; index++) {
            let shapeRenderableName = `shape${index}`;
            let shape = this[shapeRenderableName];
            if (!shape) {
                continue;
            }
            this.showRenderable(shapeRenderableName);
            if (this._problematicShape === shape) {
                shape.markAsProblematic();
            }
            shape.unlockShape();
        }

    }

    notifyShapeWillSnap(draggedShape, shapeWillSnapAtPosition, index) {
        this._shapeWillSnapAtPosition = shapeWillSnapAtPosition;
        /* Convert to an absolute position */
        let calculateRelativePositionForDimension = (dimension) =>
            shapeWillSnapAtPosition[dimension] - draggedShape.decorations.translate[dimension];
        draggedShape.snapToPositionWhenDropped([
            calculateRelativePositionForDimension(0),
            calculateRelativePositionForDimension(1)
        ]);
        let previousIndex = this._finalSelection.findIndex((shape) => shape === draggedShape);
        if (previousIndex !== -1 && this._finalSelection[index] !== draggedShape) {
            if (draggedShape.isRemovedFromIndex === undefined) {
                draggedShape.isRemovedFromIndex = previousIndex;
            }
        } else {
            delete draggedShape.isRemovedFromIndex;
        }
        draggedShape.activeExternalIndex = index;
    }

    getSelectedShapeSequence() {
        return this._finalSelection
            .map((shape) => {
                    if (!shape) {
                        return;
                    }
                    let {options: {shapeSpec}, getDeterminedRotation} = shape;
                    return turnShape(Math.round((4 - (getDeterminedRotation() % (Math.PI * 2)) / (Math.PI / 2))) % 4, shapeSpec)
                }
            );
    }

    _onNewSize(width, height) {
        this._lastKnownSize = [width, height];
        let shapeHeight = this.options.shapeWidth || 0;
        for (let shapeIndex = 0; shapeIndex < this._shapeCount; shapeIndex++) {
            let shapeRenderable = this[`shape${shapeIndex}`];
            if (!shapeRenderable) {
                continue;
            }
            shapeRenderable.decorations.size = [shapeHeight, shapeHeight];
            shapeRenderable.decorations.translate[0] = width * .75 - shapeHeight / 2;
            shapeRenderable.decorations.translate[1] = margin / 2 +
                Math.max(0, (this.options.shapeSpecs.indexOf(shapeRenderable.getSpec())) * (margin + shapeHeight));
        }
    }


    _clearSelection() {
        for (let index = 0; index < this._shapeCount; index++) {
            let shapeName = `shape${index}`;
            if(this[shapeName]){
                this.removeRenderable(shapeName);
            }
        }
        this._shapeCount = 0;
    }

    getSelection() {
        return this._finalSelection;
    }


    _onShapeFinishedDrag(shapeRenderable) {
        if (this._problematicShape) {
            this._problematicShape.markAsUnproblematic();
            this._problematicShape = null;
        }
        if (!shapeRenderable.isSnappingToOtherPosition()) {
            delete this._finalSelection[
                shapeRenderable.isRemovedFromIndex !== undefined ? shapeRenderable.isRemovedFromIndex : shapeRenderable.activeExternalIndex];
            delete shapeRenderable.isRemovedFromIndex;
            let stationaryTwinIndex = this._getStationaryTwinIndex(shapeRenderable);
            /* If there is a stationary twin that needs to be replaced */
            if (stationaryTwinIndex !== -1) {
                this._removeShape(stationaryTwinIndex);
            }
            return;
        }

        if (shapeRenderable.isRemovedFromIndex) {
            delete this._finalSelection[shapeRenderable.isRemovedFromIndex];
            delete shapeRenderable.isRemovedFromIndex;
            /* If there are more than 2 in-between spaces it makes sense to re-use old ones, and if the shape doesn't have a duplicate
             * that is positioned at it's starting position */
        } else if (this.options.noInbetweenSpaces > 2 &&
            this._getStationaryTwinIndex(shapeRenderable) === -1
        ) {
            this._addShape(shapeRenderable.getSpec(), this.options.rotationMode, false);
        }

        this._finalSelection[shapeRenderable.activeExternalIndex] = shapeRenderable;
        if ([...this._finalSelection].every((selection, index) => !!selection || !index)
            && this._finalSelection.length === this.options.noInbetweenSpaces + 1) {
            this._eventOutput.emit('selectionComplete');
        }
        shapeRenderable.once('didSnapToPosition', () => {
            shapeRenderable.setAutoSpin(false);
            this._selectedShape = shapeRenderable;
            let currentRotation = shapeRenderable.getRotation();
            let rotationPrecision = this.options.rotationMode === RotationMode.all ? Math.PI / 2 : Math.PI;
            shapeRenderable.setRotation(Math.round(currentRotation / rotationPrecision) * rotationPrecision);
        });
        if (this._canRotateShapes()) {
            this._showRotationControls(shapeRenderable);
        }
    }


    _setNewButtonPositions() {
        let halfOfScreen = this._lastKnownSize[0] / 2 + 22;
        let shapeWillSnapAtPosition = this._shapeWillSnapAtPosition, {shapeWidth} = this.options;
        let yPosition = shapeWillSnapAtPosition[1] + shapeWidth / 2 - 22;
        this.rotateLeftButton.decorations.translate = [halfOfScreen, yPosition, 10];
        this.rotateRightButton.decorations.translate = [halfOfScreen + 50, yPosition, 10];
        this.checkButton.decorations.translate = [halfOfScreen + 100, yPosition, 10];
        /* Reflow in order to put the translates in place */
        this.reflowRecursively();
    }

    _onShapeDrag(shapeRenderable, willDropImmediately) {
        if (!shapeRenderable.isHome && this._canRotateShapes()) {
            shapeRenderable.setAutoSpin(true);
        }
        /* If the shape is just about to drop, it's not useful to exit the configuration mode */
        if (this._selectedShape && !willDropImmediately) {
            this._exitShapeConfigurationMode();
        }
    }

    _canRotateShapes() {
        return this.options.rotationMode !== RotationMode.noRotation;
    }

    _exitShapeConfigurationMode() {
        this._hideButtons();
        this._toggleAllShapes(true);
        this._selectedShape = null;
    }

    _toggleAllShapes(shouldShow) {
        for (let index = 0; index < this._shapeCount; index++) {
            let otherShapeRenderableName = `shape${index}`;
            if (this[otherShapeRenderableName]) {
                this.showRenderable(otherShapeRenderableName, shouldShow);
            }
        }
    }

    _hideButtons() {
        this.hideRenderable('checkButton');
        this.hideRenderable('rotateRightButton');
        this.hideRenderable('rotateLeftButton');
    }


    _showRotationControls(shapeRenderable) {
        let currentShapes = this.options.shapeSpecs;
        for (let index = 0; index < this._shapeCount; index++) {
            let otherShapeRenderableName = `shape${index}`;
            let otherShapeRenderable = this[otherShapeRenderableName];
            if (!otherShapeRenderable) {
                continue;
            }

            if (otherShapeRenderable === shapeRenderable ||
                /* Don't hide renderables that are already in place */
                otherShapeRenderable.isSnappingToOtherPosition()) {
                continue;
            }
            this.hideRenderable(otherShapeRenderableName);
        }
        this._setNewButtonPositions();
        if (currentShapes.length > 1) {
            this.showRenderable('checkButton');
        }
        this.showRenderable('rotateRightButton');
        this.showRenderable('rotateLeftButton');
    }

    notifyCollidedForIndex(forWhichShapeIndex) {
        this._problematicShape = this._finalSelection[forWhichShapeIndex];
    }

    /**
     * As duplicate shapes are added, the size of this._shapeCount will increase more and more, and there will effectively be
     * "holes" in the "array" of shapes.
     *
     * @param index
     * @param shapeSpec
     * @param rotationMode
     * @param showInitially
     * @returns {DraggableShape}
     * @private
     */
    _addShape(shapeSpec, rotationMode, showInitially = true) {
        let index = this._shapeCount++;
        let shapeRenderable = new DraggableShape({
            colorScheme: 'transparent',
            autoSpin: rotationMode !== RotationMode.noRotation,
            shapeSpec,
            startRotation: index * Math.PI / 2
        });

        this.addRenderable(shapeRenderable, `shape${index}`
            /* Size is set properly later in the pre-layout function */
            , layout.size(100, 100), layout.translate(0, 0, 10), layout.animate({showInitially}));
        shapeRenderable.on('isDragged', (position, shape, willDropImmediately) => this._onShapeDrag(shapeRenderable, willDropImmediately));
        shapeRenderable.on('finishedDragging', () => this._onShapeFinishedDrag(shapeRenderable));
        return shapeRenderable;
    }

    _removeShape(index) {
        this.removeRenderable(`shape${index}`);
    }

    _getStationaryTwinIndex(shapeRenderable) {
        return Array(this._shapeCount + 1).fill().findIndex((_, index) =>
                this[`shape${index}`] &&
                this[`shape${index}`].isTwin(shapeRenderable) &&
                !this[`shape${index}`].isSnappingToOtherPosition()
            );
    }
}
