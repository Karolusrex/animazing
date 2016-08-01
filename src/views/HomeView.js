import Surface              from 'famous/core/Surface.js';

import {View}               from 'arva-js/core/View.js';
import {layout, options}    from 'arva-js/layout/decorators.js';
import insertRule               from 'insert-rule';
import {Snappable}              from '../components/Snappable.js';
import {ShapeSpecs}              from '../components/ShapeSpecs.js';
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

insertRule('.bar::after', {
    webkitBoxShadow: '1px 30px 47px 0px rgba(178,97,137,1)',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out'
});

insertRule('.bar:hover::after', {
    opacity: 1
});

@layout.margins([30, 50, 50, 50])
export class HomeView extends View {


    @layout.translate(0, 0, -10)
    @layout.fullscreen
    background = new Surface({properties: {backgroundColor: '#2F2F40'}});

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
            levelComplete: "You made it. Let's see if you can complete the other levels..."
        };
        return new Text({content: this.instructions.initial, properties: {textAlign: 'center', color: 'white'}});
    }

    @layout.dock("top", 150)
    shapeSlider = new ShapeSlider({shapeSpecs: [ShapeSpecs.hamburger, , , , ShapeSpecs.fallenHamburger]});

    constructor(options = {}) {
        super(options);
        this.layout.options.alwaysLayout = true;
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

        this.renderables.shapeSelector = new ShapeSelector({
            showInitially: false,
            shapeSpecs: [ShapeSpecs.upPointArrow, ShapeSpecs.upArrow]
        });
        this.renderables.shapeSelectorBackground = new Surface({properties: {backgroundColor: 'white'}});
        this.renderables.shape = new Shape({spec: ShapeSpecs.upPointArrow});
        this.renderables.box = new Surface({properties: {backgroundColor: 'black'}});
        this.renderables.boundingBox = new Surface({properties: {backgroundColor: 'white'}});
        this.renderables.shapeGrid = new ShapeGrid();
        for (let i = 0; i < 200; i++) {
            this.renderables[`debug${i}`] = new Surface({properties: {backgroundColor: 'black'}});
            this.renderables[`debugColor${i}`] = new Surface({
                properties: {
                    borderRadius: '100%',
                    backgroundColor: ['red', 'blue', 'green', 'yellow', 'magenta', 'yellow', 'green', 'green'][i]
                }
            });
            this.renderables[`redDebug${i}`] = new Surface({
                properties: {
                    borderRadius: '100%',
                    backgroundColor: 'red'
                }
            });
            this.renderables[`blueDebug${i}`] = new Surface({
                properties: {
                    borderRadius: '100%',
                    backgroundColor: 'blue'
                }
            });
        }
        let firstSelection = true;
        this.shapeSlider.on('modifyShape', (index) => {
            if(this._sliding){
                this._cancelSlide();
                delete this.renderables.snappable;
            }
            this.instruction.setContent(this.instructions.choose);
            this.renderables.shapeSelector.offerSelection();
            this.renderables.shapeSelector.once('shapeSelected', (spec) => {
                this.instruction.setContent(firstSelection ? this.instructions.encouragement : this.instructions.initial);
                firstSelection = false;
                this.shapeSlider.setSelection(index, spec);
            });
        });

        this._selectedShapeSequence = [ShapeSpecs.hamburger, turnShape(3, ShapeSpecs.upPointArrow), ShapeSpecs.upArrow, turnShape(2, ShapeSpecs.upArrow), ShapeSpecs.upPointArrow];

        this.renderables.shapeSelector.on('rotatingShape', (shape) => {
            this.instruction.setContent(this.instructions.selected);
        });

        this.shapeSlider.on('selectionComplete', (sequence) => {
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


    }


    _initAnimationBehaviour() {
        this.layouts.push((context) => {
            context.set('shapeSelector', {
                size: [undefined, context.size[1]/3],
                align: [0.5, 0.75],
                origin: [0.5, 0.5],
                translate: [0, 0, 30]
            });

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

                if(!associateShapesInInterval(inputPosition, this._selectedShapeSequence, context, this.maxRange, this._isDead)){
                    this._isDead = true;
                    this.instruction.setContent(this.instructions.collision);
                } else if(!this._isDead) {
                    if(inputPosition === this.maxRange){
                        this.instruction.setContent(this.instructions.levelComplete);
                    }
                }
            }
        });
    }

    _cancelSlide() {
        this.instruction.decorations.translate[1] = 0;
        this._sliding = false;
        this._isDead = false;
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
        return ['topBar', 'midBar', 'bottomBar'];
    }

}
