/**
 * Created by lundfall on 08/08/16.
 */
import {ShapeSpecs, ShapeSpec}     from './ShapeSpecs.js';
import {turnShape}      from '../util/SpecProcessing.js';

export let levels = [
    {
        availableShapes: [ShapeSpecs.mess, ShapeSpecs.fallenHamburger, ShapeSpecs.upArrow, ShapeSpecs.insect, ShapeSpecs.capitalN,  ShapeSpecs.shuffledUpPointArrow],
        startShape: ShapeSpecs.hat,
        endShape: turnShape(2, ShapeSpecs.hamburger),
        inbetweenSpaces: 1,
        clockwiseRotate: [
            /* Not necessary but just nice to have */
            [ShapeSpecs.pi, turnShape(2, ShapeSpecs.hamburger)],
            [ShapeSpecs.fallenHamburger, turnShape(3, ShapeSpecs.pi)]
        ]
    },
    {
        availableShapes: [ShapeSpecs.sauron, ShapeSpecs.insect],
        startShape: turnShape(2, ShapeSpecs.fallenHamburger),
        endShape: ShapeSpecs.hamburger,
        inbetweenSpaces: 1,
        clockwiseRotate: [
            [ShapeSpecs.fallenHamburger, ShapeSpecs.sauron]
        ]
    },
    {
        availableShapes: [ShapeSpecs.pi, ShapeSpecs.upPointArrow],
        startShape: ShapeSpecs.sauron,
        endShape: turnShape(2, ShapeSpecs.upArrow),
        inbetweenSpaces: 1,
        clockwiseRotate: [
            [ShapeSpecs.sauron, ShapeSpecs.hamburger]
        ]
    },
    {
        availableShapes: [ShapeSpecs.upPointArrow, ShapeSpecs.upArrow],
        startShape: ShapeSpecs.hamburger,
        endShape: ShapeSpecs.fallenHamburger,
        inbetweenSpaces: 3
    },
    {
        availableShapes: [ShapeSpecs.insect, ShapeSpecs.line, ShapeSpecs.shuffledHamburger],
        startShape: turnShape(3, ShapeSpecs.mess),
        endShape: turnShape(2, ShapeSpecs.upArrow),
        inbetweenSpaces: 4,
        clockwiseRotate: [
            /* To make it harder another option is available at first */
            [ShapeSpecs.mess, ShapeSpecs.shuffledHamburger]
        ]
    }
];

