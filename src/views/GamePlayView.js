import Surface                  from 'famous/core/Surface.js';

import {View}                   from 'arva-js/core/View.js';
import {layout, event, flow}    from 'arva-js/layout/decorators.js';
import {ShapeSetupView}         from './ShapeSetupView';
import {ArrowrightIcon}         from 'arva-kit/icons/angular/thin/ArrowrightIcon.js';
import {ArrowleftIcon}          from 'arva-kit/icons/angular/thin/ArrowleftIcon.js';
import {FloatingImageButton}    from 'arva-kit/buttons/FloatingImageButton';
import {ShapeSpecs, ShapeSpec}  from '../logic/ShapeSpecs.js';
import {
    associateShapesInInterval,
}                               from '../util/SpecProcessing.js';
import {PlayIcon}               from '../components/icons/PlayIcon';
import {StopIcon}               from '../components/icons/StopIcon';


export class GamePlayView extends View {

    _inPlayMode = false;
    _inSlideMode = false;
    _isDead = false;
    _currentPosition = 0;


    @event.on('nextLevel', async function () {
        await this._exitSlideMode();
        this._levelComplete = false;
        this.shapeSetupView.gotoNextLevel();
    })
    @event.on('buttonClick', function () {
        if (!this._inSlideMode) {
            this._enterSlideMode();
        } else {
            this._exitSlideMode();
        }
    })
    @layout.stick.bottomRight()
    @layout.animate()
    @layout.size(64, 64)
    @flow.defaultOptions()
    @layout.translate(-20, -20, 400)
    get lowerButton() {
        let buttonOptions = {
            imageSize: [24, 24],
            backgroundProperties: {boxShadow: 'rgba(255, 63, 53, 0.5) 0px 8px 32px 0px'}
        };
        this.playButton = new FloatingImageButton({
            icon: PlayIcon,
            ...buttonOptions
        });
        this.stopButton = new FloatingImageButton({
            icon: StopIcon,
            ...buttonOptions,
            imageSize: [20, 20]
        });
        this.nextLevel = new FloatingImageButton({
            icon: ArrowrightIcon,
            clickEventName: 'nextLevel',
            ...buttonOptions
        });
        return this.playButton;
    }

    @event.on('selectionComplete', function () {
        this.decorateRenderable('lowerButton', layout.size(80, 80));
        setTimeout(() => this.decorateRenderable('lowerButton', layout.size(64, 64)), 300);
    })
    @flow.stateStep('sequenceRun', {transition: {duration: 500}}, layout.scale(2, 2, 1))
    @flow.defaultState('default', {transition: {duration: 500}}, layout.size(undefined, undefined), layout.scale(1, 1, 1), layout.translate(0, 0, 0))
    shapeSetupView = new ShapeSetupView();

    _initSticks() {
        for (let [i, bar] of ShapeSpec.getBarNames().entries()) {
            this.addRenderable(new Surface({
                content: '',
                classes: ['bar'],
                properties: {
                    backgroundColor: ['#2ecc71', '#8e44ad', '#d35400', '#e67e22', '#27ae60', '#9b59b6'][i],
                    boxShadow: this._standardBoxShadow
                }
            }), bar, event.pipe('shapeSetupView'));
        }
    }

    constructor(options) {
        super(options);
        this._initSticks();
        this._setupLayout();
        let {shapeSetupView} = this;
        let scrollView = shapeSetupView.getScrollView();
        scrollView.on('swipestart', () => {
            this._autoPlay = false;
        });
        shapeSetupView.getScrollView().on('scroll', async ({scrollOffset}) => {
            if (this._autoPlay === true &&
                scrollOffset % (this._maxScrollHeight / this._selectedShapeSequence.length) < 1 &&
                scrollView.getVelocity() < 0.1) {
                this._pushScrollToNextPositon();
            }
            this._currentPosition = Math.max(0, scrollOffset);
            if (scrollOffset >= this._maxScrollHeight && !this._isDead && !this._levelComplete) {
                this._levelComplete = true;
                this.hideRenderable('lowerButton');
                this.replaceRenderable('lowerButton', this.nextLevel);
                this.showRenderable('lowerButton');
            }
        });
    }

    @layout.animate({
        showInitially: false,
        show: {transition: {duration: 10}},
        hide: {transition: {duration: 500}},
    })
    @layout.translate(0, 0, 0)
    @layout.fullSize()
    isDeadIndication = new Surface({properties: {backgroundColor: '#722F37'}});

    _setupLayout() {
        this.layouts.push((context) => {

            if (this._inPlayMode) {
                let inputPosition = this._currentPosition;
                /* If there is a collision, go into dead mode */
                let [didCollide, indexOfNextShape] = associateShapesInInterval(inputPosition,
                    this._selectedShapeSequence,
                    context,
                    this._maxScrollHeight,
                    undefined,
                    this._isDead ? inputPosition > this._diedAtPosition : false,
                    [0, context.size[1] * 0.5, 1000],
                    [this._currentShapeWidth, this._currentShapeWidth]);
                if (didCollide) {
                    this._dieAtPosition(inputPosition, indexOfNextShape);
                }
            }
        });
    }

    _dieAtPosition(inputPosition, forWhichShapeIndex) {
        if (!this._isDead) {
            this.shapeSetupView.notifyCollidedForIndex(forWhichShapeIndex);
            this._diedAtPosition = inputPosition;
            this._isDead = true;
            if (window.navigator && navigator.vibrate) {
                navigator.vibrate(100);
            }
            this.showRenderable('isDeadIndication');
            this.hideRenderable('isDeadIndication');
        }
    }

    _pushScrollToNextPositon() {
        if (this._autoPlay) {
            // todo
            // this.shapeSetupView.getScrollView().setVelocity(-0.15);
        }
    }

    async _enterSlideMode() {
        this._inSlideMode = true;
        let {shapeSetupView} = this;
        this._currentShapeWidth = shapeSetupView.getShapeWidth() * 2;
        //3: /4,
        let numberOfSpaces = shapeSetupView.getNumberOfSpaces();
        shapeSetupView.decorations.flow.states.sequenceRun.steps[0].transformations[1] =
            layout.translate(0, this._currentShapeWidth *
                (0.25 * (numberOfSpaces - 2)) + shapeSetupView.getInitialMarginSize() * (0.5 * (numberOfSpaces - 2)), 0);
        await this.setRenderableFlowState('shapeSetupView', 'sequenceRun');
        /* Set the translation a bit more to the top so that the initial shape gets centered in the middle */
        this.shapeSetupView.enterLockedMode();
        this._selectedShapeSequence = shapeSetupView.getSelectedShapeSequence();
        this._maxScrollHeight = shapeSetupView.getTotalScrollHeight();
        this._autoPlay = true;
        setTimeout(this._pushScrollToNextPositon, 100);
        this._inPlayMode = true;
        this._isDead = false;
        this.layout.options.alwaysLayout = true;
        this.hideRenderable('lowerButton');
        this.replaceRenderable('lowerButton', this.stopButton);
        this.showRenderable('lowerButton');

    }

    _exitSlideMode() {
        this.shapeSetupView.exitLockedMode();
        this._autoPlay = false;
        this._inPlayMode = false;
        this._inSlideMode = false;
        this._isDead = false;
        this.hideRenderable('lowerButton');
        this.replaceRenderable('lowerButton', this.playButton);
        this.showRenderable('lowerButton');
        this.layout.options.alwaysLayout = false;
        return this.setRenderableFlowState('shapeSetupView', 'default');
    }
}