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
import {RotationMode} from '../util/SpecProcessing';

let syncedLevels;

export class LevelStorage {
    static clearLevels() {
        localStorage.setItem("levels", "[]");
    }

    static storeLevel(level) {
        if (!syncedLevels) {
            syncedLevels = JSON.parse(localStorage.getItem("levels"));
        }
        syncedLevels.push(level);
        localStorage.setItem("levels", JSON.stringify(syncedLevels));
    }

    static getLevels() {
        let rawLevels = JSON.parse(localStorage.getItem("levels"));
        if (!rawLevels) return [];
        console.log(`Number of levels in storage: ${rawLevels.length}`);
        let interestingRawLevels = rawLevels
            .filter(({ inbetweenSpaces, availableShapes: { length: noAvailableShapes } }) => inbetweenSpaces >= 4 ? (inbetweenSpaces - noAvailableShapes) : true);
        let processedLevels =
            _.uniqBy(_.shuffle(interestingRawLevels), 'inbetweenSpaces').concat(_.uniqBy(_.shuffle(interestingRawLevels), 'inbetweenSpaces'))
                .sort(({ inbetweenSpaces: otherNoSpaces, availableShapes: { length: otherNoAvailableShapes } }, { inbetweenSpaces, availableShapes: { length: noAvailableShapes } }) => ((otherNoSpaces) - (inbetweenSpaces)))
                .map(({ availableShapes, startShape, endShape, inbetweenSpaces, cheatAnswer }, index) => {
                    let rotationMode = index < 2 ? RotationMode.noRotation : RotationMode.all;
                    availableShapes = availableShapes.map((shapeName) => ShapeSpecs[shapeName]);

                    /* If there are rotation constraints, make sure that it is correctly solvable with limited rotation options */
                    if (rotationMode === RotationMode.noRotation) {
                        /*for(let shape in availableShapes){
                            let correspondingShape = cheatAnswer.find((correctlyRotatedShape) => correctlyRotatedShape.isSameAs(shape));
                            shape.setNoQuarterTurns(correspondingShape.getNoQuarterTurns());
                        }*/
                    }

                    return {
                        rotationMode,
                        availableShapes,
                        startShape: LevelStorage.getShapeFromStored(startShape),
                        endShape: LevelStorage.getShapeFromStored(endShape),
                        inbetweenSpaces,
                        cheatAnswer
                    };
                });
        return processedLevels;
    }

    /* Check for undefined if current localStorage data is inconsistent. In that case, print a warning*/
    static getShapeFromStored(stored) {
        let shapeSpec = ShapeSpecs[stored.shapeName];
        if (shapeSpec) {
            let shape = turnShape(stored.rotation, shapeSpec);
            if (shape) {
                return shape;
            } else {
                console.warn('localStorage data incosistent with hard-coded state. Please regenerate levels');
            }
        } else {
            console.warn('localStorage data incosistent with hard-coded state. Please regenerate levels');
        }
    }

    static getCollisionGraph() {
        let textualGraph = localStorage.getItem('collisionGraph');
        if (textualGraph) {
            return JSON.parse(textualGraph);
        } else {
            console.warn('Invalid collision graph in local storage');
        }
        return {};
    }
}
