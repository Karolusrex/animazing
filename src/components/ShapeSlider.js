/**
 * Created by lundfall on 09/07/16.
 */
import Surface          from 'famous/core/Surface.js';
import Timer            from 'famous/utilities/Timer.js';

import {View}           from 'arva-js/core/View.js';
import {layout}         from 'arva-js/layout/decorators.js';

import {ShapeWithFrame} from './ShapeWithFrame.js';
import {RotationMode}   from '../util/SpecProcessing.js';
import {DraggableShape} from './DraggableShapeWithGrid';

export class ShapeSlider extends View {

    constructor(options) {
        super(options);

        let lastShapeIndex = options.shapeSpecs.length - 1;
        for (let [index, shapeSpec] of options.shapeSpecs.entries()) {
            let shapeEnabled = index && index !== lastShapeIndex;
            let circle = new ShapeWithFrame({shapeSpec, enabled: shapeEnabled});
            let circleName = `circle${index}`;
            let circleWidth = 100;
            let circleSize = [circleWidth, circleWidth];

            this.addRenderable(circle, circleName,
                layout.dock.top(circleSize[1]),
                layout.stick.center(),
                layout.size(...circleSize))

        }

        this.on('shapeChosen', this._onShapeChosen);
        this.onNewSize(this._onNewSize);
    }

    setSelection(index, shapeSpec) {
        this[`circle${index}`].showShape(shapeSpec);
        this._selectedShape = undefined;

        let chosenSpecSequence = this.getChosenSpecSequence();
        this._requestSelection = false;
        let completeSequence;
        if (chosenSpecSequence.every((spec) => !!spec)) {
            completeSequence = chosenSpecSequence;
        }
        this._eventOutput.emit('shapeChanged', index, shapeSpec, completeSequence);

    }

    getChosenSpecSequence() {
        return [...Array(this.options.shapeSpecs.length).keys()].map((index) => this[`circle${index}`].shapeWithGrid.getSpec());
    }

    offerSelection(shapeSpec) {
        this._offerSelection = true;
        this._requestSelection = false;
        this.once('shapeChosen', (index) => {
            this.setSelection(index, shapeSpec);
            this._offerSelection = false;
        });
    }

    onShapeDragFromOtherSide(foreignAbsolutePosition, foreignSize) {
        let {options} = this;
        let {shapeWidth} = options;
        if (!this._absoluteShapePositions) {
            return this.unselectShape();
        }
        /* Assume that they are vertically aligned, in they all have the same x-axis values */
        let firstShapePosition = this._absoluteShapePositions[0];
        let xAlignments = [firstShapePosition[0], firstShapePosition[0] + shapeWidth];

        let foreignAbsoluteCenter = [foreignAbsolutePosition[0] + foreignSize[0] / 2, foreignAbsolutePosition[1] + foreignSize[1] / 2];
        /* We're not dragging within an interesting area */
        if (foreignAbsoluteCenter[0] > xAlignments[1] || foreignAbsoluteCenter[0] < xAlignments[0]) {
            return this.unselectShape();
        }

        let hoveredItemIndex = this._absoluteShapePositions.findIndex((potentialItem, index) =>
            /* Ignore the first one and the last one */
            index > 0 && index !== this._absoluteShapePositions.length - 1 &&
            potentialItem[1] < foreignAbsoluteCenter[1] && potentialItem[1] + shapeWidth > foreignAbsoluteCenter[1]
        );
        /* Not hovering over any item */
        if(hoveredItemIndex === -1){
            return this.unselectShape();
        }
        let shapeObject = this[`circle${hoveredItemIndex}`];
        this._currentlyHighlightedShape = shapeObject;
        this._currentlyHighlightedShape.select();
        return [this._absoluteShapePositions[hoveredItemIndex], hoveredItemIndex];
    }

    setRotationMode(rotationMode) {
        this._rotationMode = rotationMode;
    }

    setSlideRatio(ratio) {
        this._slidedRatio = ratio;
        this.layout.reflowLayout();
    }


    unselectShape() {
        this._currentlyHighlightedShape && this._currentlyHighlightedShape.unselect();
    }

    _onShapeChosen(index) {
        let previouslySelectedShape = this._selectedShape;
        if (previouslySelectedShape) {
            previouslySelectedShape.makeEmpty();
        }
        let selectedShape = this[`circle${index}`];
        selectedShape.hideShape();
        this._slidedRatio = 0;
        let forbiddenShapes = [];
        for (let neighbourIndex of [index - 1, index + 1]) {
            if (this[`circle${neighbourIndex}`]) {
                let spec = this[`circle${neighbourIndex}`].shapeWithGrid.getSpec();
                if (spec) {
                    forbiddenShapes.push(spec);
                }
            }
        }
        this._eventOutput.emit('modifyShape', index, forbiddenShapes);
        this._selectedShape = selectedShape;
        this._requestSelection = true;
    }

    _onNewSize(size) {
        let {options} = this;
        let sequenceLength = options.shapeSpecs.length;

        let circleWidth = options.shapeWidth || 0;
        let noCircles = options.shapeSpecs.length;

        for (let i = 0; i < noCircles; i++) {
            let {decorations} = this[`circle${i}`];
            decorations.size = [circleWidth, circleWidth];
            decorations.dock.size[1] = size[1] / sequenceLength;
        }

        /* After the layout has ended, the new shape positions should be set in a few ticks! */
        Timer.after(() =>
            this._absoluteShapePositions = options.shapeSpecs
                .map((shape, index) =>
                this[`circle${index}`].getFrame().getLastAbsoluteTranslate()
            )
        , 10);
    }
}
