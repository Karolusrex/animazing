/**
 * Created by lundfall on 5/31/16.
 */

import {turnShape}  from '../util/SpecProcessing.js';


export class ShapeSpecCollection {

    stickDimensions = [100, 10];
    
    hamburger = {
        topBar: {
            rotate: [0, 0, 0],
            align: [0.5, 0.5],
            translate: [0, -40, 0],
            size: this.stickDimensions
        },
        midBar: {
            rotate: [0, 0, 0],
            align: [0.5, 0.5],
            translate: [0, 0, 0],
            size: this.stickDimensions
        },
        bottomBar: {
            rotate: [0, 0, 0],
            align: [0.5, 0.5],
            translate: [0, 40, 0],
            size: this.stickDimensions
        }
    };

    shuffledHamburger = {
        topBar: {
            rotate: [0, 0, 0],
            align: [0.5, 0.5],
            translate: [0, 40, 0],
            size: this.stickDimensions
        },
        midBar: {
            rotate: [0, 0, 0],
            align: [0.5, 0.5],
            translate: [0, 0, 0],
            size: this.stickDimensions
        },
        bottomBar: {
            rotate: [0, 0, 0],
            align: [0.5, 0.5],
            translate: [0, -40, 0],
            size: this.stickDimensions
        }
    };

    pi = {
        topBar: {
            rotate: [0, 0, 0],
            align: [0.5, 0.5],
            translate: [-70, 20, 0],
            size: this.stickDimensions
        },
        midBar: {
            rotate: [0, 0, 0],
            align: [0.5, 0.5],
            translate: [-70, -20, 0],
            size: this.stickDimensions
        },
        bottomBar: {
            rotate: [0, 0, Math.PI/2],
            align: [0.5, 0.5],
            translate: [30, 0, 0],
            size: this.stickDimensions
        }
    };
    
    fallenHamburger = {
        topBar: {
            rotate: [0, 0, Math.PI/2],
            translate: [-40,40, 0],
            size: this.stickDimensions
        },
        midBar: {
            rotate: [0, 0, Math.PI/2],
            translate: [0,40, 0],
            size: this.stickDimensions
        },
        bottomBar: {
            rotate: [0, 0, Math.PI/2],
            translate: [40,40, 0],
            size: this.stickDimensions
        }
    };

    upArrow = {
        topBar: {
            rotate: [0, 0, Math.PI / 3],
            align: [0.5, 0.5],
            translate: [35, -30, 0],
            size: this.stickDimensions
        },
        midBar: {
            rotate: [0, 0, -Math.PI / 3],
            align: [0.5, 0.5],
            translate: [-35, -30, 0],
            size: this.stickDimensions
        },
        bottomBar: {
            rotate: [0, 0, 0],
            align: [0.5, 0.5],
            translate: [0, 30, 0],
            size: this.stickDimensions
        }
    };
    insect = {
        topBar: {
            rotate: [0, 0, -Math.PI / 3],
            align: [0.5, 0.5],
            translate: [35, -70, 0],
            size: this.stickDimensions
        },
        midBar: {
            rotate: [0, 0, Math.PI / 3],
            align: [0.5, 0.5],
            translate: [-35, -70, 0],
            size: this.stickDimensions
        },
        bottomBar: {
            rotate: [0, 0, Math.PI/2],
            align: [0.5, 0.5],
            translate: [0, 50, 0],
            size: this.stickDimensions
        }
    };


    xButton = {
        topBar: {
            rotate: [0, 0, Math.PI / 4],
            align: [0.5, 0.5],
            translate: [0, 0, 0],
            size: this.stickDimensions
        },
        midBar: {
            rotate: [0, 0, 0],
            align: [0.5, 0.5],
            translate: [100, 0, 0],
            size: [200, 10],
            opacity: 0
        },
        bottomBar: {
            rotate: [0, 0, -Math.PI / 4],
            align: [0.5, 0.5],
            translate: [0, 0, 0],
            size: this.stickDimensions
        }
    };


    upPointArrow = {
        topBar: Object.assign({}, this.upArrow.midBar, {translate: [this.upArrow.midBar.translate[0], ...this.upArrow.midBar.translate.slice(1)]}),
        midBar: {
            rotate: [0, 0, Math.PI / 2],
            translate: [0, 55, 0],
            align: [0.5, 0.5],
            size: this.stickDimensions
        },
        bottomBar: Object.assign({}, this.upArrow.topBar, {translate: [this.upArrow.topBar.translate[0], ...this.upArrow.topBar.translate.slice(1)]})
    };


    shuffledUpPointArrow = {
        topBar: Object.assign({}, this.upArrow.midBar, {translate: [this.upArrow.midBar.translate[0], ...this.upArrow.midBar.translate.slice(1)]}),
        midBar: Object.assign({}, this.upArrow.topBar, {translate: [this.upArrow.topBar.translate[0], ...this.upArrow.topBar.translate.slice(1)]}),
        bottomBar: {
            rotate: [0, 0, Math.PI / 2],
            translate: [0, 55, 0],
            align: [0.5, 0.5],
            size: this.stickDimensions
        }
    };


    twistedMenu = {
        topBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0] + 40, 0, 0]}),
        midBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0] - 40, 0, 0]}),
        bottomBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0], 0, 0]}),
    }
}

export const ShapeSpecs = new ShapeSpecCollection();