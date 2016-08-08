/**
 * Created by lundfall on 08/08/16.
 */
import {ShapeSpecs}     from './ShapeSpecs.js';



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
    }
];