/**
 * Created by lundfall on 03/09/16.
 */
import {ShapeSpecs}     from './ShapeSpecs.js';
import {
    turnShape,
    associateShapesInInterval
}
    from '../util/SpecProcessing.js';
import _                from 'lodash';
import {LevelStorage}   from './LevelStorage.js';
import {View}               from 'arva-js/core/View.js';
import Surface              from 'famous/core/Surface.js';
import {layout, options}    from 'arva-js/layout/decorators.js';


//TODO There is still a bug in the clockwiserotate that you can see by trying to complete the second level

export class LevelGenerator extends View {

    @layout.translate(0, 0, -10)
    @layout.fullscreen
    background = new Surface({properties: {backgroundColor: 'red'}});


    constructor(options) {
        super(options);
        for (let [i,bar] of this._getBarNames().entries()) {
            this.addRenderable(new Surface({
                content: '',
                classes: ['bar'],
                properties: {
                    backgroundColor: ['#2ecc71', '#8e44ad', '#d35400', '#27ae60', '#e67e22', '#9b59b6'][i],
                }
            }), bar);
        }
    }

    _getBarNames() {
        return ['topBar', 'midBar', 'bottomBar'].sort();
    }

    static async generateCollisionGraphVisualFeedback(speed = 0.01) {
        let debugView = new LevelGenerator();
        debugView.layout.options.alwaysLayout = true;
        debugView.layouts.push((context) => {
            debugView._eventOutput.emit('newContext', context)
        });
        LevelGenerator.generateCollisionGraph(debugView, speed);
        return debugView;
    }
    static async generateCollisionGraph(getNextContextEmitter = null, speed =  0.01) {
        let outputGraph = {};
        outputGraph.nodes = [];
        outputGraph.links = [];
        let shapeIndex = 0;
        let checkedShapes = {};
        for (let shapeName in ShapeSpecs) {
            shapeIndex++;
            for (let quarterRotation of [0, 1, 2, 3]) {
                outputGraph.nodes.push({
                    id: `${shapeName}_${quarterRotation}`,
                    rotation: quarterRotation,
                    shapeName,
                    group: shapeIndex
                });
            }
            checkedShapes[shapeName] = true;
            for (let otherShapeName in ShapeSpecs) {
                if (checkedShapes[otherShapeName]) {
                    continue;
                }
                let resultingLinksFromShapeCombination = [];
                for (let quarterRotation of [0]) {
                    for (let otherQuarterRotation of [0, 1, 2, 3]) {
                        let shape = turnShape(quarterRotation, ShapeSpecs[shapeName]);
                        let otherShape = turnShape(otherQuarterRotation, ShapeSpecs[otherShapeName]);
                        for (let doClockWiseRotation of [false, true]) {
                            let didCollide = false;
                            if (await LevelGenerator.doShapesCollide(shape, otherShape, doClockWiseRotation, getNextContextEmitter, speed)) {
                                didCollide = true;
                            }
                            if (!didCollide) {
                                resultingLinksFromShapeCombination.push({
                                    source: {
                                        shapeName,
                                        quarterRotation
                                    },
                                    target: {
                                        shapeName: otherShapeName,
                                        quarterRotation: otherQuarterRotation
                                    },
                                    clockwiseRotate: doClockWiseRotation
                                });
                                break;
                            }
                        }
                    }
                }
                /* Since collisions are symmetrical in different rotation state, we'll deduce what more valid collision-
                 * free paths are available from what we did
                 */
                for(let {source:
                    {shapeName, quarterRotation},
                    target: {shapeName: otherShapeName, quarterRotation: otherQuarterRotation},
                    clockwiseRotate}
                    of resultingLinksFromShapeCombination){
                    for(let rotation of [0, 1, 2, 3]){
                        let newLink = {
                            source: `${shapeName}_${(quarterRotation + rotation) % 4}`,
                            target: `${otherShapeName}_${(otherQuarterRotation + rotation) % 4}`,
                            value: 1,                                             //Only for legacy reasons in the visualize
                            clockwiseRotate
                        };
                        /* Naturally, the graph is undirected, so link in both ways */
                        let reversedLink = {
                            source: newLink.target,
                            target: newLink.source,
                            value: 1,
                            clockwiseRotate: !clockwiseRotate
                        };
                        outputGraph.links.push(newLink);
                        outputGraph.links.push(reversedLink);
                    }
                    console.log(`No Collision between ${shapeName} in rotation state ${quarterRotation} and 
                            ${otherShapeName} in rotation state ${otherQuarterRotation}
                            in ${clockwiseRotate ? ' clock-wise' : ' counter clock-wise}'}`);
                }

            }
        }
        console.log("Complete. Found " + outputGraph.links.length + " collision free paths");
        localStorage.setItem("collisionGraph", JSON.stringify(outputGraph));
    }

    static async doShapesCollide(firstShape, secondShape, doClickwiseRotation, getNextContextEmitter, speed) {
        let shapePair = [firstShape, secondShape];
        for (let i = 0; i < 1; i += speed) {
            let context = {
                set: () => {
                }
            };
            if (getNextContextEmitter) {
                context = await new Promise((resolve) => getNextContextEmitter.once('newContext', resolve));
            }
            if (!associateShapesInInterval(i, shapePair, context, 1, false, doClickwiseRotation ? [shapePair] : [[]], [100, 100, 0], [200, 200])) {
                return true;
            }
        }
        return false;
    }


    static findLevels() {
        LevelStorage.clearLevels();
        let collisionGraph = JSON.parse(localStorage.getItem("collisionGraph"));
        let nodesById = LevelGenerator.getNodeById(collisionGraph.nodes);
        let linksByStartNodeId = LevelGenerator.getLinksByStartNodeId(collisionGraph.links);
        let foundLevels = [];
        let checkedShapeNames = {};
        for (let startNode of collisionGraph.nodes) {
            if(checkedShapeNames[startNode.shapeName]){
                continue;
            }
            checkedShapeNames[startNode.shapeName] = true;
            let levelData = {
                startShape: LevelGenerator.shapeFromNode(startNode),
                availableShapes: [],
                inbetweenSpaces: -1,
                cheatAnswer: [startNode.id],
                clockwiseRotate: []
            };
            let newLevels = LevelGenerator.searchForLevel(startNode, startNode, {}, levelData, {[startNode.id]: true}, linksByStartNodeId, nodesById);
            foundLevels.push(newLevels);
        }
        localStorage.setItem("levels", JSON.stringify(_.flattenDeep(foundLevels).filter((level) => !!level)));
    }

    static searchForLevel(startNode, currentNode, availableLinks, levelData, visitedNodes, linksByStartNodeId, nodesById) {
        let unsortedOutgoingLinks = linksByStartNodeId[currentNode.id] || [];
        console.log("Searching for level from node " + currentNode.id + ", amount of spaces : " + levelData.inbetweenSpaces);
        /* Sort link and choose the target node that has the least amount of outgoing links */
        let outgoingLinks = LevelGenerator.sortLinksForRareFirst(unsortedOutgoingLinks, linksByStartNodeId);
        let {availableShapes} = levelData;
        let levelDataInCaseOfBailOut = levelData.inbetweenSpaces > 0 ? {
            ...levelData,
            endShape: LevelGenerator.shapeFromNode(currentNode),
            availableShapes: availableShapes.filter((shapeName) => currentNode.shapeName !== shapeName),
            clockwiseRotate: LevelGenerator.aggregateClockwiseRotations(availableLinks, nodesById)
        } : null;


        if (levelData.inbetweenSpaces >= 8 || !outgoingLinks.length) {
            return levelDataInCaseOfBailOut;
        }

        let levelsToReturn = [];
        let noNewLevels = true;
        for (let outgoingLink of outgoingLinks) {
            /* Add the links to the links in our sub set */
            let newPotentialNode = nodesById[outgoingLink.target];
            if (newPotentialNode.shapeName === currentNode.shapeName) {
                console.log("encountered same shapeName two times in a row, bailing out");
                continue;
            }
            if (visitedNodes[newPotentialNode.id]) {
                console.log("already visited node " + newPotentialNode.id + ", bailing out");
                continue;
            }
            let nodesOfSameType = LevelGenerator.getNodesOfSameRotation(newPotentialNode, nodesById);
            let newLinksByNodeId = LevelGenerator.getListDictFromNodeList(nodesOfSameType, linksByStartNodeId);
            let potentialLinkCollection = LevelGenerator.mergeLinkDicts(availableLinks, newLinksByNodeId, {[currentNode.id]: [outgoingLink]});

            let newAmountOfSpaces = levelData.inbetweenSpaces + 1;
            if (newAmountOfSpaces > 0 && !LevelGenerator.nodesHaveUniquePath(potentialLinkCollection, startNode.id, newPotentialNode.id, newAmountOfSpaces + 1)) {
                console.log("No unique path found for " + newPotentialNode.id + ", bailing out");
                continue;
            }
            noNewLevels = false;
            /* New node survived check, moving on */
            console.log("New node " + newPotentialNode.id + " survived check, moving on");

            let newLevelData = {
                startShape: levelData.startShape,
                availableShapes: levelData.availableShapes.concat(newPotentialNode.shapeName),
                inbetweenSpaces: newAmountOfSpaces,
                cheatAnswer: levelData.cheatAnswer.concat(newPotentialNode),
            };
            let newLevels = LevelGenerator.searchForLevel(
                startNode,                                                              //  Stays the same
                newPotentialNode,                                                       //  "currentNode"
                potentialLinkCollection,                                                //  "availableLinks"
                newLevelData,                                                           //  "levelData"
                {...visitedNodes, [newPotentialNode.id]: true},                        //  "visitedNodeTypes"
                linksByStartNodeId,                                                     //  Stays the same
                nodesById                                                               //  Stays the same
            );

            levelsToReturn = levelsToReturn.concat(
                Array.isArray(newLevels) ?
                    _.flattenDeep(newLevels).filter((level) => !!level && level.length !== 0) : newLevels
            );
        }
        if (noNewLevels) {
            if (levelDataInCaseOfBailOut) {
                LevelStorage.storeLevel(levelDataInCaseOfBailOut);
            }
            return levelDataInCaseOfBailOut;
        }
        return levelsToReturn;
    }

    static aggregateClockwiseRotations(linkObj, nodesById) {
        let clockwiseRotations = [];
        for (let sourceId in linkObj) {
            let links = linkObj[sourceId];
            clockwiseRotations = clockwiseRotations.concat(links.filter((link) => link.clockwiseRotate).map((link) =>
                [LevelGenerator.shapeFromNode(nodesById[sourceId]), LevelGenerator.shapeFromNode(nodesById[link.target])]
            ));
        }
        return clockwiseRotations;
    }

    static nodesHaveUniquePath(linkDict, sourceNodeId, targetNodeId, noSteps, visitedNodes = {}) {
        // console.log("Checking " + sourceNodeId + "=>" + targetNodeId, noSteps);
        if (noSteps < 0) {
            return false;
        }
        if (noSteps === 0 && targetNodeId === sourceNodeId) {
            return true;
        }
        let noFoundPaths = 0;
        let newVisitedNodes = {...visitedNodes, [sourceNodeId]: true};
        (linkDict[sourceNodeId] || []).every((link) => {
            noFoundPaths += LevelGenerator.nodesHaveUniquePath(linkDict, link.target, targetNodeId, noSteps - 1, newVisitedNodes);
            return noFoundPaths <= 1;
        });
        return noFoundPaths === 1;
    }

    static getNodesOfSameRotation(node, nodesById) {
        return [0, 1, 2, 3].map((rotation) => nodesById[`${node.shapeName}_${rotation}`]);
    }

    static getOtherNodesOfSameRotation(node, nodesById) {
        return LevelGenerator.getNodesOfSameRotation(node, nodesById).filter((otherNode) => {
            return otherNode !== node
        });
    }

    static getAllLinksFromNodeList(nodeList, linkDict) {
        return nodeList.reduce((result, otherNode) => result.concat(linkDict[otherNode.id]), []);
    }

    static getListDictFromNodeList(nodeList, linkDict) {
        return nodeList.reduce((result, node) => Object.assign(result, {[node.id]: linkDict[node.id]}), {});
    }


    static sortLinksForRareFirst(links, linkDict) {
        return links.sort((link, otherLink) => (linkDict[link.target] || []).length - (linkDict[otherLink.target] || []).length);
    }

    static getLinksByStartNodeId(links) {
        let linksByStartNodeId = {};
        for (let {source, target, value, clockwiseRotate} of links) {
            let links = linksByStartNodeId[source];
            if (!links) {
                links = linksByStartNodeId[source] = [];
            }
            links.push({target, value, clockwiseRotate});
        }
        return linksByStartNodeId;
    }

    static getNodeById(nodes) {
        let nodesById = {};
        for (let node of nodes) {
            nodesById[node.id] = node;
        }
        return nodesById;
    }

    static shapeFromNode(node) {
        return {rotation: node.rotation, shapeName: node.shapeName};
    }

    static mergeLinkDicts(...dicts) {
        /* The _.uniqBy combined with _.isEqual is probably really bad for performance, but what can you do */
        return _.extendWith({}, ...dicts, (links, otherLinks) => Array.isArray(links) && Array.isArray(otherLinks) ? _.uniqBy(links.concat(otherLinks), _.isEqual) : undefined);
    }


}