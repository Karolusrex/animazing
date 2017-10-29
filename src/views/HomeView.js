import Surface from 'famous/core/Surface.js';
import Timer from 'famous/utilities/Timer.js';
import AnimationController from 'famous-flex/AnimationController.js';

import {Text} from 'arva-kit/text/Text.js';
import {OutlineTextButton} from 'arva-kit/buttons/OutlineTextButton.js'

import {View} from 'arva-js/core/View.js';
import {layout, event} from 'arva-js/layout/decorators.js';
import insertRule from 'insert-rule';
import {Snappable} from '../components/Snappable.js';
import {ShapeSpecs, ShapeSpec} from '../logic/ShapeSpecs.js';
import {
    associateShapesInInterval,
} from '../util/SpecProcessing.js';
import {Shape} from '../components/Shape.js';
import {ShapeSelector} from '../components/ShapeSelector.js';
import {ShapeGrid} from '../components/ShapeGrid.js';
import {ShapeSlider} from '../components/ShapeSlider.js';

import {LevelStorage} from '../logic/LevelStorage.js';
import {RotationMode} from '../util/SpecProcessing.js';
import {Settings} from '../util/Settings.js';


//TODO Remove global variable
let levels = window.levels = LevelStorage.getLevels();
let collisionGraph = LevelStorage.getCollisionGraph();

let currentLevelIndex = 9;

@layout.dockPadding(5, 10, 10, 10)
export class HomeView extends View {


    @layout.translate(0, 0, -10)
    @layout.fullSize()
    background = new Surface({properties: {backgroundColor: '#2F2F40'}});

    @layout.animate({
        showInitially: false,
        show: {transition: {duration: 10}},
        hide: {transition: {duration: 500}},
        animation: AnimationController.Animation.Fade
    })
    @layout.translate(0, 0, 0)
    @layout.fullSize()
    isDeadIndication = new Surface({properties: {backgroundColor: '#722F37'}});

    @layout.animate({
        showInitially: false,
        show: {
            animation: function () {
                return ({...AnimationController.Animation.Slide.Down(...arguments), opacity: 0});
            }
        },
        /* Hide animation gives the app a slow feel, so it's made instant*/
        hide: {transition: {duration: 0}}
    })
    @layout.size(~100, 40)
    @layout.translate(0, 100, 0)
    @layout.stick.top()
    nextLevelButton = new OutlineTextButton({variation: 'bold', clickEventName: 'nextLevel', content: 'NEXT LEVEL'});


    @event.on('finishedDragging', function () {
      this.shapeSlider.unselectShape();
    })
    @event.on('isDragged', function (position) {
        let absolutePositionOfHoveringItem = this.shapeSlider.onShapeDragFromOtherSide(position, [this._globalShapeWidth, this._globalShapeWidth]);
        if(!absolutePositionOfHoveringItem){
            this.shapeSelector.notifyShouldNotSnap();
        } else {
            this.shapeSelector.notifyShapeWillSnap(absolutePositionOfHoveringItem);
        }
    })
    @layout.translate(0, 0, 100)
    @layout.fullSize()
    shapeSelector = this._createShapeSelectorFromLevel(currentLevelIndex);

    @event.on('shapeChanged', function (index, spec, completeSequence) {
        if (completeSequence) {
            this._onSelectionComplete(completeSequence);
        }
    })
    @event.on('modifyShape', function (index, forbiddenShapes) {
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
    })
    @layout.animate({
        hide: {
            animation: function () {
                return ({...AnimationController.Animation.Slide.Left(...arguments), opacity: 0})
            }
        }, show: {
            animation: function () {
                return ({...AnimationController.Animation.Slide.Right(...arguments), opacity: 0})
            }
        }
    })
    @layout.dock.left(0.5, 10)
    shapeSlider = this._createShapeSliderFromLevel(0);

    constructor(options = {}) {
        super(options);

        insertRule('.bar::after', {
            webkitBoxShadow: '1px 30px 47px 0px rgba(178,97,137,1)',
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out'
        });

        insertRule('.bar:hover::after', {
            opacity: 1
        });

        this.layout.options.alwaysLayout = true;
        let firstNewLevel = true;
        window.currentLevel = levels[currentLevelIndex];
        document.body.onkeyup = (e) => {
            if (e.keyCode === 0 || e.keyCode === 32) {
                e.preventDefault();
                this._eventOutput.emit('nextLevel');
            }
        };
        //TODO Implement this cheat somewhere
        this.on('nextLevel', () => {
            let newLevel = levels[++currentLevelIndex];
            window.currentLevel = newLevel;
            this.shapeSelector.setSelection(newLevel.availableShapes, newLevel.rotationMode);
            this.replaceRenderable('shapeSlider', this._createShapeSliderFromLevel(currentLevelIndex));
            this.showRenderable('shapeSlider');
            this._cancelSlide();
            firstNewLevel = false;
            this.hideRenderable('nextLevelButton');
            /* Change the box shadow back to less glow */
            this._setBoxShadow(this._standardBoxShadow);
        });

        this._standardBoxShadow = '1px 3px 37px 0px rgba(168,91,132,1)';
        this._glowingBoxShadow = '1px 3px 97px 5px rgba(168,91,132,1)';

        this._initSticks();

        this._continuouslyCalculateShapeWidth();

        /* Use the 'renderables' to listen for the animationcontroller since the shapeslider itself changes when the level changes */

        /*this.renderables.shapeSelector.on('offerSelection', (shape) => {
            this.instruction.setContent(this.instructions.choose);
        });


        this.renderables.shapeSelector.on('invalidSelection', (shape) => {
            this.instruction.setContent(this.instructions.attemptSameSubsequent);
        });

        this.renderables.shapeSelector.on('rotatingShape', (shape) => {
            this.instruction.setContent(this.instructions.selected);
        });*/


        this._initDraggable();
        this._initAnimationBehaviour();
    }


    _setBoxShadow(boxShadow) {
        for (let renderableName of ShapeSpec.getBarNames()) {
            this[renderableName].setProperties({boxShadow});
        }
    }

    _onSelectionComplete(sequence) {
        /* Go into slide mode */
        this._sliding = true;
        this._selectedShapeSequence = sequence;
        let sequenceLength = sequence.length;
        let snapPoints = [...Array(sequenceLength).keys()].map((index) => [this.maxRange / (sequenceLength - 1) * (index), 0]);
        let snappable = this.renderables.snappable = new Snappable({
            projection: 'x',
            /*surfaceOptions: {properties: {backgroundColor: 'red'}},*/
            snapPoints,
            xRange: [0, this.maxRange],
            /*yRange: [-this.maxRange - 8, this.maxRange + 8],*/
            scale: 1,
            snapOnDrop: false
        });

        this._slideEndedOnPosition = [0, 0];
        this._playSequence(snappable, snapPoints.slice(1));
        this.renderables.snappable.on('end', () => {
            this._slideEndedOnPosition = this.renderables.snappable.getPosition();
        });
    }

    async _playSequence(snappable, snapPoints) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        for (let point of snapPoints) {
            let wasDead = this._isDead;
            await snappable.setPosition(point);
            if (this._isDead && !wasDead) {
                await new Promise((resolve) => setTimeout(resolve, 400));
            }
        }
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
        let level = levels[levelIndex];
        return new ShapeSelector({
            showInitially: false,
            shapeSpecs: level.availableShapes,
            rotationMode: level.rotationMode
        });
    }

    _createShapeSliderFromLevel(levelIndex) {
        let level = levels[levelIndex];
        return new ShapeSlider({
            rotationMode: level.rotationMode,
            shapeSpecs: [level.startShape,
                ...new Array(level.inbetweenSpaces), level.endShape]
        });
    }

    _initAnimationBehaviour() {
        this.layouts.push((context) => {

            if (this.renderables.snappable) {
                let inputPosition = this.renderables.snappable.getPosition()[0];


                this._drawGuides(context);
                let draggableSpec = {
                    size: [context.size[0] + this.maxRange * 2, context.size[1] * 2],
                    align: [0.5, 0.5],
                    origin: [0.5, 0.5],
                    translate: [0, 0, 70]
                };

                context.set('snappable', draggableSpec);

                let animatingShapeSize = Math.min(context.size[1] / 2, 300);
                this.shapeSlider.setSlideRatio(inputPosition / this.maxRange);
                if (this._isDead) {
                    if (inputPosition >= this._diedAtPosition) {
                        if (!this._isAtDeadPosition) {
                            this._makeDeadAnimation();
                        }
                    } else {
                        this._isAtDeadPosition = false;
                    }
                }
                /* If there is a collision, go into dead mode */
                if (!associateShapesInInterval(inputPosition,
                        this._selectedShapeSequence,
                        context,
                        this.maxRange, undefined,
                        this._isDead ? inputPosition > this._diedAtPosition : false,
                        [0, context.size[1] * 0.65 + 10, 0],
                        [animatingShapeSize, animatingShapeSize])) {
                    if (!this._isDead) {
                        this._diedAtPosition = inputPosition;
                        this._makeDeadAnimation();
                    }

                    this._isDead = true;
                } else if (!this._isDead && inputPosition === this.maxRange && !this._levelComplete) {
                    this._levelComplete = true;
                    this._setBoxShadow(this._glowingBoxShadow);
                    let isLastLevel = currentLevelIndex === levels.length - 1;
                    let isFirstLevel = currentLevelIndex === 0;
                    this.hideRenderable('shapeSlider');
                    if (!isLastLevel) {
                        Timer.setTimeout(this.showRenderable.bind(this, 'nextLevelButton'), 500);
                    }
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

    _restrictSlider([x, y]) {
        return [this._dontGoFurtherIfDead(x), y];
    }

    _dontGoFurtherIfDead(position) {
        return this._isDead ? this._restrictToInbetweenValueRoundUp(position, this._diedAtPosition) : position;
    }

    _restrictToInbetweenValueRoundUp(position, inbetweenValue) {
        let noShapeSpace = levels[currentLevelIndex].inbetweenSpaces + 1;
        let distancePerShape = this.maxRange / noShapeSpace;
        /* Do floor +1 in order to get the exact value also to round up */
        let furthestPoint = Math.floor(1 + inbetweenValue / (distancePerShape)) * (distancePerShape);
        return Math.min(position, furthestPoint);
    }


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


    _initSticks() {
        for (let [i, bar] of ShapeSpec.getBarNames().entries()) {
            this.addRenderable(new Surface({
                content: '',
                classes: ['bar'],
                properties: {
                    backgroundColor: ['#2ecc71', '#8e44ad', '#d35400', '#e67e22', '#27ae60', '#9b59b6'][i],
                    boxShadow: this._standardBoxShadow
                }
            }), bar);
        }
    }

    _continuouslyCalculateShapeWidth() {
        this.layout.on('layoutstart', ({size}) => {
            let numberOfShapes = levels[currentLevelIndex].inbetweenSpaces + 2;
            let maxWidth = size[0] / 2 - 40;
            this._globalShapeWidth = this.shapeSlider.options.shapeWidth =
                this.shapeSelector.options.shapeWidth =
                    Math.min(Math.min(180, maxWidth)
                        , (size[1] - (Settings.shapeSpacing * (numberOfShapes - 1))) /
                        numberOfShapes);
        });
    }
}
