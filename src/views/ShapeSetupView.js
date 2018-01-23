import Surface from 'famous/core/Surface.js';
import Timer from 'famous/utilities/Timer.js';
import AnimationController from 'famous-flex/AnimationController.js';
import {Text} from 'arva-kit/text/Text.js';
import {OutlineTextButton} from 'arva-kit/buttons/OutlineTextButton.js'

import {View} from 'arva-js/core/View.js';
import {layout, event, flow} from 'arva-js/layout/decorators.js';
import insertRule from 'insert-rule';
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

let currentLevelIndex = 26;

/* Margin will be set later per level.
 * The margin here is needed so that scrolling can be done when zoomed in.
 * Scrolling is only enabled when sliding the shapes */
@layout.scrollable({enabled: false, layoutOptions: {margins: [0, 0, 0, 0]}, overscroll: false})
export class ShapeSetupView extends View {

    @layout.translate(0, 0, -10)
    @layout.stick.center()
    @layout.size(undefined, (_, height) => height * 2)
    background = new Surface({properties: {backgroundColor: 'rgb(245, 245, 245)'}});

    @layout.animate()
    @layout.translate(0, 0, -10)
    @layout.dock.right(0.5)
    @layout.size(undefined, (_, height) => height * 2)
    @layout.stick.center()
    whiteBackground = new Surface({properties: {backgroundColor: 'white'}});


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
    @event.on('isDragged', function (position, shape) {
        let {shapeSelector} = this;
        let resultFromDragging = this.shapeSlider.onShapeDragFromOtherSide(position, [this._globalShapeWidth, this._globalShapeWidth], shapeSelector.getSelection(), shape);
        if (!resultFromDragging) {
            return shapeSelector.notifyShouldNotSnap(shape);
        }
        let [absolutePositionOfHoveringItem, index] = resultFromDragging;
        shapeSelector.notifyShapeWillSnap(shape, absolutePositionOfHoveringItem, index);
    })
    @layout.translate(0, 0, 100)
    @layout.fullSize()
    shapeSelector = this._createShapeSelectorFromLevel(currentLevelIndex);

    @event.on('shapeChanged', function (index, spec, completeSequence) {
        if (completeSequence) {
            this._onSelectionComplete(completeSequence);
        }
    })
    @layout.animate({
        hide: {
            animation: function () {
                return ({...AnimationController.Animation.Slide.Left(...arguments), opacity: 0})
            }
        }, show: {
            animation: function () {
                return ({...AnimationController.Animation.Fade(...arguments), opacity: 0})
            }
        }
    })
    @layout.dock.left(0.5, 10)
    shapeSlider = this._createShapeSliderFromLevel(currentLevelIndex);

    constructor(options = {}) {
        super(options);
        window.currentLevel = levels[currentLevelIndex];
        document.body.onkeyup = (e) => {
            if (e.keyCode === 0 || e.keyCode === 32) {
                e.preventDefault();
                this.gotoNextLevel();
            }
        };
        //TODO Implement this cheat somewhere
        this.on('nextLevel', () => {
            this.gotoNextLevel();
        });

        this._standardBoxShadow = '1px 3px 37px 0px rgba(168,91,132,1)';
        this._glowingBoxShadow = '1px 3px 97px 5px rgba(168,91,132,1)';

        this._continuouslyCalculateShapeWidth();

        /* Use the 'renderables' to listen for the animationcontroller since the shapeslider itself changes when the level changes */

    }

    enterLockedMode() {
        let numberOfSpaces = this.getNumberOfSpaces();
        // 3: 4/3 4: 6/4
        this._totalScrollHeight = this._lastSeenSize[1] * (((numberOfSpaces - 1) * 2)/numberOfSpaces);
        this.getScrollView().options.layoutOptions.margins[2] = this._totalScrollHeight;
        this.getScrollView().options.enabled = true;
        this.hideRenderable('whiteBackground');
        this.shapeSelector.lockShapes();
        this.shapeSlider.lockShapes();
    }

    getTotalScrollHeight(){
        return this._totalScrollHeight;
    }

    exitLockedMode() {
        let scrollView = this.getScrollView();
        scrollView.setVelocity(8);
        this.getScrollView().options.enabled = false;
        this.showRenderable('whiteBackground');
        this.shapeSelector.unlockShapes();
        this.shapeSlider.unlockShapes();
    }

    _onSelectionComplete(sequence) {
        /* Go into slide mode */
        this._sliding = true;
        this._selectedShapeSequence = sequence;
        let sequenceLength = sequence.length;

    }

    _createShapeSelectorFromLevel(levelIndex) {
        let level = levels[levelIndex];
        return new ShapeSelector({
            showInitially: false,
            shapeSpecs: level.availableShapes,
            rotationMode: level.rotationMode,
            noInbetweenSpaces: level.inbetweenSpaces
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

    _continuouslyCalculateShapeWidth() {
        this.layout.on('layoutstart', ({size}) => {
            let numberOfShapes = levels[currentLevelIndex].inbetweenSpaces + 2;
            let maxWidth = size[0] / 2 - 40;
            this._lastSeenSize = size;
            this._globalShapeWidth = this.shapeSlider.options.shapeWidth =
                this.shapeSelector.options.shapeWidth =
                    Math.min(Math.min(180, maxWidth)
                        , (size[1] - (Settings.shapeSpacing * (numberOfShapes - 1))) /
                        numberOfShapes);
        });
    }

    getShapeWidth() {
        return this._globalShapeWidth;
    }

    getNumberOfSpaces() {
        return levels[currentLevelIndex].inbetweenSpaces + 2;
    }

    getInitialMarginSize() {
        return this._lastSeenSize[1] / (levels[currentLevelIndex].inbetweenSpaces + 2) - this._globalShapeWidth;
    }

    getSelectedShapeSequence() {
        let currentLevel = levels[currentLevelIndex];
        let shapeSequence = [...this.shapeSelector.getSelectedShapeSequence()];
        shapeSequence[0] = currentLevel.startShape;
        shapeSequence[currentLevel.inbetweenSpaces + 1] = currentLevel.endShape;
        return shapeSequence;
    }

    getSize() {
        return [undefined, undefined];
    }

    gotoNextLevel() {
        let newLevel = levels[++currentLevelIndex];
        window.currentLevel = newLevel;
        this.shapeSelector.setSelection(newLevel.availableShapes, newLevel.rotationMode, newLevel.inbetweenSpaces);
        this.replaceRenderable('shapeSlider', this._createShapeSliderFromLevel(currentLevelIndex));
        this.showRenderable('shapeSlider');
        this._cancelSlide();
        this.hideRenderable('nextLevelButton');
    }

    notifyCollidedForIndex(forWhichShapeIndex) {
        let currentLevel = levels[currentLevelIndex];
        /* The very last shape obviously can't be the problem, so we do math.min. If you fail on the very last transition,
         * the one but the last will be marked as problematic */
        this.shapeSelector.notifyCollidedForIndex(Math.min(forWhichShapeIndex, currentLevel.inbetweenSpaces));
    }
}
