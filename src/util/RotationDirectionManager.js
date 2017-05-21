/**
 * Created by lundfall on 15/02/2017.
 */
import {LevelStorage}   from '../logic/LevelStorage.js';

let collisionGraph = LevelStorage.getCollisionGraph();
let clockwiseRotateMap;
if(collisionGraph.links){
    clockwiseRotateMap = collisionGraph.links.reduce((clockwiseRotateMap, { source, target, clockwiseRotate }) => {
        clockwiseRotateMap[source + target] = clockwiseRotate;
        return clockwiseRotateMap;
    }, {});
}


export let RotationDirectionManager = {
    shouldShapesClockwiseRotate: (source, target) => {
        return clockwiseRotateMap[source.toString() + target.toString()];
    }
};


