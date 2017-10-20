/**
 * Created by lundfall on 03/09/16.
 */
import {ShapeSpecs,
ShapeSpec}                  from './ShapeSpecs.js';
import {
    turnShape,
    associateShapesInInterval,
    RotationMode,
    RotationStates
}
                            from '../util/SpecProcessing.js';
import _                    from 'lodash';
import {LevelStorage}       from './LevelStorage.js';

import {View}               from 'arva-js/core/View.js';
import Surface              from 'famous/core/Surface.js';
import {layout, options}    from 'arva-js/layout/decorators.js';
import hash                 from 'arva-js/utils/di/HashSum.js';


/* We extend view because of possibility of debugging by seeing the different collision modes possible */
export class LevelGenerator extends View {

    @layout.translate(0, 0, -10)
    @layout.fullSize()
    background = new Surface({ properties: { backgroundColor: 'rgb(178, 178, 178)' } });

    @layout.translate(0, -200, 0)
    @layout.stick.center()
    @layout.size(undefined, 200)
    titleText = new Surface({
        properties: { textAlign: 'center' }
    });

    @layout.stick.center()
    @layout.size(undefined, 200)
    statusIndicator = new Surface({});


    constructor(options) {
        super(options);
        for (let [i, bar] of ShapeSpec.getBarNames().entries()) {
            this.addRenderable(new Surface({
                content: '',
                classes: ['bar'],
                properties: {
                    backgroundColor: ['#2ecc71', '#8e44ad', '#d35400', '#e67e22', '#27ae60', '#9b59b6'][i],
                }
            }), bar);
        }
    }


    setRotationMode(rotationMode) {
        this.titleText.setContent(`Rotation mode: ${rotationMode}`);
    }

    static async generateCollisionGraphVisualFeedback(speed = 0.01) {
        let debugView = new LevelGenerator();
        debugView.layout.options.alwaysLayout = true;
        debugView.layouts.push((context) => {
            debugView._eventOutput.emit('newContext', context);
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
                let unrotatedShape = ShapeSpecs[shapeName];
                let unrotatedOtherShape = ShapeSpecs[otherShapeName];
                /* If they are different type of objects, so one doesn't have the same stick count as the other, then skip */
                if (unrotatedShape.getStickCount() !== unrotatedOtherShape.getStickCount()) {
                    continue;
                }
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
                                console.log(`No Collision between ${shapeName} in rotation state ${quarterRotation} and 
                            ${otherShapeName} in rotation state ${otherQuarterRotation}
                            in ${doClockWiseRotation ? ' clock-wise' : ' counter clock-wise}'}`);
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
                    source: { shapeName, quarterRotation },
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
            if (!associateShapesInInterval(i, shapePair, context, 1, doClickwiseRotation, false, [100, 100, 0], [200, 200])) {
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
     * @returns {LevelGenerator}
     */
    static initLevelFinding() {
        let debugView = new LevelGenerator();
        this._findLevels(debugView);
        return debugView;
    }

    static async _findLevels(debugView) {
        let foundLevels = [];
        for (let rotationMode in RotationMode) {
            console.group(`rotationMode.${rotationMode}`);
            debugView.setRotationMode(rotationMode);
            foundLevels = foundLevels.concat(await this._findLevelsForRotationMode(rotationMode, debugView));
            console.groupEnd(`rotationMode.${rotationMode}`);
        }

        debugView.titleText.setContent(`Total amount of levels: ${foundLevels.length}`);

        console.log('Total amount of levels:', foundLevels.length);
        localStorage.setItem('levels', JSON.stringify(foundLevels));
    }

    static async _findLevelsForRotationMode(rotationMode, debugView) {
        console.time('Finding all levels');
        LevelStorage.clearLevels();
        let collisionGraph = JSON.parse(localStorage.getItem("collisionGraph"));
        console.log(collisionGraph);
        let { links, nodes } = collisionGraph;
        let nodesRestrictedByAllowedRotations = nodes.filter(({ rotation }) => RotationStates[rotationMode].includes(rotation));
        let nodesById = LevelGenerator.getNodeById(nodesRestrictedByAllowedRotations);
        let linksRestrictedByAllowedRotations = links.filter(({ source, target }) => nodesById[source] && nodesById[target]);
        let linksByStartNodeId = LevelGenerator.getLinksByStartNodeId(linksRestrictedByAllowedRotations);
        let foundLevels = [];
        let checkedShapeNames = {};
        // TODO allow shuffling again with the following code line. It's removed now for reproducability
        for (let startNode of _.shuffle(nodesRestrictedByAllowedRotations)) {
        // for (let startNode of nodesRestrictedByAllowedRotations) {
            /* We don't have to do a new set of levels for each of the 4 rotation states */
            if (checkedShapeNames[startNode.shapeName]) {
                continue;
            }
            console.group(startNode.shapeName);

            let levelData = {
                rotationMode,
                startShape: LevelGenerator.shapeFromNode(startNode),
                availableShapes: [],
                inbetweenSpaces: -1,
                cheatAnswer: []
            };
            let newLevels = await LevelGenerator.searchForLevel(
                startNode,
                startNode,
                {},                             //availableLinks, will become startNode
                checkedShapeNames,              //Things to skip
                levelData,
                { [startNode.id]: true, stickCount: ShapeSpecs[startNode.shapeName].getStickCount() },
                linksByStartNodeId,
                nodesById,
                rotationMode,
                debugView
            );
            checkedShapeNames[startNode.shapeName] = true;
            foundLevels.push(newLevels);
            console.groupEnd(startNode.shapeName);
        }
        /* The levels are going to be nested and nasty, can have undefined things so filter that out */
        foundLevels = _.flattenDeep(foundLevels).filter((level) => !!level);
        console.log(`Found ${foundLevels.length} levels`);
        console.timeEnd('Finding all levels');
        return foundLevels;
    }


    static async searchForLevel(startNode, currentNode, availableLinks, skipByShapeName, levelData, visitedNodes, linksByStartNodeId, nodesById, rotationMode, debugView) {
        /* Store a hash in order to debug the level creation more easily */
        levelData.id = hash(JSON.stringify([...arguments].slice(0, 8)));
        /* Uniqify the links because we are about to loop over the shapes, treating different rotation modes as the same */
        let unsortedOutgoingLinks = LevelGenerator.uniquifyLinksByShapeTargetName(visitedNodes, linksByStartNodeId[currentNode.id] || []);
        console.log("Searching for level from node " + currentNode.id + ", amount of spaces : " + levelData.inbetweenSpaces);
        /* Sort link and choose the target node that has the least amount of outgoing links */
        let outgoingLinks = LevelGenerator.sortLinksForRareFirst(unsortedOutgoingLinks, linksByStartNodeId);
        let { availableShapes } = levelData;
        debugView.statusIndicator.setContent([startNode.id].concat(availableShapes).join(' -> '));
        let availableShapesForLevel = LevelGenerator.createAvailableShapesForLevel(availableShapes, startNode, currentNode, linksByStartNodeId, nodesById, rotationMode);
        let levelDataInCaseOfBailOut = levelData.inbetweenSpaces > 0 ? {
            rotationMode,
            ...levelData,
            endShape: LevelGenerator.shapeFromNode(currentNode),
            availableShapes: availableShapesForLevel
        } : null;


        if (levelData.inbetweenSpaces >= 4 || !outgoingLinks.length || skipByShapeName[currentNode.shapeName]) {
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
            let nodesOfSameType = LevelGenerator.getNodesOfSameRotation(newPotentialNode, nodesById, rotationMode);
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
                stickCount: ShapeSpecs[startNode.shapeName].getStickCount(),
                rotationMode,
                startShape: levelData.startShape,
                availableShapes: levelData.availableShapes.concat(newPotentialNode.shapeName),
                inbetweenSpaces: newAmountOfSpaces,
                cheatAnswer: levelData.cheatAnswer.concat(newPotentialNode)
            };
            /* Await in order to prevent the browser from not responding to interruptions */
            await new Promise((resolve) => setTimeout(resolve, 35));
            let newLevels = await LevelGenerator.searchForLevel(
                startNode,                                                              //  Stays the same
                newPotentialNode,                                                       //  "currentNode"
                potentialLinkCollection,                                                //  "availableLinks"
                skipByShapeName,                                                        //  Stays the same
                newLevelData,                                                           //  "levelData"
                { ...visitedNodes, [newPotentialNode.id]: true },                       //  "visitedNodeTypes"
                linksByStartNodeId,                                                     //  Stays the same
                nodesById,                                                              //  Stays the same
                rotationMode,                                                           //  Stays the same
                debugView                                                               //  Stays the same
            );
            //TODO Consider whether we should modify this could to what it was before= no intermediary levels stored.
            //Or perhaps set a flag for intermediary levels
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
        outgoingLinks.every((link) => {
            noFoundPaths += LevelGenerator.nodesHaveUniquePath(linkDict, link.target, targetNodeId, noSteps - 1, newVisitedNodes);
            if (link.target in newVisitedNodes) {
                return true;
            }
            return noFoundPaths <= 1;
        });

        return noFoundPaths > 1 ? Infinity : noFoundPaths;
    }


    /**
     *
     * @param visitedNodes
     * @param links
     * @returns {Array|*}
     */
    static uniquifyLinksByShapeTargetName(visitedNodes, links) {
        return _.uniqBy(links
                /* Filter by already visited node */
                .filter((link) => !visitedNodes[link.target])
            , (link) => link.target.substr(0, link.target.indexOf('_')));
    }

    static getNodesOfSameRotation(node, nodesById, rotationMode) {
        return RotationStates[rotationMode].map((rotation) => nodesById[`${node.shapeName}_${rotation}`]);
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


    /**
     * Sorts a list of links by their least number of outgoing links
     * @param {Array} links
     * @param {Object} linkDict
     */
    static sortLinksForRareFirst(links, linkDict) {
        return links.sort((link, otherLink) => (linkDict[link.target] || []).length - (linkDict[otherLink.target] || []).length);
    }

    /**
     *
     * @param [Array<{source: String, target: String, value: String, clockwiseRotate: Boolean}>] links
     * @returns {{}}
     */
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
    static createAvailableShapesForLevel(availableShapes, startNode, endNode, linksById, nodesById, rotationMode) {
        /* Slice the last one because that's going to be the end node */
        let availableShapesForLevel = _.uniq(availableShapes.slice(0, -1));
        /* Slice to remove last shape (the final one) */
        let edgeNodes = [startNode, endNode];
        /* If only 1 to choose from, add joker to confuse player in 50% of the cases*/
        if (availableShapesForLevel.length === 1 && Math.random() > .5) {
            for (let nodeId of _.shuffle(Object.keys(nodesById))) {
                let node = nodesById[nodeId];

                if (
                    /* Don't add the start or end node as a joker */
                edgeNodes.map(({ shapeName }) => shapeName).concat(availableShapes).includes(node.shapeName)
                /* Don't add a node with a different stick count */
                || LevelGenerator.getStickCountForNode(startNode) !== LevelGenerator.getStickCountForNode(node) ||
                /* Don't add nodes that form a successful path to the start node */
                linksById[startNode.id].find(({ target }) => LevelGenerator.getNodesOfSameRotation(node, nodesById, rotationMode).find(({ id }) => id === target))) {
                    continue;
                }
                availableShapesForLevel.push(nodesById[nodeId].shapeName);
                break;
            }
        }
        return _.shuffle(availableShapesForLevel);
    }

    static getStickCountForNode(node) {
        return ShapeSpecs[node.shapeName].getStickCount();
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