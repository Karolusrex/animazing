/**
 * Created by lundfall on 09/07/16.
 */
import Surface                      from 'famous/core/Surface.js';

import {View}                       from 'arva-js/core/View.js';
import {layout, options}            from 'arva-js/layout/decorators.js';
import {Settings}                   from '../util/Settings.js';
import {ShapeWithGrid}              from './ShapeWithGrid.js';


export class ShapeSlider extends View {
    @layout.place('bottom')
    @layout.size(undefined, 1)
    @layout.translate(0, -10, -10)
    path = new Surface({
        properties: {
            borderBottom: '1px dashed chartreuse',
            backgroundColor: "rgb(15, 15, 236)"
        }
    });

    setSelection(index, shapeSpec) {
        this[`circle${index}`].showShape(shapeSpec);
        this._eventOutput.emit('shapeChanged', index, shapeSpec);
        let chosenSpecSequence = this.getChosenSpecSequence();
        this._requestSelection = false;
        if (chosenSpecSequence.every((spec) => !!spec)) {
            this._eventOutput.emit('selectionComplete', chosenSpecSequence);
        }
    }

    getChosenSpecSequence() {
        return [...Array(this.options.shapeSpecs.length).keys()].map((index) => this[`circle${index}`].shapeWithGrid.getSpec());
    }


    offerSelection(shapeSpec) {
        this._offerSelection = true;
        this._requestSelection = false;
        this.once('shapeSelected', (index) => {
            this.setSelection(index, shapeSpec);
            this._offerSelection = false;
        });
    }


    constructor(options) {
        super(options);
        let lastShapeIndex = options.shapeSpecs.length - 1;
        for (let [index, shapeSpec] of options.shapeSpecs.entries()) {
            let shapeEnabled = index && index !== lastShapeIndex;
            let circle = new ShapeSelection({shapeSpec, enabled: shapeEnabled});
            let circleName = `circle${index}`;
            let circleWidth = 100;
            let circleSize = [circleWidth, circleWidth];
            circle.on('click', () => {
                if(circle.shapeWithGrid.isEnabled()) {
                    this._eventOutput.emit('shapeSelected', index);
                }
            });
            if (index !== lastShapeIndex) {
                this.addRenderable(circle, circleName,
                    layout.dock('left'),
                    layout.size(...circleSize))
            } else {
                this.addRenderable(circle, circleName,
                    layout.size(...circleSize),
                    layout.place('topright'))
            }
        }
        this.on('shapeSelected', (index) => {
            if (!this._offerSelection && !this._requestSelection) {
                this[`circle${index}`].hideShape();
                this._eventOutput.emit('modifyShape', index);
                this._requestSelection = true;
            }
        });
        this.layout.on('layoutstart', ({size}) => {
            let circleWidth = Math.min(size[0], size[1]);
            this.path.decorations.size[0] = size[0] - circleWidth;
            for (let i = 0; i < options.shapeSpecs.length; i++) {
                let {decorations} = this[`circle${i}`];
                decorations.size = [circleWidth, circleWidth];
                if (decorations.dock) {
                    decorations.dock.size[0] = size[0] / lastShapeIndex - circleWidth / lastShapeIndex;
                }
            }
        });
    }
}

class ShapeSelection extends View {
    @layout.dock('bottom', 30)
    @layout.place('bottom')
    @layout.size(20, 20)
    circle = new Surface({
        properties: {
            backgroundColor: Settings.backgroundColor,
            border: '1px dashed chartreuse',
            borderRadius: '100%'
        }
    });

    
    @layout.dock('fill')
    shapeWithGrid = new ShapeWithGrid(this.options);

    showShape() {
        return this.shapeWithGrid.showShape(...arguments);
    }

    hideShape() {
        return this.shapeWithGrid.hideShape(...arguments);
    }
}
