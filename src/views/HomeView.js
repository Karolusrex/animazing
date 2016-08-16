import Surface              from 'famous/core/Surface.js';
import Timer                from 'famous/utilities/Timer.js';
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

@layout.margins([5, 10, 10, 10])
export class HomeView extends View {

    @layout.translate(0, 0, -10)
    @layout.fullscreen
    background = new Surface({properties: {backgroundColor: '#2F2F40'}});

    @layout.animate({
        showInitially: false,
        show: {transition: {duration: 10}},
        hide: {transition: {duration: 500}},
        animation: AnimationController.Animation.Fade
    })
    @layout.translate(0, 0, 0)
    @layout.fullscreen
    isDeadIndication = new Surface({properties: {backgroundColor: '#722F37'}});

    @layout.animate({
        showInitially: false,
        show: {
            animation: function () {
                return ({...AnimationController.Animation.Slide.Down(...arguments), opacity: 0})
            }
        },
        /* Hide animation gives the app a slow feel */
        hide: {transition: {duration: 0}}
    })
    @layout.size(~100, 40)
    @layout.translate(0, 100, 0)
    @layout.place('top')
    nextLevelButton = new OutlineTextButton({variation: 'bold', clickEventName: 'nextLevel', content: 'NEXT LEVEL'});

    @layout.translate(0, 0, 10)
    @layout.dock('top', ~27)
    get instruction() {
        this.instructions = {
            initial: "Tap grid in the middle and see what fits inbetween.",
            multiple: "Tap one of the highlighted grids to continue.",
            selected: "Rotate the shape as you want by tapping the arrows.",
            choose: "Choose the shape to appear in the sequence.",
            encouragement: "Well done! Continue like this until you are satisfied with your sequence.",
            swipe: "Now swipe to the right to see the result of what you made.",
            collision: "Oh snapidoodle! There was a collision. You better reconfigure...",
            firstLevelComplete: "Great. Was that too easy? The levels will surely get harder!",
            levelComplete: "You made it. Let's see if you can complete the other levels...",
            newLevel: "The levels always have one unique solution.",
            lastLevel: "This was the last level of the game. Wanna play more? Send me suggestions on new levels!",
            attemptSameSubsequent: "You are unable to pick two subsequent shapes of the same kind. Pick another one or revisit previous choices."
        };
        return new Text({
            content: this.instructions.initial,
            properties: {fontFamily: 'avenir-light', textAlign: 'center', color: 'white'}
        });
    }

    @layout.animate({
        hide: {
            animation: function () {
                return ({...AnimationController.Animation.Slide.Up(...arguments), opacity: 0})
            }
        }, show: {
            animation: function () {
                return ({...AnimationController.Animation.Slide.Down(...arguments), opacity: 0})
            }
        }
    })
    @layout.dock("top", 0.4, 10)
    shapeSlider = this._createShapeSliderFromLevel(0);

    /*@layout.size(undefined, 1 / 3)
     @layout.align(0.5, 0.75)
     @layout.origin(0.5, 0.5)
     @layout.translate(0, 0, 30)*/
    @layout.dock("fill")
    shapeSelector = this._createShapeSelectorFromLevel(0);

    constructor(options = {}) {
        super(options);
        this.layout.options.alwaysLayout = true;
        let firstNewLevel = true;
        this._currentLevelIndex = 0;

        this.on('nextLevel', () => {
            let newLevel = levels[++this._currentLevelIndex];
            this.shapeSelector.setSelection(newLevel.availableShapes);
            this.replaceRenderable('shapeSlider', this._createShapeSliderFromLevel(this._currentLevelIndex));
            this.showRenderable('shapeSlider');
            this._cancelSlide();
            this.instruction.setContent(firstNewLevel ? this.instructions.newLevel : (newLevel.inbetweenSpaces === 1 ? this.instructions.initial : this.instructions.multiple));
            firstNewLevel = false;
            this.hideRenderable('nextLevelButton');
            this._setBoxShadow(this._standardBoxShadow);
        });

        this._standardBoxShadow = '1px 3px 37px 0px rgba(168,91,132,1)';
        this._glowingBoxShadow = '1px 3px 97px 5px rgba(168,91,132,1)';

        for (let [i,bar] of this._getBarNames().entries()) {
            this.addRenderable(new Surface({
                content: '',
                classes: ['bar'],
                properties: {
                    backgroundColor: ['#2ecc71', '#8e44ad', '#d35400', '#27ae60', '#e67e22', '#9b59b6'][i],
                    /*borderRadius: '15px',*/
                    boxShadow: this._standardBoxShadow
                }
            }), bar);
        }

        let firstPartialSelection = true;
        /* Use the 'renderables' to listen for the animationcontroller since the shapeslider itself changes when the level changes */
        this.renderables.shapeSlider.on('shapeChanged', (index, spec, completeSequence) => {
            if (completeSequence) {
                this._onSelectionComplete(completeSequence);
            } else {
                firstPartialSelection = false;
                this.instruction.setContent(firstPartialSelection ? this.instructions.encouragement : this.instructions.initial);
            }
        });
        this.renderables.shapeSlider.on('modifyShape', (index, forbiddenShapes) => {

            /* If we are already running a sequence, then cancel this and go into choosing mode again */
            if (this._sliding) {
                this._cancelSlide();
            }

            this.shapeSelector.offerSelection(forbiddenShapes);
            /* We store the variable this._modifyingShapeIndex to take into account that the user can cancel */
            if (!this._modifyingShapeIndex) {
                this.shapeSelector.once('shapeSelected', (spec) => {
                    this.shapeSlider.setSelection(this._modifyingShapeIndex, spec);
                    this._modifyingShapeIndex = undefined;
                });
            }
            this._modifyingShapeIndex = index;
        });

        this.renderables.shapeSelector.on('offerSelection', (shape) => {
            this.instruction.setContent(this.instructions.choose);
        });

        this.renderables.shapeSelector.on('invalidSelection', (shape) => {
            this.instruction.setContent(this.instructions.attemptSameSubsequent);
        });

        this.renderables.shapeSelector.on('rotatingShape', (shape) => {
            this.instruction.setContent(this.instructions.selected);
        });


        this._initDraggable();
        this._initAnimationBehaviour();
    }

    _setBoxShadow(boxShadow) {
        for (let renderableName of this._getBarNames()) {
            this[renderableName].setProperties({boxShadow});
        }
    }

    _onSelectionComplete(sequence) {
        /* Go into slide mode */
        this._sliding = true;
        this.instruction.setContent(this.instructions.swipe);
        this._selectedShapeSequence = sequence;
        let sequenceLength = sequence.length;
        this.renderables.snappable = new Snappable({
            projection: 'x',
            /*surfaceOptions: {properties: {backgroundColor: 'red'}},*/
            snapPoints: [...Array(sequenceLength).keys()].map((index) => [this.maxRange / (sequenceLength - 1) * (index), 0]),
            xRange: [0, this.maxRange],
            /*yRange: [-this.maxRange - 8, this.maxRange + 8],*/
            scale: 1, restrictFunction: this._restrictSlider,
            snapOnDrop: false
        });
        this._slideEndedOnPosition = [0,0];
        this.renderables.snappable.on('end', () => {
            this._slideEndedOnPosition = this.renderables.snappable.getPosition();
        });

    }

    _initDraggable() {

        this.maxRange = 280;


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
                    size: [context.size[0] + this.maxRange * 2, context.size[1]],
                    align: [0.5, 0.5],
                    origin: [0.5, 0.5],
                    translate: [0, 0, 0]
                };

                context.set('snappable', draggableSpec);

                let animatingShapeSize = Math.min(context.size[1] / 2, 300);
                this.shapeSlider.setSlideRatio(inputPosition / this.maxRange);
                if(this._isDead){
                    if(inputPosition >= this._diedAtPosition){
                        if(!this._isAtDeadPosition){
                            this._makeDeadAnimation();
                        }
                    } else {
                        this._isAtDeadPosition = false;
                    }
                }
                /* If there is a collision, go into dead mode */
                if (!associateShapesInInterval(inputPosition, this._selectedShapeSequence, context, this.maxRange, this._isDead ? inputPosition > this._diedAtPosition : false, levels[this._currentLevelIndex].clockwiseRotate, [0, context.size[1] * 0.65 + 10 + this.getResolvedSize('instruction')[1], 0], [animatingShapeSize, animatingShapeSize])) {
                    if (!this._isDead) {
                        this._diedAtPosition = inputPosition;
                        this._makeDeadAnimation();
                    }

                    this._isDead = true;
                    this.instruction.setContent(this.instructions.collision);
                } else if (!this._isDead && inputPosition === this.maxRange && !this._levelComplete) {
                    this._levelComplete = true;
                    this._setBoxShadow(this._glowingBoxShadow);
                    let isLastLevel = this._currentLevelIndex === levels.length - 1;
                    let isFirstLevel = this._currentLevelIndex === 0;
                    this.hideRenderable('shapeSlider');
                    if (!isLastLevel) {
                        Timer.setTimeout(this.showRenderable.bind(this, 'nextLevelButton'), 500);
                    }
                    this.instruction.setContent(isFirstLevel ? this.instructions.firstLevelComplete : (isLastLevel ? this.instructions.lastLevel : this.instructions.levelComplete));
                }
            }
        });
    }

    _makeDeadAnimation() {
        this._isAtDeadPosition = true;
        if (window.navigator && navigator.vibrate) {
            navigator.vibrate(100);
        }
        this.showRenderable('isDeadIndication');
        this.hideRenderable('isDeadIndication');
    }

    _cancelSlide() {
        this._levelComplete = false;
        this._sliding = false;
        this._isDead = false;
        delete this.renderables.snappable;
    }

    _restrictSlider([x,y]) {
        return [this._restrictToInbetweenValueRoundUp(this._dontGoFurtherIfDead(x),this._slideEndedOnPosition[0]), y];
    }

    _dontGoFurtherIfDead(position) {
        return this._isDead ? this._restrictToInbetweenValueRoundUp(position, this._diedAtPosition) : position;
    }

    _restrictToInbetweenValueRoundUp(position, inbetweenValue) {
        let noShapeSpace = levels[this._currentLevelIndex].inbetweenSpaces + 1;
        let distancePerShape = this.maxRange / noShapeSpace;
        /* Do floor +1 in order to get the exact value also to round up */
        let furthestPoint = Math.floor(1 + inbetweenValue / (distancePerShape))*(distancePerShape);
        return Math.min(position, furthestPoint);
    }

    /*_restrictController(controllerPosition) {
        let restrictedPosition = [...controllerPosition];
        let angle = Math.atan(controllerPosition[1] / controllerPosition[0]);
        let radius = Math.sqrt(Math.pow(controllerPosition[0], 2) + Math.pow(controllerPosition[1], 2));
        if (radius > this.maxRange) {
            restrictedPosition[0] = Math.cos(angle) * this.maxRange * Math.sign(controllerPosition[0]);
            restrictedPosition[1] = Math.sin(angle) * this.maxRange * Math.sign(controllerPosition[0]);
        }
        return restrictedPosition;
    }*/

    _drawGuides(context) {

        /*context.set('verticalGuideLine', {
         size: [1, 100],
         align: [0.5, 0.5],
         origin: [0.5, 0.5],
         translate: [0, 70, 0],
         opacity: 0.8
         });
         context.set('horizontalGuideLine', {
         size: [100, 1],
         align: [0.5, 0.5],
         origin: [0.5, 0.5],
         translate: [0, 10, 0],
         opacity: 0.8
         });*/


    }


    _getBarNames() {
        return ['topBar', 'midBar', 'bottomBar'].sort();
    }

}
