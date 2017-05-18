/**
 * Created by lundfall on 09/07/16.
 */
import Surface                      from 'famous/core/Surface.js';

import {View}                       from 'arva-js/core/View.js';
import {layout}                     from 'arva-js/layout/decorators.js';
import {ShapeWithGrid}              from './ShapeWithGrid.js';
import {Settings}                   from '../util/Settings.js';
import {RotationMode}               from '../util/SpecProcessing.js';

export class ShapeSlider extends View {
    @layout.stick.bottom()
    @layout.size(undefined, 1)
    @layout.translate(0, -10, -10)
    path = new Surface({
        properties: {
            borderBottom: '1px dashed chartreuse',
            backgroundColor: "rgb(15, 15, 236)"
        }
    });

    @layout.size(18, 18)
    @layout.align(0, 1)
    @layout.origin(0.5, 0.5)
    @layout.translate(0, 0, 20)
    slide = new Surface({
        properties: {
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }
    });

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


    constructor(options) {
        super(options);

        let lastShapeIndex = options.shapeSpecs.length - 1;
        for (let [index, shapeSpec] of options.shapeSpecs.entries()) {
            let shapeEnabled = index && index !== lastShapeIndex;
            let circle = new ShapeSelection({ shapeSpec, enabled: shapeEnabled });
            let circleName = `circle${index}`;
            let circleWidth = 100;
            let circleSize = [circleWidth, circleWidth];
            circle.on('click', () => {
                if (circle.shapeWithGrid.isEnabled()) {
                    this._eventOutput.emit('shapeChosen', index);
                }
            });
            if (index !== lastShapeIndex) {
                this.addRenderable(circle, circleName,
                    layout.dock.left(),
                    layout.size(...circleSize))
            } else {
                this.addRenderable(circle, circleName,
                    layout.size(...circleSize),
                    layout.stick.topRight())
            }
        }


        this.on('shapeChosen', this._onShapeChosen);
        this._slidedRatio = 0;
        this.layout.on('layoutstart', this._onLayoutStart);
        this._selectSingleSpaceIfApplicable();
    }

    setRotationMode(rotationMode) {
        this._rotationMode = rotationMode;
    }

    setSlideRatio(ratio) {
        this._slidedRatio = ratio;
        this.layout.reflowLayout();
    }

    /**
     * If there's only one blank space, then it is chosen by default
     * @private
     */
    _selectSingleSpaceIfApplicable() {
        if (this.options.shapeSpecs.length === 3) {
            /* Unfortunately, setTimeout is necessary here due to limitation of not being able to listen to
             * events during construction
             */
            this._eventOutput.emit('shapeChosen', 1, []);
        }
    }

    _onShapeChosen(index) {
        let previouslySelectedShape = this._selectedShape;
        if (previouslySelectedShape) {
            previouslySelectedShape.makeEmpty();
        }
        let selectedShape = this[`circle${index}`];
        selectedShape.hideShape();
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

    _onLayoutStart({ size }) {
        let { options } = this;
        let sequenceLength = options.shapeSpecs.length;
        let lastShapeIndex = sequenceLength - 1;

        let maxHeight = size[1] - 30;
        let circleWidth = Math.min(Math.min(180, maxHeight), (size[0] - (Settings.shapeSpacing * (sequenceLength - 1))) / (sequenceLength));
        let noCircles = options.shapeSpecs.length;
        this.path.decorations.size[0] = size[0] - circleWidth;
        let circleHeight = circleWidth + 30;
        let circleYOffset = 0;
        this.path.decorations.translate[1] = circleYOffset + circleWidth - size[1] + 20;
        this.slide.decorations.translate[0] = this._slidedRatio * (size[0] - circleWidth) + circleWidth / 2;
        this.slide.decorations.translate[1] = circleYOffset + circleWidth - size[1] + 20;

        for (let i = 0; i < noCircles; i++) {
            let { decorations } = this[`circle${i}`];
            decorations.size = [circleWidth, circleHeight];
            decorations.translate = [0, circleYOffset, 0];
            /* For all except the last one */
            if (decorations.dock) {
                decorations.dock.size[0] = size[0] / lastShapeIndex - circleWidth / lastShapeIndex;
            }
        }
    }
}

class ShapeSelection extends View {
    @layout.dock.bottom(30)
    @layout.stick.bottom()
    @layout.size(20, 20)
    circle = new Surface({
        properties: {
            backgroundColor: Settings.backgroundColor,
            border: '1px dashed chartreuse',
            borderRadius: '100%'
        }
    });


    @layout.dock.fill()
    shapeWithGrid = new ShapeWithGrid(this.options);

    showShape() {
        return this.shapeWithGrid.showShape(...arguments);
    }

    hideShape() {
        return this.shapeWithGrid.hideShape(...arguments);
    }

    makeEmpty() {
        return this.shapeWithGrid.makeEmpty(...arguments);
    }
}
