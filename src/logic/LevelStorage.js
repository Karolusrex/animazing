/**
 * Created by lundfall on 09/09/16.
 */

import {ShapeSpecs}     from './ShapeSpecs.js';
import _           from 'lodash';
import {
    turnShape,
    associateShapesInInterval
}
    from '../util/SpecProcessing.js';
    
let syncedLevels;

export class LevelStorage {
    static clearLevels() {
        localStorage.setItem("levels", "[]");
    }

    static storeLevel(level) {
        if(!syncedLevels){
            syncedLevels = JSON.parse(localStorage.getItem("levels"));
        }
        syncedLevels.push(level);
        localStorage.setItem("levels", JSON.stringify(syncedLevels));
    }

    static getLevels() {
        let rawLevels = JSON.parse(localStorage.getItem("levels"));
        if(!rawLevels) return [];
        console.log(`Number of levels in storage: ${rawLevels.length}`);
        let interestingRawLevels = rawLevels
            .filter(({inbetweenSpaces, availableShapes: {length: noAvailableShapes}}) => inbetweenSpaces >= 4 ? (inbetweenSpaces - noAvailableShapes) : true);
        let processedLevels =
            _.uniqBy(_.shuffle(interestingRawLevels), 'inbetweenSpaces').concat(_.uniqBy(_.shuffle(interestingRawLevels), 'inbetweenSpaces'))
            .sort(({inbetweenSpaces: otherNoSpaces, availableShapes: {length: otherNoAvailableShapes}}, {inbetweenSpaces, availableShapes: {length: noAvailableShapes}}) => ((otherNoSpaces) - (inbetweenSpaces)))
            .map(({availableShapes, startShape, endShape, inbetweenSpaces, clockwiseRotate, cheatAnswer}) => {
            return {
                availableShapes: availableShapes.map((shapeName) => ShapeSpecs[shapeName]),
                startShape: LevelStorage.getShapeFromStored(startShape),
                endShape: LevelStorage.getShapeFromStored(endShape),
                inbetweenSpaces,
                cheatAnswer,
                clockwiseRotate: clockwiseRotate.map((pair) => pair.map((storedShape) => LevelStorage.getShapeFromStored(storedShape)))
            };
        });
        return processedLevels;
    }

    static getShapeFromStored(stored) {
        let shape =  turnShape(stored.rotation, ShapeSpecs[stored.shapeName])
        shape._shapeName = stored.shapeName;
        return shape;
    }
}
