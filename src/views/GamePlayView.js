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
import DOMBuffer                from 'famous/core/DOMBuffer.js';


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
    @flow.stateStep('slightlyHigher', {transition: {duration: 0}}, layout.scale(2, 2, 2))
    /* To be filled in */
    @flow.stateStep('slightlyHigher', {transition: {duration: 100}}, layout.translate(0, 0, 0))
    @flow.defaultState('default', {transition: {duration: 0}}, layout.size(undefined, undefined), layout.scale(1, 1, 1), layout.translate(0, 0, 0))
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
        scrollView.on('mousewheel', () => {
            this._autoPlay = false;
        });
        scrollView.on('scroll', async ({scrollOffset}) => {
            if (this._autoPlay === true &&
                scrollOffset % (this._maxScrollHeight / (this._selectedShapeSequence.length - 1)) < 2 &&
                (this._maxScrollHeight - scrollOffset) > 5 ) {
                this._pushScrollToNextPositon();
            }
            this._currentPosition = Math.max(0, scrollOffset);
            if (scrollOffset >= (this._maxScrollHeight - 0.001) &&
                !this._isDead &&
                !this._levelComplete &&
                /* Level can only be completed if all slots are filled */
                [...this._selectedShapeSequence].every((shape) => !!shape)
            ) {
                this._levelComplete = true;
                this.hideRenderable('lowerButton');
                this.replaceRenderable('lowerButton', this.nextLevel);
                this.showRenderable('lowerButton');
            }
        });


        for(let i = 0;i<40;i++){
            this.renderables[`debug${i}`] = new Surface({properties: {backgroundColor: 'black', borderRadius: '50%'}});
        }
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
            this._autoPlay = false;
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
            let scrollView = this.shapeSetupView.getScrollView();
            scrollView.applyScrollForce(0);
            scrollView.setVelocity({3: -1.2, 4: -0.9}[this.shapeSetupView.getNumberOfSpaces()] || -0.8);
        }
    }

    async _enterSlideMode() {
        this._inSlideMode = true;
        let {shapeSetupView} = this;
        this._currentShapeWidth = shapeSetupView.getShapeWidth() * 2;
        /* Set the translation a bit more to the top so that the initial shape gets centered in the middle */
        this.shapeSetupView.enterLockedMode();
        //3: /4,
        await this._zoomIn();
        this._selectedShapeSequence = shapeSetupView.getSelectedShapeSequence();
        this._maxScrollHeight = shapeSetupView.getTotalScrollHeight();
        // TODO: Enable auto play
        // this._autoPlay = this._selectedShapeSequence.length === numberOfSpaces;
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
        return this._zoomOut();
    }

    /* Complex zoom in/out code due to performance constraints */
    async _zoomOut() {
        let {shapeSetupView} = this;
        shapeSetupView.decorations.scale = [1, 1, 1];
        DOMBuffer.assignProperty(this.shapeSetupView.getScrollView().group._element.style, 'animation', 'scaled-down 0.5s ease 0s 1 normal forwards running');
        await this.setRenderableFlowState('shapeSetupView', 'default');
        await new Promise((resolve) => setTimeout(resolve, 500));

    }

    async _zoomIn() {
        let {shapeSetupView} = this;
        let numberOfSpaces = shapeSetupView.getNumberOfSpaces();
        DOMBuffer.assignProperty(this.shapeSetupView.getScrollView().group._element.style, 'animation', 'scaled-up 0.5s ease 0s 1 normal forwards running');
        await new Promise((resolve) => setTimeout(resolve, 500));
        DOMBuffer.assignProperty(this.shapeSetupView.getScrollView().group._element.style, 'animation', '');
        shapeSetupView.decorations.flow.states.slightlyHigher.steps[1].transformations[0] =
            layout.translate(0, this._currentShapeWidth *
                (0.25 * (numberOfSpaces - 2)) + shapeSetupView.getInitialMarginSize() * (0.5 * (numberOfSpaces - 2)), 0);
        await this.setRenderableFlowState('shapeSetupView', 'slightlyHigher');
    }
}