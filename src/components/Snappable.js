/**
 * Created by lundfall on 5/1/16.
 */

import {View}                   from 'arva-js/core/View.js';

import Draggable                from 'famous/modifiers/Draggable';
import Surface                  from 'famous/core/Surface.js';
import RenderNode               from 'famous/core/RenderNode';
import Transitionable           from 'famous/transitions/Transitionable';
import Easing                   from 'famous/transitions/Easing';



export class Snappable extends View {
    constructor(options) {
        super(options);
        this.layout.options.alwaysLayout = true;
        this._draggable = new Draggable(options);


        let dragSurface = new Surface(options.surfaceOptions || {});

        let controlRenderNode = new RenderNode();
        controlRenderNode.add(this._draggable).add(dragSurface);

        this.renderables.draggable = controlRenderNode;
        dragSurface.pipe(this._draggable);

        if(options.snapPoints){
            this._doSnap = true;
            this._snapPoints = options.snapPoints;
            this._restrictFunction = options.restrictFunction;

            this._snapPositionState = new Transitionable([0, 0]);
            this._snappingIn = false;
            this._snappingOut = false;
            this._minDistance = 0;
            this._closestSnapPoint = this._snapPoints[0];
            this._snapThreshold = options.snapThreshold || 12;
            this._draggable.setPosition(this._snapPoints[0].concat(0), {duration: 450, curve: Easing.outBack});
            if(options.snapOnDrop){
                this._draggable.on('end', (dragEvent) => {
                    this._draggableFollowSnap = true;
                    this.snapNext = true;
                    this._calcToNearestPoint();
                });
            }
        }


        this.layouts.push((context) => {
            if(this._doSnap){
                this.doSnapping();
            }

            let draggableSpec = {
                size: [context.size[0], context.size[1]],
                align: [0.5, 0.5],
                origin: [0.5, 0.5],
                translate: [0, 0, 0]
            };
            context.set('draggable', draggableSpec);
        });
    }

    getPosition(){
        if(this._doSnap){
            return this._snapPositionState.get();
        } else {
            return this.getUnSnappedPosition();
        }
    }

    getUnSnappedPosition(){
        return this._draggable.getPosition();
    }


    enableSnapping(enabled){
        this._doSnap = enabled;
    }

    doSnapping() {
        let draggablePosition= this._draggable.getPosition();
        this.restrictedPosition = this._restrictFunction ? this._restrictFunction(draggablePosition) : draggablePosition;

        this._calcToNearestPoint();


        if (!this._snappingIn) {
            /* Snap to point */
            if ((!this._snappingOut && this._minDistance < this._snapThreshold) || this.snapNext) {
                this._snapToPoint();
            }
        }
        if (this.snapped && !this._snappingIn) {
            let distanceDiscprency = this._distance(this._snapPositionState.get(), this.restrictedPosition);
            if (distanceDiscprency > 0.05) {
                this._snapOut();
                this._snappingIn = false;
                this._snappingOut = true;
            } else {
                this.snapped = false;
            }
        } else {
            this.snapVelocity = 3;
            this._snappingOut = false;
        }

        if (!this._snappingIn && !this._snappingOut) {
            this._snapPositionState.set(this.restrictedPosition);
        } else if(this._draggableFollowSnap){
            this._draggable.setPosition(this._snapPositionState.get());
        }




    }

    _distance(p1, p2) {
        return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
    }

    _calcToNearestPoint() {

        let position = this.snapNext ? this._draggable.getPosition() : this.restrictedPosition;
        this._minDistance  = Infinity;
        for (let snapPoint of this._snapPoints) {
            let distance = this._distance(position, snapPoint);
            if (distance < this._minDistance) {
                this._minDistance = distance;
                this._closestSnapPoint = snapPoint;
            }
        }
        this._alreadySnapped = !this._snappingOut && !this.snapNext && this._distance(this._snapPositionState.get(), this._closestSnapPoint) === 0;
    }

    _snapToPoint() {
        this._snappingIn = true;
        this._snappingOut = false;
        this.snapNext = false;
        let transition = {
            duration: this._alreadySnapped ? 0 : 29 * Math.sqrt(this._minDistance+36),
            curve: Easing.inQuad
        };
        this._snapPositionState.set(this._closestSnapPoint, transition, () => {
            this.snapped = true;
            this._snappingIn = false;
            this._draggableFollowSnap = false;

        });
        return transition;

    }

    _snapOut() {
        /* Catch up with point */
        let thisPosition = this._snapPositionState.get();
        let targetPosition = this.restrictedPosition;
        if (this.snapVelocity < 4) {
            this.snapVelocity += 0.08;
        }
        let xDiff = targetPosition[0] - thisPosition[0];
        let yDiff = targetPosition[1] - thisPosition[1];
        this._snapPositionState.set([this.snapVelocity > Math.abs(xDiff) ? targetPosition[0] : thisPosition[0] + Math.sign(xDiff) * this.snapVelocity,
            this.snapVelocity > Math.abs(yDiff) ? targetPosition[1] : thisPosition[1] + Math.sign(yDiff) * this.snapVelocity]);
    }
}