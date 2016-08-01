/**
 * Created by lundfall on 5/31/16.
 */

import {turnShape}  from '../util/SpecProcessing.js';

export class ShapeSpec {
    constructor(specs){
        this._specs = specs;
        this._keys = Object.keys(specs).sort()
        /* for ease of use and backwards compatibility */
        this.forEach((name, spec) => {
            this[name] = spec;
        });
    }

    /**
     * Loops over the specs in a deterministic order
     * @param callback Called with (specName, spec)
     */
    forEach(cb) {
        for(let key of this._keys){
            cb(key, this._specs[key]);
        }
    }
}

export class ShapeSpecCollection {

    stickDimensions = [100, 10];
    
    hamburger = new ShapeSpec({
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
    });

    shuffledHamburger = new ShapeSpec( {
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
    });

    pi = new ShapeSpec({
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
    });
    
    fallenHamburger = new ShapeSpec({
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
    });

    upArrow = new ShapeSpec({
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
    });

    insect = new ShapeSpec({
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
    });

    xButton = new ShapeSpec({
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
    });


    upPointArrow = new ShapeSpec({
        topBar: Object.assign({}, this.upArrow.midBar, {translate: [this.upArrow.midBar.translate[0], ...this.upArrow.midBar.translate.slice(1)]}),
        midBar: {
            rotate: [0, 0, Math.PI / 2],
            translate: [0, 55, 0],
            align: [0.5, 0.5],
            size: this.stickDimensions
        },
        bottomBar: Object.assign({}, this.upArrow.topBar, {translate: [this.upArrow.topBar.translate[0], ...this.upArrow.topBar.translate.slice(1)]})
    });


    shuffledUpPointArrow = new ShapeSpec({
        topBar: Object.assign({}, this.upArrow.midBar, {translate: [this.upArrow.midBar.translate[0], ...this.upArrow.midBar.translate.slice(1)]}),
        midBar: Object.assign({}, this.upArrow.topBar, {translate: [this.upArrow.topBar.translate[0], ...this.upArrow.topBar.translate.slice(1)]}),
        bottomBar: {
            rotate: [0, 0, Math.PI / 2],
            translate: [0, 55, 0],
            align: [0.5, 0.5],
            size: this.stickDimensions
        }
    });


    twistedMenu = new ShapeSpec({
        topBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0] + 40, 0, 0]}),
        midBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0] - 40, 0, 0]}),
        bottomBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0], 0, 0]}),
    })
}

export const ShapeSpecs = new ShapeSpecCollection();