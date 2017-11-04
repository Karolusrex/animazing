import Surface from 'famous/core/Surface.js';

import {View} from 'arva-js/core/View.js';
import {layout, event, flow} from 'arva-js/layout/decorators.js';
import {ShapeSetupView} from './ShapeSetupView';
import {ArrowrightIcon} from 'arva-kit/icons/angular/thin/ArrowrightIcon.js';
import {FloatingImageButton} from 'arva-kit/buttons/FloatingImageButton';
import {ShapeSpecs, ShapeSpec} from '../logic/ShapeSpecs.js';
import {
    associateShapesInInterval,
} from '../util/SpecProcessing.js';

export class GamePlayView extends View {

    _inPlayMode = false;
    _isDead = false;

    @event.on('buttonClick', function () {
        this.shapeSetupView.enterLockedMode();
        this._selectedShapeSequence = this.shapeSetupView.getSelectedShapeSequence();
        setTimeout(() => {
            this._inPlayMode = true;
            this.layout.options.alwaysLayout = true;
            this.setRenderableFlowState('shapeSetupView', 'sequenceRun');
        }, 500)
    })
    @layout.stick.bottomRight()
    @layout.size(true, true)
    @layout.translate(-20, -20, 400)
    playButton = new FloatingImageButton({
        icon: ArrowrightIcon
    });


    @flow.stateStep('sequenceRun', {}, layout.scale(2, 2, 1))
    @layout.size(undefined, undefined)
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
            }), bar);
        }
    }

    constructor(options) {
        super(options);
        this._initSticks();
        this._setupLayout();
        this.shapeSetupView.getScrollView().on('scroll', (scroll)=> {
            this._currentPosition = scroll.scrollOffset;
        });
    }

    _setupLayout() {
        this.layouts.push((context) => {

            if (this._inPlayMode) {
                let inputPosition = this._currentPosition;
                let animatingShapeSize = Math.min(context.size[1] / 2, 300);
                /* If there is a collision, go into dead mode */
                let result = associateShapesInInterval(inputPosition,
                    this._selectedShapeSequence,
                    context,
                    200, undefined,
                    this._isDead ? inputPosition > this._diedAtPosition : false,
                    [0, context.size[1] * 0.65 + 10, 1000],
                    [animatingShapeSize, animatingShapeSize]);
            }
        });
    }
}