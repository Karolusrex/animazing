/**
 * Created by lundfall on 5/31/16.
 */


export let specAttributes = {
    rotate: {dimensions: 3, defaultValue: [0, 0, 0]},
    align: {dimensions: 2, defaultValue: [0, 0]},
    origin: {dimensions: 2, defaultValue: [0.5, 0.5]},
    size: {dimensions: 2, defaultValue: [0, 0]},
    translate: {dimensions: 3, defaultValue: [0, 0, 0]},
    opacity: {dimensions: 1, defaultValue: 1}
};

export function doBoxesCollide(box1, box2){
    let boxes = [box1, box2];
    let axes = [];
    let boxCorners = [];
    for(let box of boxes){
        let cornerCoordinates = calcSpecCorners(box);

        cornerCoordinates = [[cornerCoordinates['topLeft'], cornerCoordinates['bottomLeft']], [cornerCoordinates['topRight'], cornerCoordinates['bottomRight']]];
        let generateAxisDimension = (cornerCoordinates, axisDirection, dimension) => axisDirection === 0 ? cornerCoordinates[+!axisDirection][0][dimension] - cornerCoordinates[axisDirection][0][dimension] :
        cornerCoordinates[1][+!axisDirection][dimension] - cornerCoordinates[1][axisDirection][dimension];
        for(let dimension of [0,1]){
            //http://www.gamedev.net/page/resources/_/technical/game-programming/2d-rotated-rectangle-collision-r2604
            axes.push([generateAxisDimension(cornerCoordinates, 0,dimension), generateAxisDimension(cornerCoordinates, 1,+!dimension)]);
        }
        boxCorners.push(cornerCoordinates);
    }

    /* We have the axes, go on to step 2 and calc projections */
    for(let axis of axes){
        let minMaxCornerValues = [[Infinity, 0], [Infinity, 0]];
        for(let [boxNo, corners] of boxCorners.entries()){
            for(let cornerPair of corners){
                for(let corner of cornerPair){
                    let {translate = specAttributes.translate.defaultValue} = boxes[boxNo];
                    let adjustedCorner = [corner[0] + translate[0], corner[1] + translate[1]];
                    let cornerProjectionBase = (adjustedCorner[0]*axis[0] + adjustedCorner[1]*axis[1]) / (Math.pow(axis[0], 2) + Math.pow(axis[1], 2));
                    /* Step 3 */
                    let cornerProjection = [cornerProjectionBase*axis[0], cornerProjectionBase*axis[1]];
                    let scalarValue = cornerProjection[0]*axis[0] + cornerProjection[1]*axis[1];
                    minMaxCornerValues[boxNo][0] = Math.min(minMaxCornerValues[boxNo][0], scalarValue);
                    minMaxCornerValues[boxNo][1] = Math.max(minMaxCornerValues[boxNo][1], scalarValue);
                }
            }
        }
        let hasOverlap = false;
        for(let boxNo of [0, 1]){
            /* Step 4 */
            if((minMaxCornerValues[boxNo][0] > minMaxCornerValues[+!boxNo][0] && minMaxCornerValues[boxNo][0] < minMaxCornerValues[+!boxNo][1]) ||
                (minMaxCornerValues[boxNo][1] < minMaxCornerValues[+!boxNo][1] && minMaxCornerValues[boxNo][1] > minMaxCornerValues[+!boxNo][0])){
                hasOverlap = true;
                break;
            }
        }
        if(!hasOverlap){
            return false;
        }
    }
    return true;
}

export function turnShape(quarterCycles, shape) {
    let turnedShape = {};
    let quarterTurn = quarterCycles === 1;
    let threeQuarterTurn = quarterCycles === 3;
    let noTurn = quarterCycles === 0;
    if (noTurn) {
        return shape;
    }
    for (let [objectName, object] of Object.entries(shape)) {
        if (objectName === 'size') {
            turnedShape.size = quarterTurn || threeQuarterTurn ? [object[1], object[0]] : object;
            continue;
        }
        if (quarterTurn || threeQuarterTurn) {
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
                    /*rotate: [object.rotate[0] || 0, object.rotate[1] || 0, (Math.PI-object.rotate[2]) % Math.PI ],*/
                    translate: [-object.translate[0], -object.translate[1], object.translate[2]]
                }
            )
        }
    }
    return turnedShape;
}
//For actual shapes
export function shapeBoundingBox(shape) {
    let minPos = [Infinity, Infinity], maxPos = [0, 0];
    for(let [name, spec] of Object.entries(shape)){
        let specBoundingBox = specBoundingBoxSize(spec);
        let {origin = specAttributes.origin.defaultValue, translate = specAttributes.translate.defaultValue} = spec;
        let absolutePosition = [translate[0] - specBoundingBox[0]*origin[0], translate[1] - specBoundingBox[1]*origin[1]];
        minPos = [Math.min(absolutePosition[0], minPos[0]), Math.min(absolutePosition[1], minPos[1])];
        maxPos = [Math.max(absolutePosition[0] + specBoundingBox[0], maxPos[0]), Math.max(absolutePosition[1] + specBoundingBox[1], maxPos[1])];
    }
    return {size:[maxPos[0] - minPos[0], maxPos[1] - minPos[1]], topLeftCorner: [minPos[0], minPos[1]]};
}

export function calcSpecCorners(spec){
    let {size} = spec;
    let {rotate = specAttributes.rotate.defaultValue} = spec;
    let corners = {};
    /* Pretend that origin is [0, 0] */
    corners['topLeft'] = [0, 0];
    corners['topRight'] = [Math.cos(rotate[2]) * size[0], -Math.sin(rotate[2]) * size[0]];
    let rotateMinusHalfPi = rotate[2] - Math.PI / 2;
    corners['bottomLeft'] = [Math.cos(rotateMinusHalfPi) * size[1], -Math.sin(rotateMinusHalfPi) * size[1]];
    let hypotenuse = Math.sqrt(Math.pow(size[0], 2) + Math.pow(size[1], 2));
    let hypotenuseAngle = Math.atan(size[1] / size[0]);
    let rotateRelativeHypotenuse = rotate[2] - hypotenuseAngle;
    corners['bottomRight'] = [Math.cos(rotateRelativeHypotenuse) * hypotenuse, -Math.sin(rotateRelativeHypotenuse) * hypotenuse];
    return corners;
}

//For boxes
export function specBoundingBoxSize(spec) {
    let boundingBoxSize = [...spec.size];
    let {rotate = specAttributes.rotate.defaultValue} = spec;
    let corners = calcSpecCorners(spec);

    let normalizedRotation = rotate[2] > 0 ? (rotate[2] % (Math.PI * 2)) : (rotate[2] - Math.PI*2*(Math.floor(rotate[2]/(Math.PI*2))));

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

export function associateShapesInInterval(input, shapes, context, maxRange) {
    /* For collision handling */
    let allSpecs = [];
    for (let [i,bar] of Object.keys(shapes[0]).entries()) {
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
        specCombo.push(shapes[j][bar]);
        specCombo.push(shapes[j + 1][bar]);
        let targetValue = maxRange / (shapes.length - 1);
        let spec = mergeSpecs(...specCombo,
            inbetween ? input - Math.min(Math.floor(input / (targetValue)), shapes.length - 2) * (targetValue) : targetValue,
            targetValue, (t) => t);
        allSpecs.push(spec);
        context.set(bar, spec);
    }
    console.log(doBoxesCollide(allSpecs[0], allSpecs[1]) || doBoxesCollide(allSpecs[0], allSpecs[2]) || doBoxesCollide(allSpecs[1], allSpecs[2]));
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
}

export function mergeSpecs(startSpec, endSpec, t, goalT, easing) {
    let [normalizedT] = _normalizeWeights([t], goalT, easing);
    let spec = {};
    for (let [attribute, {dimensions, defaultValue}] of Object.entries(specAttributes)) {
        spec[attribute] = [];

        for (let i = 0; i < dimensions; i++) {
            let sumOfAttributeDimension = 0;
            let startSpecAttribute = _ensureNewArray(startSpec[attribute] !== undefined ? startSpec[attribute] : defaultValue);
            let endSpecAttribute = _ensureNewArray(endSpec[attribute] !== undefined ? endSpec[attribute] : defaultValue);
            let addition = (endSpecAttribute[i] - startSpecAttribute[i]) * normalizedT;
            /* Rotate the shortest way */
            if (attribute === 'rotate') {

                let hasDifferentSigns = Math.sign(endSpecAttribute[i]) !== Math.sign(startSpecAttribute[i]);
                if (!hasDifferentSigns && Math.abs(Math.abs(endSpecAttribute[i] - startSpecAttribute[i]) - Math.PI / 2) <= Number.EPSILON) {
                    endSpecAttribute[i] += Math.sign(startSpecAttribute[i] - endSpecAttribute[i]) * Math.PI;
                }
                else if ((hasDifferentSigns && Math.abs(endSpecAttribute[i]) + Math.abs(startSpecAttribute[i]) > Math.PI / 2) ||
                    (!hasDifferentSigns && Math.abs(endSpecAttribute[i] - startSpecAttribute[i]) > Math.PI / 2)) {
                    endSpecAttribute[i] += Math.sign(startSpecAttribute[i]) * Math.PI;
                    addition = (endSpecAttribute[i] - startSpecAttribute[i]) * normalizedT;
                }
            }
            sumOfAttributeDimension += addition;
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

/* Deprecated, but might be useul in the future for more advanced 2d animation spaces */

export function _getSpec(startState, endSpecs, weights, goalT, easing) {
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