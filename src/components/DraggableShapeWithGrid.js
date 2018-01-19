import {layout, event}  from 'arva-js/layout/decorators.js';
import Transitionable   from 'famous/transitions/Transitionable.js';
import Easing           from 'famous/transitions/Easing.js';

import {ShapeWithFrame} from './ShapeWithFrame';
import {Snappable}      from './Snappable';
import Surface          from 'famous/core/Surface.js';
import {Colors}         from 'arva-kit/defaults/DefaultColors.js';

export class DraggableShape extends ShapeWithFrame {

    _snapBackTransitionable = new Transitionable(0);
    _destination = [0, 0];
    /* Whether the shape is "home", which means that it's at its starting position (0, 0) */
    isHome = true;

    @event.on('update', function(dragEvent) {
        this._eventOutput.emit('isDragged', this.activatedFrame.getLastAbsoluteTranslate(), this);
        this.decorations.extraTranslate = [dragEvent.position[0], dragEvent.position[1], 10];
        /* Increase the z index in order to make sure that the translate is constantly staying high */
        this.snappable.decorations.translate = [-dragEvent.position[0], -dragEvent.position[1], 1000];
        /* Temporarily increase the size of the draggable area in order to prevent the drag from losing focus */
        this.snappable.decorations.size = [9999, 9999];
    })
    @event.on('end', function(dragEvent) {
        /* For consistency, pretend that this item was dragged just now
        *  (sometimes end event fires without the update event) */
        this._eventOutput.emit('isDragged', this.activatedFrame.getLastAbsoluteTranslate(), this);
        this.snappable.decorations.translate[2] = 50;
        this.snappable.decorations.size = [undefined, undefined];
        this._snapToPosition();
        this._eventOutput.emit('finishedDragging');
    })
    @layout.animate()
    @layout.translate(0, 0, 50)
    @layout.size(undefined, undefined)
    @layout.stick.center()
    snappable = new Snappable({
        xRange: [-1000, 1000],
        yRange: [-1000, 1000],
        scale: 1,
        snapOnDrop: false
    });

    constructor(options){
        super({...options,
            activated: true
        });
        this.layout.on('layoutend', () => {
            //TODO For now it's easiest to continuously layout. There might be ways around this though
            this.layout.options.alwaysLayout = true;
        });
        this.layout.on('layoutstart', () => {
            if(this._snapBackTransitionable.isActive()){
                let tweenValue = this._snapBackTransitionable.get();
                let convertToNewPosition = (dimension) =>
                    this._startingPoint[dimension] - (this._startingPoint[dimension] - this._destination[dimension]) * tweenValue;

                this.decorations.extraTranslate = [
                    convertToNewPosition(0),
                    convertToNewPosition(1),
                    10
                ];
            }
        })
    }

    snapToPositionWhenDropped([x, y]) {
        this._destination = [x, y];
    }

    isSnappingToOtherPosition() {
        return this._destination[0] !== 0 || this._destination[1] !== 0;
    }

    _snapToPosition() {
        this._snapBackTransitionable.set(0);
        this._snapBackTransitionable.set(1,
            {curve: Easing.outCubic, duration: 300},
            () =>  this._eventOutput.emit('didSnapToPosition')
        );
        this.snappable.setPosition(this._destination);
        this.isHome = !this.isSnappingToOtherPosition();
        this._startingPoint = this.decorations.extraTranslate;
        this.snappable.decorations.translate = [-this._destination[0], -this._destination[1], 50];
        this._eventOutput.emit('dragEnded', this.activatedFrame.getLastAbsoluteTranslate());
    }

    lockShape() {
        super.lockShape();
        this.hideRenderable(`snappable`);
        this.hideRenderable(`activatedFrame`);
    }

    unlockShape() {
        super.unlockShape();
        this.showRenderable(`snappable`);
        this.showRenderable(`activatedFrame`);
        this.snappable.enable();
    }


    markAsProblematic() {
        this.activatedFrame.setProperties({boxShadow: this.getBoxShadowString().replace(/rgba\(.+\)/, Colors.PrimaryUIColor)});
    }

    markAsUnproblematic() {
        this.activatedFrame.setProperties({boxShadow: this.getBoxShadowString()});
    }

}