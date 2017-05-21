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
        let rawLevels;
        try {
            rawLevels = JSON.parse(localStorage.getItem("levels"));
            /* Catch parsing errors */
        } catch (error) {
            return [];
        }
        if (!rawLevels) return [];
        console.log(`Number of levels in storage: ${rawLevels.length}`);
        let interestingRawLevels = rawLevels
            .filter(({ inbetweenSpaces, availableShapes: { length: noAvailableShapes } }) => inbetweenSpaces >= 4 ? (inbetweenSpaces - noAvailableShapes) : true);
        let sortAndPick = {
            sort: [{
                propertyName: 'inbetweenSpaces',
                direction: 'ascending'
            }, {
                propertyName: ['availableShapes', 'length'],
                direction: 'ascending'
            },],
            pickUnique: {
                matchesPerValue: 2,
                grouping: [((level) => level.availableShapes.length), ((level) => level.inbetweenSpaces)]
            }
        };
        let selectionGroups = _.flattenDeep([
            RotationMode.noRotation, RotationMode.halfOnly, RotationMode.all
        ].map((rotationMode) => [2, 3].map((stickCount) => ({
            ...sortAndPick,
            filter: { stickCount, rotationMode }
        }))));
        let processedLevels =
            this.advancedSelection(rawLevels, ...selectionGroups)
                .map(({ rotationMode, id, availableShapes, startShape, endShape, inbetweenSpaces, cheatAnswer }, index) => {
                    availableShapes = availableShapes.map((shapeName) => ShapeSpecs[shapeName]);


                    return {
                        id,
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

    static advancedSelection(array, ...groups) {
        return _.flatten(
            groups.map((groupOptions) =>
                this.multipleSort(
                    this.pickUnique(
                        this.pickSelected(
                            this.multipleFilter(array,
                                groupOptions.filter),
                            groupOptions.pickSelected),
                        groupOptions.pickUnique),
                    groupOptions.sort)
            )
        );
    }

    static multipleFilter(array, criteria) {
        return _.shuffle(array).filter((item) => {

            for (let filterProperty in criteria) {
                let matchingValues = criteria[filterProperty];
                if (!Array.isArray(matchingValues)) {
                    matchingValues = [matchingValues];
                }
                let valueOfItem = item[filterProperty];
                if (matchingValues.every((valueMatcher) => typeof valueMatcher === 'function' ? !valueMatcher(valueOfItem) : valueMatcher !== valueOfItem)) {
                    return false;
                }
            }
            return true;
        })
    }

    /**
     *
     * @param array
     * @param {Array} criteria
     */
    static pickUnique(array, criteria) {
        if (!criteria) {
            return array;
        }

        let { matchesPerValue, grouping } = criteria;
        if (!Array.isArray(grouping)) {
            grouping = [grouping];
        }
        let groupFunction = (item) => grouping.map((groupFunction) => JSON.stringify(groupFunction(item))).join(`///////`);
        return _.flatten(_.map(_.groupBy(array, groupFunction), (group) => group.slice(0, matchesPerValue)));
    }

    /**
     *
     * @param array
     * @param {Array} criteria
     */
    static pickSelected(array, criteria) {
        if (!criteria) {
            return array;
        }
        let filteredArray = array;
        criteria = this.multipleSort(criteria, [{ property: 'matchesPerValue', direction: 'descending' }]);
        let unfulfillableCriteria;
        for (let criteriaObject of criteria) {
            let { matchesPerValue, filter } = criteriaObject;
            let filteredEntries = this.multipleFilter(filteredArray, filter);
            criteriaObject.filteredEntries = filteredEntries;
            if (filteredEntries.length < matchesPerValue) {
                unfulfillableCriteria = criteriaObject;
                console.warn(`Unfulfillable criteria: ${JSON.stringify(unfulfillableCriteria)}`);
                break;
            }
            filteredArray = filteredEntries;
        }
        let arrayToReturn = [];
        for (let criteriaObject of criteria) {

            if (criteriaObject === unfulfillableCriteria) {
                break;
            }
            let { matchesPerValue, filteredEntries } = criteriaObject;
            arrayToReturn = arrayToReturn.concat(_.uniq(filteredArray.concat(filteredEntries)).slice(0, matchesPerValue));
        }
        return _.uniq(arrayToReturn);
    }

    /**
     *
     * @param array
     * @param {Array} criteria
     */
    static multipleSort(array, criteria) {
        return array.sort((firstItem, secondItem) => {
            let firstValue, secondValue;
            let criteriaIndex = 0, property, direction;

            do {
                let criteriaObject = criteria[criteriaIndex++];
                if (!criteriaObject) {
                    break;
                }
                let { matcher } = criteriaObject;
                if (matcher) {
                    firstValue = matcher(firstItem);
                    secondValue = matcher(secondItem);
                } else {
                    property = criteriaObject.property;
                    direction = criteriaObject.direction;
                    firstValue = _.get(firstItem, property);
                    secondValue = _.get(secondItem, property);
                }
            } while (firstValue === secondValue);
            return direction === 'descending' ? secondValue - firstValue : firstValue - secondValue;
        })
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
