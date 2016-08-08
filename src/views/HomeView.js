import Surface              from 'famous/core/Surface.js';
import AnimationController  from 'famous-flex/AnimationController.js';

import {View}               from 'arva-js/core/View.js';
import {layout, options}    from 'arva-js/layout/decorators.js';
import insertRule               from 'insert-rule';
import {Snappable}              from '../components/Snappable.js';
import {ShapeSpecs}              from '../logic/ShapeSpecs.js';
import {
    associateShapesInInterval,
    turnShape,
    specBoundingBoxSize, shapeBoundingBox
}        from '../util/SpecProcessing.js';
import {Shape}                  from '../components/Shape.js';
import {ShapeSelector}          from '../components/ShapeSelector.js';
import {ShapeGrid}              from '../components/ShapeGrid.js';
import {ShapeSlider}            from '../components/ShapeSlider.js';
import {Text}                   from 'arva-kit/text/Text.js';
import {levels}                 from '../logic/Levels.js';
import {OutlineTextButton}      from 'arva-kit/buttons/OutlineTextButton.js'

insertRule('.bar::after', {
    webkitBoxShadow: '1px 30px 47px 0px rgba(178,97,137,1)',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out'
});

insertRule('.bar:hover::after', {
    opacity: 1
});

@layout.margins([30, 10, 50, 10])
export class HomeView extends View {


    @layout.translate(0, 0, -10)
    @layout.fullscreen
    background = new Surface({properties: {backgroundColor: '#2F2F40'}});

    @layout.animate({
        showInitially: false,
        animation: function() {return ({...AnimationController.Animation.Slide.Down(...arguments), opacity: 0})}
    })
    @layout.size(~100, 40)
    @layout.translate(0, 230, 0)
    @layout.place('center')
    nextLevelButton = new OutlineTextButton({variation: 'bold',clickEventName: 'nextLevel',content: 'NEXT LEVEL'});

    @layout.size(undefined, ~30)
    @layout.translate(0, 0, 10)
    @layout.place('center')
    get instruction() {
        this.instructions = {
            initial: "Tap the highlighted grids to configure your complete sequence.",
            selected: "Rotate the shape as you want by tapping the arrows.",
            choose: "Choose the shape to appear in the sequence.",
            encouragement: "Well done! Continue like this until you are satisfied with your sequence.",
            swipe: "Now swipe to the right to see the result of what you made.",
            collision: "Oh snapidoodle! There was a collision. You better reconfigure...",
            levelComplete: "You made it. Let's see if you can complete the other levels...",
            newLevel: "Enjoy this new level!",
            lastLevel: "This was the last level of the game. Wanna play more? Send me suggestions on new levels!"
        };
        return new Text({content: this.instructions.initial, properties: {textAlign: 'center', color: 'white'}});
    }

    @layout.animate({animation: function() {return ({...AnimationController.Animation.Slide.Down(...arguments), opacity: 0})}})
    @layout.dock("top", 150)
    shapeSlider = this._createShapeSliderFromLevel(0);


    @layout.size(undefined, 1 / 3)
    @layout.align(0.5, 0.75)
    @layout.origin(0.5, 0.5)
    @layout.translate(0, 0, 30)
    shapeSelector = this._createShapeSelectorFromLevel(0);

    constructor(options = {}) {
        super(options);
        this.layout.options.alwaysLayout = true;
        this._currentLevelIndex = 0;

        this.on('nextLevel', () => {
            let newLevel = levels[++this._currentLevelIndex];
            this.shapeSelector.setSelection(newLevel.availableShapes);
            this.hideRenderable('shapeSlider');
            this.replaceRenderable('shapeSlider', this._createShapeSliderFromLevel(this._currentLevelIndex));
            this.showRenderable('shapeSlider');
            this._cancelSlide();
            this.instruction.setContent(this.instructions.newLevel);
            this.hideRenderable('nextLevelButton');
        });

        for (let [i,bar] of this._getBarNames().entries()) {
            this.addRenderable(new Surface({
                content: '',
                classes: ['bar'],
                properties: {
                    backgroundColor: ['#2ecc71', '#8e44ad', '#d35400', '#27ae60', '#e67e22', '#9b59b6'][i],
                    /*borderRadius: '15px',*/
                    webkitBoxShadow: '1px 3px 37px 0px rgba(168,91,132,1)'
                }
            }), bar);
        }

        let firstSelection = true;
        /* Use the 'renderables' to listen for the animationcontroller since the shapeslider itself changes when the level changes */
        this.renderables.shapeSlider.on('modifyShape', (index) => {
            /* If we are already running a sequence, then cancel this and go into choosing mode again */
            if (this._sliding) {
                this._cancelSlide();
            }
            this.instruction.setContent(this.instructions.choose);
            this.shapeSelector.offerSelection();
            this.shapeSelector.once('shapeSelected', (spec) => {
                this.instruction.setContent(firstSelection ? this.instructions.encouragement : this.instructions.initial);
                firstSelection = false;
                this.shapeSlider.setSelection(index, spec);
            });
        });

        this.renderables.shapeSelector.on('rotatingShape', (shape) => {
            this.instruction.setContent(this.instructions.selected);
        });

        this.renderables.shapeSlider.on('selectionComplete', (sequence) => {
            /* Go into slide mode */
            this._sliding = true;
            this.instruction.setContent(this.instructions.swipe);
            this.instruction.decorations.translate[1] += 150;
            this._selectedShapeSequence = sequence;
            let sequenceLength = sequence.length;
            this.renderables.snappable = new Snappable({
                projection: 'x',
                /*surfaceOptions: {properties: {backgroundColor: 'red'}},*/
                snapPoints: [...Array(sequenceLength).keys()].map((index) => [this.maxRange / (sequenceLength - 1) * (index), 0]),
                xRange: [0, this.maxRange],
                /*yRange: [-this.maxRange - 8, this.maxRange + 8],*/
                scale: 1, restrictFunction: this._restrictController,
                snapOnDrop: true
            });
        });

        this._initDraggable();
        this._initAnimationBehaviour();
    }

    _initDraggable() {

        this.maxRange = 200;


        let guideLineProperties = {
            border: '1px',
            borderStyle: 'dashed',
            borderColor: 'chartreuse',
            backgroundColor: "rgb(15, 15, 236)"
        };

        this.renderables.limitedDragIndicator = new Surface({
            properties: {
                backgroundColor: "black",
                borderRadius: '100%'
            }
        });
        this.renderables.dragGuide = new Surface({properties: {backgroundColor: "green", borderRadius: '100%'}});
        this.renderables.verticalGuideLine = new Surface({properties: guideLineProperties});
        this.renderables.horizontalGuideLine = new Surface({properties: guideLineProperties});


    }


    _createShapeSelectorFromLevel(levelIndex) {
        return new ShapeSelector({
            showInitially: false,
            shapeSpecs: levels[levelIndex].availableShapes
        });
    }

    _createShapeSliderFromLevel(levelIndex) {
        return new ShapeSlider({shapeSpecs: [levels[levelIndex].startShape, ...new Array(levels[levelIndex].inbetweenSpaces), levels[levelIndex].endShape]});
    }

    _initAnimationBehaviour() {
        this.layouts.push((context) => {

            if (this.renderables.snappable) {
                let inputPosition = this.renderables.snappable.getPosition()[0];


                this._drawGuides(context);
                let draggableSpec = {
                    size: [context.size[0], context.size[1]],
                    align: [0.5, 0.5],
                    origin: [0.5, 0.5],
                    translate: [0, 0, 0]
                };

                context.set('snappable', draggableSpec);

                /* If there is a collision, go into dead mode */
                if (!associateShapesInInterval(inputPosition, this._selectedShapeSequence, context, this.maxRange, this._isDead)) {
                    this._isDead = true;
                    this.instruction.setContent(this.instructions.collision);
                } else if (!this._isDead) {
                    if (inputPosition === this.maxRange) {
                        let isLastLevel = this._currentLevelIndex === levels.length - 1;
                        if(!isLastLevel){
                            this.showRenderable('nextLevelButton');
                        }
                        this.instruction.setContent(isLastLevel ? this.instructions.lastLevel : this.instructions.levelComplete);

                    }
                }
            }
        });
    }

    _cancelSlide() {
        this.instruction.decorations.translate[1] = 0;
        this._sliding = false;
        this._isDead = false;
        delete this.renderables.snappable;
    }


    _restrictController(controllerPosition) {
        let restrictedPosition = [...controllerPosition];
        let angle = Math.atan(controllerPosition[1] / controllerPosition[0]);
        let radius = Math.sqrt(Math.pow(controllerPosition[0], 2) + Math.pow(controllerPosition[1], 2));
        if (radius > this.maxRange) {
            restrictedPosition[0] = Math.cos(angle) * this.maxRange * Math.sign(controllerPosition[0]);
            restrictedPosition[1] = Math.sin(angle) * this.maxRange * Math.sign(controllerPosition[0]);
        }
        return restrictedPosition;
    }

    _drawGuides(context) {

        context.set('verticalGuideLine', {
            size: [1, this.maxRange * 2],
            align: [0.5, 0.5],
            origin: [0.5, 0.5],
            translate: [0, 0, 0],
            opacity: 0.8
        });
        context.set('horizontalGuideLine', {
            size: [this.maxRange * 2, 1],
            align: [0.5, 0.5],
            origin: [0.5, 0.5],
            translate: [0, 0, 0],
            opacity: 0.8
        });


    }


    _getBarNames() {
        return ['topBar', 'midBar', 'bottomBar'].sort();
    }

}
