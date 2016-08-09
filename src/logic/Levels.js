/**
 * Created by lundfall on 08/08/16.
 */
import {ShapeSpecs, ShapeSpec}     from './ShapeSpecs.js';
import {turnShape}      from '../util/SpecProcessing.js';

export let levels = [
    {
        availableShapes: [ShapeSpecs.upPointArrow, ShapeSpecs.upArrow],
        startShape: ShapeSpecs.hamburger,
        endShape: ShapeSpecs.fallenHamburger,
        inbetweenSpaces: 3
    },
    {
        availableShapes: [ShapeSpecs.upPointArrow, ShapeSpecs.pi, ShapeSpecs.insect, ShapeSpecs.shuffledUpPointArrow],
        startShape: ShapeSpecs.fallenHamburger,
        endShape: ShapeSpecs.shuffledHamburger,
        inbetweenSpaces: 4
    },
    {
        availableShapes: [ShapeSpecs.insect, ShapeSpecs.line, ShapeSpecs.shuffledHamburger],
        startShape: turnShape(3,new ShapeSpec(ShapeSpecs.stairs)),
        endShape: turnShape(2,new ShapeSpec(ShapeSpecs.upArrow)),
        inbetweenSpaces: 4
    }
];

