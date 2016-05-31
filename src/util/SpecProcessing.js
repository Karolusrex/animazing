/**
 * Created by lundfall on 5/31/16.
 */


let specAttributes = {
    rotate: {dimensions: 3, defaultValue: [0, 0, 0]},
    align: {dimensions: 2, defaultValue: [0, 0]},
    origin: {dimensions: 2, defaultValue: [0.5, 0.5]},
    size: {dimensions: 2, defaultValue: [0, 0]},
    translate: {dimensions: 3, defaultValue: [0, 0, 0]},
    opacity: {dimensions: 1, defaultValue: 1}
};

export function turnShape(quarterCycles, shape) {
    let turnedShape = {};
    let quarterTurn = quarterCycles === 1;
    let threeQuarterTurn = quarterCycles === 3;
    let noTurn = quarterCycles === 0;
    if (noTurn) {
        return shape;
    }
    for (let [objectName, object] of Object.entries(shape)) {
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

export function associateShapesInInterval(input, shapes, context, maxRange) {
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
        context.set(bar, mergeSpecs(...specCombo,
            inbetween ? input - Math.min(Math.floor(input / (targetValue)), shapes.length - 2) * (targetValue) : targetValue,
            targetValue, (t) => t));
    }
}

let _ensureNewArray = (potentialArray)  => Array.isArray(potentialArray) ? [...potentialArray] : [potentialArray];
let _normalizeWeights = (weights, goalT, easing) =>{
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
                if(!hasDifferentSigns && Math.abs(Math.abs(endSpecAttribute[i] - startSpecAttribute[i]) - Math.PI / 2) <= Number.EPSILON){
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