/**
 * Created by lundfall on 6/14/16.
 */
import Surface               from 'famous/core/Surface.js';

import {View}                from 'arva-js/core/View.js';
import {layout, options}     from 'arva-js/layout/decorators.js';

import {Shape}               from './Shape.js';
import {ShapeGrid}           from './ShapeGrid.js';
import AnimationController          from 'famous-flex/AnimationController.js';


export class ShapeWithGrid extends View {

    @layout.fullscreen
    grid = new ShapeGrid();

    @layout.animate({transition: {duration: 0}, animation: function () {return {...AnimationController.Animation.Slide.Up(...arguments), opacity: 0}}})
    @layout.size(function(size) { return this.determineShapeSize(size,0)},function(size) {return this.determineShapeSize(size, 1)})
    @layout.origin(0.5,0.5)
    @layout.rotate(0, 0, 0)
    @layout.translate(0, 0, 30)
    shape = this.options.shapeSpec ? new Shape({spec: this.options.shapeSpec}) : {};

    @layout.animate({showInitially:false})
    @layout.size(undefined, 30)
    @layout.translate(0, 0, 30)
    @layout.place('top')
    placeholder = new Surface({content: '?', properties: {fontSize: '100px', textAlign: 'center'}});

    setAutoSpin(autoSpin){
        this._autoSpin = this.layout.options.alwaysLayout = autoSpin;
    }

    determineShapeSize(contextSize, dimension){
        return this.shape.getSize ? this.shape.getSize()[dimension]/(this.grid.getSize()[dimension]/contextSize) : [undefined, undefined];
    }
    
    showShape(spec) {
        this.hideRenderable('shape');
        this.replaceRenderable('shape', new Shape({spec}));
        this.layout.reflowLayout();
        this.renderables.shape.show(this.shape, {transition:{duration:250}})
        this.hideRenderable('placeholder');
    }


    _ensurePlaceholder() {
        if(!this.renderables.shape.get() || !(this.shape instanceof Shape)){
            this.showRenderable('placeholder');
        }
    }

    hideShape() {
        this.hideRenderable('shape');
        this.showRenderable('placeholder');
    }

    constructor(options){
        super(options);
        this.setAutoSpin(options.autoSpin);
        this._spinSpeed = options.spinSpeed || 0.02;
        this._currentRotation = options.startRotation || 0;
        this._ensurePlaceholder();

        this.layout.on('layoutstart', ({size}) => {
            /* Counter-translate the shape since it needed a center origin to rotate center */
            this.shape.decorations.translate[0] = size[0]/2;
            this.shape.decorations.translate[1] = size[1]/2;
            let lineHeight = `${size[1]}px`;
            if(this.placeholder.getProperties().lineHeight !== lineHeight){
                this.placeholder.setProperties({lineHeight});
            }
        });

        this.layouts.push((context) => {
            if(this._autoSpin){
                this.shape.decorations.rotate = [0, 0, this._currentRotation+=this._spinSpeed];
            }
        })
    }

}