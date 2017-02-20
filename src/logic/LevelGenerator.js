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
    @layout.fullSize()
    background = new Surface({ properties: { backgroundColor: 'rgb(178, 178, 178)' } });


    constructor(options) {
        super(options);
        for (let [i, bar] of this._getBarNames().entries()) {
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

    static async generateCollisionGraph(getNextContextEmitter = null, speed = 0.01) {
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
                console.log(`Checking collision between ${shapeName} and ${otherShapeName}`);
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
                for (let {
                    source:
                        { shapeName, quarterRotation },
                    target: { shapeName: otherShapeName, quarterRotation: otherQuarterRotation },
                    clockwiseRotate
                }
                    of resultingLinksFromShapeCombination) {
                    for (let rotation of [0, 1, 2, 3]) {
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


    /**
     * For debugging
     */
    static includeOnlyCertainNodesInCollisionGraph(collisionGraph, nodesToInclude) {
        let { nodes, links } = collisionGraph;
        let prunedCollisionGraph = { nodes: [], links: [] };
        for (let node of nodes) {
            console.log(`LevelGenerator.getUnrotatedId(node.id)): ${LevelGenerator.getUnrotatedId(node.id)}`);
            if (nodesToInclude.includes(LevelGenerator.getUnrotatedId(node.id))) {
                prunedCollisionGraph.nodes.push(node);
            }
        }
        for (let link of links) {
            if (nodesToInclude.includes(LevelGenerator.getUnrotatedId(link.source)) &&
                nodesToInclude.includes(LevelGenerator.getUnrotatedId(link.target))) {
                prunedCollisionGraph.links.push(link);
            }
        }
        return prunedCollisionGraph;
    }

    /**
     * @param {RotationMode} rotationMode The way each thing can rotate
     * @returns {LevelGenerator}
     */
    static findLevels(rotationMode) {
        console.time('Finding all levels');
        let debugView = new LevelGenerator();
        this._findLevels(rotationMode, debugView);
        return debugView;
    }

    static async _findLevels(rotationMode, debugView){
        LevelStorage.clearLevels();
        let collisionGraph = JSON.parse(localStorage.getItem("collisionGraph"));
        console.log(collisionGraph);
        let nodesById = LevelGenerator.getNodeById(collisionGraph.nodes);
        let linksByStartNodeId = LevelGenerator.getLinksByStartNodeId(collisionGraph.links);
        let foundLevels = [];
        let checkedShapeNames = {};
        for (let startNode of collisionGraph.nodes) {
            /* We don't have to do a new set of levels for each of the 4 rotation states */
            if (checkedShapeNames[startNode.shapeName]) {
                continue;
            }
            console.group(startNode.shapeName);

            let levelData = {
                startShape: LevelGenerator.shapeFromNode(startNode),
                availableShapes: [],
                inbetweenSpaces: -1,
                cheatAnswer: [startNode.id],
                clockwiseRotate: []
            };
            let newLevels = await LevelGenerator.searchForLevel(
                startNode,
                startNode,
                {},                             //availableLinks, will become startNode
                checkedShapeNames,              //Things to skip
                levelData,
                { [startNode.id]: true },
                linksByStartNodeId,
                nodesById,
                rotationMode,
                debugView
            );
            checkedShapeNames[startNode.shapeName] = true;
            foundLevels.push(newLevels);
            console.groupEnd(startNode.shapeName);
        }
        foundLevels = _.flattenDeep(foundLevels).filter((level) => !!level);
        console.log(`Found ${foundLevels.length} levels`);
        localStorage.setItem("levels", JSON.stringify(foundLevels));
    }


    static async searchForLevel(startNode, currentNode, availableLinks, skipList, levelData, visitedNodes, linksByStartNodeId, nodesById) {
        let unsortedOutgoingLinks = LevelGenerator.uniquifyLinksByShapeTargetName(linksByStartNodeId[currentNode.id] || []);
        console.log("Searching for level from node " + currentNode.id + ", amount of spaces : " + levelData.inbetweenSpaces);
        /* Sort link and choose the target node that has the least amount of outgoing links */
        let outgoingLinks = LevelGenerator.sortLinksForRareFirst(unsortedOutgoingLinks, linksByStartNodeId);
        let { availableShapes } = levelData;
        let availableShapesForLevel = LevelGenerator.createAvailableShapesForLevel(availableShapes, startNode, currentNode, linksByStartNodeId, nodesById);
        let levelDataInCaseOfBailOut = levelData.inbetweenSpaces > 0 ? {
            ...levelData,
            endShape: LevelGenerator.shapeFromNode(currentNode),
            availableShapes: availableShapesForLevel,
            clockwiseRotate: LevelGenerator.aggregateClockwiseRotations(
                LevelGenerator.mergeLinkDicts(availableLinks, LevelGenerator.getListDictFromNodeList([..._.flatten(availableShapesForLevel.map((shapeName) => LevelGenerator.getNodesOfSameRotation(nodesById[`${shapeName}_0`], nodesById))), ...LevelGenerator.getNodesOfSameRotation(startNode, nodesById)], linksByStartNodeId)),
                nodesById)
        } : null;


        if (levelData.inbetweenSpaces >= 6 || !outgoingLinks.length || skipList[currentNode.shapeName]) {
            return levelDataInCaseOfBailOut;
        }

        let levelsToReturn = [];
        let noNewLevels = true;
        for (let outgoingLink of outgoingLinks) {
            /* Add the links to the links in our subset */
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
            let linksToStartNode = LevelGenerator.getLinksFromNodeToNodeGroup(linksByStartNodeId, startNode, nodesOfSameType);
            let potentialLinkCollection = LevelGenerator.mergeLinkDicts(availableLinks, newLinksByNodeId, { [currentNode.id]: [outgoingLink] }, linksToStartNode);

            let newAmountOfSpaces = levelData.inbetweenSpaces + 1;
            if (newAmountOfSpaces > 0 && LevelGenerator.nodesHaveUniquePath(potentialLinkCollection, startNode.id, newPotentialNode.id, newAmountOfSpaces + 1) !== 1) {
                console.log(`No unique path found between ${startNode.id} and ${newPotentialNode.id} steps: ${newAmountOfSpaces + 1}`);
                continue;
            }
            noNewLevels = false;
            /* New node survived check, moving on */
            console.log("New node " + newPotentialNode.id + " survived check, moving on");

            let newLevelData = {
                startShape: levelData.startShape,
                availableShapes: levelData.availableShapes.concat(newPotentialNode.shapeName),
                inbetweenSpaces: newAmountOfSpaces,
                cheatAnswer: levelData.cheatAnswer.concat(newPotentialNode)
            };
            /* Await in order to prevent the browser from not responding to interruptions */
            await new Promise((resolve) => setTimeout(resolve,50));
            let newLevels = await LevelGenerator.searchForLevel(
                startNode,                                                              //  Stays the same
                newPotentialNode,                                                       //  "currentNode"
                potentialLinkCollection,                                                //  "availableLinks"
                skipList,                                                               //  Stays the same
                newLevelData,                                                           //  "levelData"
                { ...visitedNodes, [newPotentialNode.id]: true },                       //  "visitedNodeTypes"
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
        //console.log("Checking " + sourceNodeId + "=>" + targetNodeId, noSteps);

        if (noSteps < 0) {
            return 0;
        }
        if (noSteps === 0) {
            if (targetNodeId === sourceNodeId) {
                return 1;
            }
            return 0;
        }
        let noFoundPaths = 0;
        let newVisitedNodes = { ...visitedNodes, [sourceNodeId]: true };
        let outgoingLinks = (linkDict[sourceNodeId] || []);
        //console.log(`outgoingLinks.length: ${outgoingLinks.length}`);
        outgoingLinks.every((link) => {
            if (link.target in newVisitedNodes) {
                return true;
            }
            //console.log(`From ${sourceNodeId}: ${link.target}`);
            noFoundPaths += LevelGenerator.nodesHaveUniquePath(linkDict, link.target, targetNodeId, noSteps - 1, newVisitedNodes);
            //console.log(`noFoundPaths: ${noFoundPaths}`);
            return noFoundPaths <= 1;
        });

        return noFoundPaths > 1 ? Infinity : noFoundPaths;
    }


    static uniquifyLinksByShapeTargetName(links) {
        return _.uniqBy(Object.keys(links).map((sourceNodeId) => links[sourceNodeId]), (link) => link.target.substr(0, link.target.indexOf('_')));
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
        return nodeList.reduce((result, node) => Object.assign(result, { [node.id]: linkDict[node.id] }), {});
    }

    static getListDictFromNodeListWithReverse(nodeList, linkDict) {
        /*let nodeIds = nodeList.map((node) => node.id);*/
        return nodeList.reduce((result, node) => Object.assign(result, { [node.id]: linkDict[node.id], ...linkDict[node.id].reduce((accumulator, { target }) => target !== node.id ? accumulator : Object.assign(accumulator, { [target]: linkDict[target] }), {}) }), {});
    }


    static sortLinksForRareFirst(links, linkDict) {
        return links.sort((link, otherLink) => (linkDict[link.target] || []).length - (linkDict[otherLink.target] || []).length);
    }

    static getLinksByStartNodeId(links) {
        let linksByStartNodeId = {};
        for (let { source, target, value, clockwiseRotate } of links) {
            let refactoredLinks = linksByStartNodeId[source];
            if (!refactoredLinks) {
                refactoredLinks = linksByStartNodeId[source] = [];
            }
            refactoredLinks.push({ source, target, value, clockwiseRotate });
        }
        return linksByStartNodeId;
    }

    /**
     * Creates the available shapes for a level
     * @param availableShapes
     * @param startNode
     * @param endNode
     * @param linksById
     * @param nodesById
     * @returns {Array}
     */
    static createAvailableShapesForLevel(availableShapes, startNode, endNode, linksById, nodesById) {
        let availableShapesForLevel = _.shuffle(_.uniq(availableShapes.slice(0, -1))); /* Slice to remve last shape (the final one) */
        let edgeNodes = [startNode, endNode];
        if(availableShapesForLevel.length === 1){
            /* Add a joker to confuse player */
            for(let nodeId of Object.keys(nodesById)){
                if(edgeNodes.find((edgeNode) => edgeNode.id == nodeId)){
                    continue;
                }
                for(let nodeThatShouldNotHaveLinkWithJoker of edgeNodes){
                    if(LevelGenerator.getNodesOfSameRotation(nodeThatShouldNotHaveLinkWithJoker, nodesById).every((potentialCollisionFreeNode) => linksById[nodeId].every((link) => link.target !== potentialCollisionFreeNode.id))){
                        availableShapesForLevel.push(nodesById[nodeId].shapeName);
                        return _.shuffle(availableShapesForLevel);
                    }
                }
            }
        }
        return availableShapesForLevel;
    }

    static getLinksFromNodeToNodeGroup(availableLinks, node, nodeGroup) {
        return LevelGenerator.getLinksByStartNodeId(availableLinks[node.id].filter((link) => !nodeGroup.every((node) => link.target !== node.id)));
    }

    static getNodeById(nodes) {
        let nodesById = {};
        for (let node of nodes) {
            nodesById[node.id] = node;
        }
        return nodesById;
    }

    static shapeFromNode(node) {
        return { rotation: node.rotation, shapeName: node.shapeName };
    }

    static mergeLinkDicts(...dicts) {
        /* The _.uniqBy combined with _.isEqual is probably really bad for performance, but what can you do */
        return _.extendWith({}, ...dicts, (links, otherLinks) => Array.isArray(links) && Array.isArray(otherLinks) ? _.uniqWith(links.concat(otherLinks), _.isEqual) : undefined);
    }

    static getUnrotatedId(id) {
        return id.substr(0, id.indexOf('_'));
    }
}