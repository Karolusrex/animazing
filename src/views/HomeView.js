import _                    from 'lodash';
import Surface              from 'famous/core/Surface.js';
import Easing               from 'famous/transitions/Easing';

import {View}               from 'arva-js/core/View.js';
import {layout, options}    from 'arva-js/layout/decorators.js';
import Draggable                from 'famous/modifiers/Draggable';
import StateModifier            from 'famous/modifiers/StateModifier';
import Transitionable           from 'famous/transitions/Transitionable';
import SnapTransition           from 'famous/transitions/SnapTransition';
import RenderNode               from 'famous/core/RenderNode';
import insertRule               from 'insert-rule';
import {Snappable}              from '../components/Snappable.js';
import {Shapes}                 from '../components/Shapes.js';
import {associateShapesInInterval,
    turnShape,
    specBoundingBoxSize, shapeBoundingBox}        from '../util/SpecProcessing.js';
import {Shape}                  from '../components/Shape.js';
import {ShapeSelector}          from '../components/ShapeSelector.js';
import {ShapeGrid}              from '../components/ShapeGrid.js';

insertRule('.bar::after', {
    webkitBoxShadow: '1px 30px 47px 0px rgba(178,97,137,1)',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out'
});

insertRule('.bar:hover::after', {
    opacity: 1
});


export class HomeView extends View {

    @layout.fullscreen
    background = new Surface({properties: {backgroundColor: '#2F2F40'}});


    constructor(options = {}) {
        super(options);
        this.layout.options.alwaysLayout = true;
        for (let [i,bar] of this._getBarNames().entries()) {
            this.addRenderable(new Surface({
                content: '',
                classes: ['bar'],
                properties: {
                    backgroundColor: ['red', 'blue', 'green'][i],
                    /*borderRadius: '15px',*/
                    webkitBoxShadow: '1px 3px 37px 0px rgba(168,91,132,1)'
                }
            }), bar);
        }
        this.renderables.shapeSelector = new ShapeSelector({shapes: [Shapes.twistedMenu, Shapes.upArrow, Shapes.upPointArrow]});
        this.renderables.shapeSelectorBackground = new Surface({properties: {backgroundColor: 'white'}});
        this.renderables.shape = new Shape({shape: Shapes.upPointArrow});
        this.renderables.box = new Surface({properties: {backgroundColor: 'black'}});
        this.renderables.boundingBox = new Surface({properties: {backgroundColor: 'white'}});
        this.renderables.shapeGrid = new ShapeGrid();
        this._initDraggable();
        this._initAnimationBehaviour();
    }

    _initDraggable() {

        this.maxRange = 100;


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

        this.renderables.snappable = new Snappable({
            projection: 'x',
            snapPoints: [[0, 0], [this.maxRange / 4, 0], [0, 0], [this.maxRange / 2, 0], [3 * this.maxRange / 4, 0], [this.maxRange, 0]],
            xRange: [0, this.maxRange],
            /*yRange: [-this.maxRange - 8, this.maxRange + 8],*/
            scale: 1, restrictFunction: this._restrictController,
            snapOnDrop: true
        });
    }


    _initAnimationBehaviour() {
        this.layouts.push((context) => {
            let inputPosition = this.renderables.snappable.getPosition();


            this._drawGuides(context, inputPosition, this.renderables.snappable.getUnSnappedPosition());
            let draggableSpec = {
                size: [context.size[0], context.size[1]],
                align: [0.5, 0.5],
                origin: [0.5, 0.5],
                translate: [0, 0, 0]
            };

            context.set('snappable', draggableSpec);

            associateShapesInInterval(inputPosition[0], [Shapes.startState, turnShape(1, Shapes.startState), turnShape(2, Shapes.upArrow), turnShape(3, Shapes.upPointArrow), Shapes.upPointArrow], context, this.maxRange);
        });
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

    _drawGuides(context, inputPosition, controllerPosition) {

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


         context.set('shapeSelector', {
         size: [undefined, 200],
         align: [0.5, 0.75],
         origin: [0.5, 0.5],
         translate: [0, 0, 30]
         });

        /*context.set('shapeSelectorBackground', {
            size: [undefined, 100],
            align: [0.5, 0.7],
            origin: [0.5, 0.5],
            translate: [0, 0, 10]
        });*/


    }


    _getBarNames() {
        return ['topBar', 'midBar', 'bottomBar'];
    }

}
