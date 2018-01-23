/**
 * Created by lundfall on 5/31/16.
 */

import {ShapeSpec}                      from '../logic/ShapeSpecs.js';
import {ShapeGrid}                      from '../components/ShapeGrid.js';
import {RotationDirectionManager}       from './RotationDirectionManager';

export let specAttributes = {
    rotate: {dimensions: 3, defaultValue: [0, 0, 0]},
    align: {dimensions: 2, defaultValue: [0.5, 0]},
    origin: {dimensions: 2, defaultValue: [0.5, 0.5]},
    size: {dimensions: 2, defaultValue: [100, 10]},
    translate: {dimensions: 3, defaultValue: [0, 0, 0]},
    opacity: {dimensions: 1, defaultValue: 1}
};

export const RotationMode = {
    /**
     * All rotations possible
     */
    all: 'all',
    /**
     * Can only rotate half-way
     */
    halfOnly: 'halfOnly',
    /**
     * No rotation available
     */
    noRotation: 'noRotation'
};

export const RotationStates =
    {
        [RotationMode.all]: [0, 1, 2, 3],
        [RotationMode.halfOnly]: [0, 2],
        [RotationMode.noRotation]: [0]
    };

let approximatelyBiggerOrEqual = (firstValue, secondValue) => {
    if(Math.abs(firstValue-secondValue) < 1e-10){
        return true;
    }
    return firstValue > secondValue;
};

let approximatelySmallerOrEqual = (firstValue, secondValue) => {
    if(Math.abs(firstValue-secondValue) < 1e-10){
        return true;
    }
    return firstValue < secondValue;
};

export function doBoxesCollide(box1, box2, debugContext) {
    let boxes = [box1, box2];
    let axes = [];
    let boxCorners = [];
    let hasOverlap = true;
    let debugCounter = 0;

    for (let box of boxes) {
        let cornerCoordinates = calcSpecCorners(box, true);
        /* Adjust corners to take the different origin into account. We're basically doing an inverse rotation matrix (I think) */
        let {rotate = specAttributes.rotate.defaultValue, size, origin = specAttributes.origin.defaultValue} = box;
        for (let [cornerName, corner] of Object.entries(cornerCoordinates)) {
            corner[0] = corner[0] - Math.cos(rotate[2]) * size[0] * origin[0] + Math.sin(rotate[2]) * size[1] * origin[1];
            corner[1] = corner[1] - Math.cos(rotate[2]) * size[1] * origin[1] - Math.sin(rotate[2]) * size[0] * origin[0];
        }

        cornerCoordinates = [[cornerCoordinates['topLeft'], cornerCoordinates['bottomLeft']], [cornerCoordinates['topRight'], cornerCoordinates['bottomRight']]];
        let generateAxisDimension = (cornerCoordinates, axisDirection, dimension) => {

            return axisDirection === 0 ? cornerCoordinates[1][0][dimension] - cornerCoordinates[0][0][dimension] :
                cornerCoordinates[1][1][dimension] - cornerCoordinates[1][0][dimension]
        };

        for (let axisDirection of [0, 1]) {
            //http://www.gamedev.net/page/resources/_/technical/game-programming/2d-rotated-rectangle-collision-r2604
            let xAxis = generateAxisDimension(cornerCoordinates, axisDirection, 0);
            let yAxis = generateAxisDimension(cornerCoordinates, axisDirection, 1);
            if (debugContext) {
                debugContext.set(`debug${debugCounter++}`, {
                    size: [1, 200],
                    origin: [0, 0],
                    rotate: [0, 0, Math.atan(yAxis / xAxis)],
                    align: [0.5, 0.5],
                    translate: [0, 0, 3000]
                });

                /*debugContext.set(`debug${debugCounter++}`, {
                    size: [7, 7],
                    origin: [0.5, 0.5],
                    align: [0.5, 0.5],
                    translate: [xAxis, yAxis, 3000]
                });*/
            }


            axes.push([xAxis, yAxis]);
        }
        boxCorners.push(cornerCoordinates);
    }

    /* We have the axes, go on to step 2 and calc projections */
    for (let axis of axes) {
        let minMaxCornerValues = [[Infinity, -Infinity], [Infinity, -Infinity]];
        for (let [boxNo, corners] of boxCorners.entries()) {
            for (let cornerPair of corners) {
                for (let corner of cornerPair) {

                    let {translate = specAttributes.translate.defaultValue} = boxes[boxNo];
                    let adjustedCorner = [corner[0] + translate[0], corner[1] + translate[1]];

                    if(debugContext){
                        debugContext.set(`debug${debugCounter++}`,{
                            size: [10, 10],
                            origin: [0.5, 0.5],
                            align: [0.5, 0.5],
                            translate: [adjustedCorner[0], adjustedCorner[1], 3000]
                        });
                    }


                    let cornerProjectionBase = (adjustedCorner[0] * axis[0] + adjustedCorner[1] * axis[1]) / (Math.pow(axis[0], 2) + Math.pow(axis[1], 2));
                    /* Step 3 */
                    let cornerProjection = [cornerProjectionBase * axis[0], cornerProjectionBase * axis[1]];

                    if(debugContext){
                        debugContext.set(`debug${debugCounter++}`,{
                        size: [10, 10],
                        origin: [0.5, 0.5],
                        align: [0.5, 0.5],
                        translate: [cornerProjection[0], cornerProjection[1], 3000]
                     });
                    }


                    let scalarValue = cornerProjection[0] * Math.abs(axis[0]) + cornerProjection[1] * Math.abs(axis[1]);
                    minMaxCornerValues[boxNo][0] = Math.min(minMaxCornerValues[boxNo][0], scalarValue);
                    minMaxCornerValues[boxNo][1] = Math.max(minMaxCornerValues[boxNo][1], scalarValue);
                }
            }
        }
        /* Step 4 */
        if (!(minMaxCornerValues[0][0] < minMaxCornerValues[1][1] && minMaxCornerValues[1][0] < minMaxCornerValues[0][1])) {
            for (let boxNo of [0, 1]) {
                if (!(minMaxCornerValues[boxNo][0] >= minMaxCornerValues[+!boxNo][0] && minMaxCornerValues[boxNo][0] <= minMaxCornerValues[+!boxNo][1]) ||
                    (minMaxCornerValues[boxNo][1] < minMaxCornerValues[+!boxNo][1] && minMaxCornerValues[boxNo][1] > minMaxCornerValues[+!boxNo][0])){
                    return false;
                    // hasOverlap = false;
                }
            }
        }
    }
    return hasOverlap;
}



export function turnShape(quarterCycles, shape) {
    let turnedShape = {};
    let quarterTurn = quarterCycles === 1;
    let threeQuarterTurn = quarterCycles === 3;
    let noTurn = quarterCycles === 0;
    if (noTurn) {
        return shape;
    }
    shape.forEach((objectName, object) => {
        if (objectName === 'size') {
            turnedShape.size = quarterTurn || threeQuarterTurn ? [object[1], object[0]] : object;
        } else if (quarterTurn || threeQuarterTurn) {

            /* Deduced from wolfram alpha */
            let rotateZ = quarterTurn ? -Math.PI / 2 : Math.PI / 2;
            let origin = object.origin || specAttributes.origin.defaultValue;
            let originX = origin[0] * object.size[0];
            let originY = origin[1] * object.size[1];
            let originSum = originX + originY;
            let originDiff = originX - originY;
            turnedShape[objectName] = Object.assign({},
                object, {
                    rotate: [object.rotate[0] || 0, object.rotate[1] || 0, (rotateZ + object.rotate[2]) % Math.PI],
                    translate: [
                        (threeQuarterTurn ? originSum - object.translate[1] : object.translate[1] + (originDiff)) - (threeQuarterTurn ? originSum : originDiff),
                        (threeQuarterTurn ? object.translate[0] - originDiff : originSum - object.translate[0]) - (threeQuarterTurn ? -originDiff : originSum),
                        object.translate[2]]
                }
            )
        } else {
            turnedShape[objectName] = Object.assign({},
                object, {

                    translate: [-object.translate[0], -object.translate[1], object.translate[2]]
                }
            )
        }
    });
    return new ShapeSpec({shape: turnedShape, isRotationOf: shape, quarterCycles});
}

//For actual ShapeSpecs
export function shapeBoundingBox(shape) {
    let minPos = [Infinity, Infinity], maxPos = [0, 0];
    shape.forEach((name, spec) => {
        let specBoundingBox = specBoundingBoxSize(spec);
        let {origin = specAttributes.origin.defaultValue, translate = specAttributes.translate.defaultValue} = spec;
        let absolutePosition = [translate[0] - specBoundingBox[0] * origin[0], translate[1] - specBoundingBox[1] * origin[1]];
        minPos = [Math.min(absolutePosition[0], minPos[0]), Math.min(absolutePosition[1], minPos[1])];
        maxPos = [Math.max(absolutePosition[0] + specBoundingBox[0], maxPos[0]), Math.max(absolutePosition[1] + specBoundingBox[1], maxPos[1])];
    });
    return {size: [maxPos[0] - minPos[0], maxPos[1] - minPos[1]], topLeftCorner: [minPos[0], minPos[1]]};
}

export function calcSpecCorners(spec, doBackwardsRotation = false) {
    let {size} = spec;
    let {rotate = specAttributes.rotate.defaultValue, origin = specAttributes.origin.defaultValue} = spec;
    /* It seems like famous is treating the rotation as going backwards...TODO: Verify this*/
    let zRotation = doBackwardsRotation ? -rotate[2] : rotate[2];
    //rotate[2] *=-1;
    let corners = {};
    /* Pretend that origin is [0, 0] */
    corners['topLeft'] = [0, 0];
    corners['topRight'] = [Math.cos(zRotation) * size[0], -Math.sin(zRotation) * size[0]];
    let rotateMinusHalfPi = zRotation - Math.PI / 2;
    corners['bottomLeft'] = [Math.cos(rotateMinusHalfPi) * size[1], -Math.sin(rotateMinusHalfPi) * size[1]];
    let hypotenuse = Math.sqrt(Math.pow(size[0], 2) + Math.pow(size[1], 2));
    let hypotenuseAngle = Math.atan(size[1] / size[0]);
    let rotateRelativeHypotenuse = zRotation - hypotenuseAngle;
    corners['bottomRight'] = [Math.cos(rotateRelativeHypotenuse) * hypotenuse, -Math.sin(rotateRelativeHypotenuse) * hypotenuse];
    return corners;
}


//For boxes
export function specBoundingBoxSize(spec) {
    let {rotate = specAttributes.rotate.defaultValue} = spec;
    let corners = calcSpecCorners(spec);

    let normalizedRotation = rotate[2] > 0 ? (rotate[2] % (Math.PI * 2)) : (rotate[2] - Math.PI * 2 * (Math.floor(rotate[2] / (Math.PI * 2))));

    let width = normalizedRotation < Math.PI / 2 ?
        corners['bottomRight'][0] - corners['topLeft'][0] : (
            normalizedRotation < Math.PI ?
                corners['bottomLeft'][0] - corners['topRight'][0] : (
                normalizedRotation < 3 * Math.PI / 2 ?
                    -corners['bottomRight'][0] + corners['topLeft'][0] : (
                    -corners['bottomLeft'][0] + corners['topRight'][0]
                )
            )
        );
    let height = normalizedRotation < Math.PI / 2 ?
        corners['bottomLeft'][1] - corners['topRight'][1] : (
            normalizedRotation < Math.PI ?
                corners['topLeft'][1] - corners['bottomRight'][1] : (
                normalizedRotation < 3 * Math.PI / 2 ?
                    -corners['bottomLeft'][1] + corners['topRight'][1] : (
                    corners['topLeft'][1] + corners['bottomRight'][1]
                )
            )
        );

    return [width, height];
}

/**
 *
 * @param input
 * @param shapes
 * @param context
 * @param maxRange
 * @param clockwiseRotate
 * @param displayOpaque if the shapes should be displayed with an opacity
 * @param extraTranslate Adds an extra translate
 * @param size
 * @returns {Array} didCollide if there was a collision
 */
//TODO Cleanup function arguments
export function associateShapesInInterval(input, shapes, context, maxRange, clockwiseRotate, displayOpaque = false, extraTranslate = [0, 0, 0], size) {
    if (!shapes[0] || !shapes[shapes.length - 1]) {
        throw new Error('There needs to be a shape at the front and the back specified');
    }
    let allSpecs = [];
    let i = 0;
    let lastIndex = 1;
    shapes[0].forEach((bar) => {
        let specCombo = [];
        let j;
        let inbetween = false;
        for (j = 0; j < shapes.length - 1; j++) {
            if (input < (j + 1) * (maxRange / (shapes.length - 1))) {
                inbetween = true;
                break;
            }
        }
        if (!inbetween) j--;
        let firstIndex = j;
        lastIndex = j + 1;
        while (!shapes[firstIndex]) {
            firstIndex--;
        }
        while (!shapes[lastIndex]) {
            lastIndex++;
        }
        let shapeCombo = [shapes[firstIndex], shapes[lastIndex]];
        specCombo.push(shapeCombo[0][bar]);
        specCombo.push(shapeCombo[1][bar]);
        let indexDistance = lastIndex - firstIndex;
        let targetValue = indexDistance * maxRange / (shapes.length - 1);
        if (clockwiseRotate === undefined) {
            clockwiseRotate = RotationDirectionManager.shouldShapesClockwiseRotate(...shapeCombo);
        }
        let spec = mergeSpecs(...specCombo,
            inbetween ?
                input - Math.min(Math.floor(input / (targetValue / indexDistance)) - (j - firstIndex), shapes.length - 2) * (targetValue / indexDistance)
                : targetValue,
            targetValue, (t) => t, clockwiseRotate, size[0] / ShapeGrid.getSize()[0]);
        allSpecs.push(spec);
        if (displayOpaque) {
            spec.opacity = 0.5;
        }
        let specWithTranslation = {
            ...spec,
            translate: extraTranslate.map((translation, index) => translation + spec.translate[index])
        };
        context.set(bar, specWithTranslation);
        i++;
    });
    /* For collision handling */
    let hasCollision = !allSpecs.every((firstSpec, index) =>
        allSpecs.filter((_, innerIndex) => index !== innerIndex).every((innerSpec, innerIndex) =>
        !doBoxesCollide(firstSpec, innerSpec)));
    return [hasCollision, lastIndex];
}

let _ensureNewArray = (potentialArray) => Array.isArray(potentialArray) ? [...potentialArray] : [potentialArray];
let _normalizeWeights = (weights, goalT, easing) => {
    let normalizedWeights = [...weights];
    if (easing) {
        goalT = easing(goalT);
    }
    for (let i = 0; i < normalizedWeights.length; i++) {
        normalizedWeights[i] = easing(normalizedWeights[i]) / goalT;
    }
    return normalizedWeights;
};

export function mergeSpecs(startSpec, endSpec, t, goalT, easing, clockwiseRotate, sizeDistortion) {
    let [normalizedT] = _normalizeWeights([t], goalT, easing);
    let spec = {};
    for (let [attribute, {dimensions, defaultValue}] of Object.entries(specAttributes)) {
        spec[attribute] = [];

        for (let i = 0; i < dimensions; i++) {
            let sumOfAttributeDimension = 0;
            let startSpecAttribute = _ensureNewArray(startSpec[attribute] !== undefined ? startSpec[attribute] : defaultValue);
            let endSpecAttribute = _ensureNewArray(endSpec[attribute] !== undefined ? endSpec[attribute] : defaultValue);
            if (attribute === 'rotate') {
                /* Rotate the shortest way */
                startSpecAttribute[2] = normalizeRotationToOther(endSpecAttribute[2], startSpecAttribute[2], Math.PI, clockwiseRotate);
            }

            let addition = (endSpecAttribute[i] - startSpecAttribute[i]) * normalizedT;
            sumOfAttributeDimension += addition;
            let specAttribute = startSpecAttribute[i] + sumOfAttributeDimension;

            if (attribute === 'translate' || attribute === 'size') {
                /* Shrink or expand the shape */
                specAttribute *= sizeDistortion;
            }
            if (dimensions > 1) {
                spec[attribute][i] = specAttribute;
            } else {
                spec[attribute] = specAttribute;
            }
        }
    }
    return spec;
}

/** Returns a normalized rotation of the second argument that make rotation turn the shortest way
 *
 * @param rotation
 * @param otherRotation
 * @param maxRotation
 * @param clockwiseRotate
 */
export function normalizeRotationToOther(rotation, otherRotation, maxRotation = Math.PI * 2, clockwiseRotate = false) {
    let numberOfTurnsFloat = (rotation - otherRotation) / maxRotation;
    let numberOfTurns = Math[numberOfTurnsFloat > 0 ? 'floor' : 'ceil'](numberOfTurnsFloat);
    /* rotate the shortest way */
    let rotationDiff = otherRotation - rotation;
    /* If it needs to be normalized... */
    let normalizedOtherRotation = otherRotation % (maxRotation) + numberOfTurns * maxRotation;
    let normalizedDiff = normalizedOtherRotation - rotation;
    if (biggerOrPotentiallyEqual(Math.abs(rotationDiff), (maxRotation / 2), clockwiseRotate)) {
        /* If it needs to rotate the other way... */
        otherRotation = normalizedOtherRotation;
        /* If we explicitly request a clockwise rotation, and that's what we're getting, don't rotate the other way */
        if (!(clockwiseRotate && normalizedDiff === -maxRotation / 2)
            && biggerOrPotentiallyEqual(Math.abs(normalizedDiff), (maxRotation / 2), clockwiseRotate)) {
            otherRotation -= Math.sign(normalizedDiff) * maxRotation;
        }
        /* On the other hand, if we have counter clock wise, if we should have clockwise ...*/
    } else if (!clockwiseRotate && rotationDiff === -maxRotation / 2) {
        otherRotation -= Math.sign(normalizedDiff) * maxRotation;
    }
    return otherRotation;
}

function biggerOrPotentiallyEqual(biggerValue, smallerValue, doEqual) {
    return doEqual ? biggerValue >= smallerValue : biggerValue > smallerValue;
}

/* Deprecated, but might be useul in the future for more advanced 2d animation spaces */
export function mergeMultipleSpecs(startState, endSpecs, weights, goalT, easing) {
    let normalizedWeights = _normalizeWeights(weights, goalT, easing);
    let spec = {};
    for (let [attribute, {dimensions, defaultValue}] of Object.entries(specAttributes)) {
        spec[attribute] = [];

        for (let i = 0; i < dimensions; i++) {
            let sumOfAttributeDimension = 0;
            let startSpecAttribute = _ensureNewArray(startState[attribute] !== undefined ? startState[attribute] : defaultValue);
            for (let j = 0; j < endSpecs.length; j++) {
                let endSpecAttribute = _ensureNewArray(endSpecs[j][attribute] !== undefined ? endSpecs[j][attribute] : defaultValue);
                let addition = (endSpecAttribute[i] - startSpecAttribute[i]) * normalizedWeights[j];
                sumOfAttributeDimension += addition;
            }
            let specAttribute = startSpecAttribute[i] + sumOfAttributeDimension;
            if (dimensions > 1) {
                spec[attribute][i] = specAttribute;
            } else {
                spec[attribute] = specAttribute;
            }
        }
    }
    return spec;
}