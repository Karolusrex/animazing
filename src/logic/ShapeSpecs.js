/**
 * Created by lundfall on 5/31/16.
 */

import {turnShape}  from '../util/SpecProcessing.js';

export class ShapeSpec {
    constructor({shape, isRotationOf, quarterCycles}) {
        this._specs = shape;
        this._keys = Object.keys(shape).sort();
        this._unrotatedShape = isRotationOf;
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
        for (let key of this._keys) {
            cb(key, this._specs[key]);
        }
    }

    getUnrotated() {
        return this._unrotatedShape;
    }
    /**
     * Returns true if the other shape is the same
     * @param specs
     * @returns {boolean}
     */
    isSameUnrotated(otherShapeSpec) {
        if(this._unrotatedShape){
            return this._unrotatedShape.isSameUnrotated(otherShapeSpec);
        }
        return this == otherShapeSpec || this == otherShapeSpec.getUnrotated();
    }
}

export class ShapeSpecCollection {

    stickDimensions = [100, 10];

    hamburger = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, 0],
                translate: [0, -40, 0],
                size: this.stickDimensions
            },
            midBar: {
                rotate: [0, 0, 0],
                translate: [0, 0, 0],
                size: this.stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, 0],
                translate: [0, 40, 0],
                size: this.stickDimensions
            }
        }
    });

    shuffledHamburger = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, 0],
                translate: [0, 40, 0],
                size: this.stickDimensions
            },
            midBar: {
                rotate: [0, 0, 0],
                translate: [0, 0, 0],
                size: this.stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, 0],
                translate: [0, -40, 0],
                size: this.stickDimensions
            }
        }
    });

    pi = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, 0],
                translate: [-70, 20, 0],
                size: this.stickDimensions
            },
            midBar: {
                rotate: [0, 0, 0],
                translate: [-70, -20, 0],
                size: this.stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [30, 0, 0],
                size: this.stickDimensions
            }
        }
    });

    fallenHamburger = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [-40, 40, 0],
                size: this.stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [0, 40, 0],
                size: this.stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [40, 40, 0],
                size: this.stickDimensions
            }
        }
    });

    upArrow = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI / 3],
                translate: [35, -30, 0],
                size: this.stickDimensions
            },
            midBar: {
                rotate: [0, 0, -Math.PI / 3],
                translate: [-35, -30, 0],
                size: this.stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, 0],
                translate: [0, 30, 0],
                size: this.stickDimensions
            }
        }
    });

    insect = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, -Math.PI / 3],
                translate: [35, -70, 0],
                size: this.stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI / 3],
                translate: [-35, -70, 0],
                size: this.stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [0, 50, 0],
                size: this.stickDimensions
            }
        }
    });


    line = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, -Math.PI / 4],
                translate: [-60, 60, 0],
                size: this.stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, -Math.PI / 4],
                translate: [60, -60, 0],
                size: this.stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI / 4],
                translate: [0, 0, 0],
                size: this.stickDimensions
            }
        }
    });
    sauron = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI/5],
                translate: [-30, 30, 0],
                size: this.stickDimensions
            },
            midBar: {
                rotate: [0, 0, 0],
                translate: [0, 0, 0],
                size: this.stickDimensions
            },

            bottomBar: {
                rotate: [0, 0, Math.PI/5],
                translate: [30, -30, 0],
                size: this.stickDimensions
            }
        }
    });

    mess = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, 0],
                translate: [-75, -55, 0],
                size: this.stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, 0],
                translate: [65, 65, 0],
                size: this.stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [0, 40, 0],
                size: this.stickDimensions
            }
        }
    });

    xButton = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI / 4],
                translate: [0, 0, 0],
                size: this.stickDimensions
            },
            midBar: {
                rotate: [0, 0, 0],
                translate: [100, 0, 0],
                size: [200, 10],
                opacity: 0
            },
            bottomBar: {
                rotate: [0, 0, -Math.PI / 4],
                translate: [0, 0, 0],
                size: this.stickDimensions
            }
        }
    });

    upPointArrow = new ShapeSpec({
        shape: {
            topBar: Object.assign({}, this.upArrow.midBar, {translate: [this.upArrow.midBar.translate[0], ...this.upArrow.midBar.translate.slice(1)]}),
            midBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [0, 55, 0],
                size: this.stickDimensions
            },
            bottomBar: Object.assign({}, this.upArrow.topBar, {translate: [this.upArrow.topBar.translate[0], ...this.upArrow.topBar.translate.slice(1)]})
        }
    });

    shuffledUpPointArrow = new ShapeSpec({
        shape: {
            topBar: Object.assign({}, this.upArrow.midBar, {translate: [this.upArrow.midBar.translate[0], ...this.upArrow.midBar.translate.slice(1)]}),
            midBar: Object.assign({}, this.upArrow.topBar, {translate: [this.upArrow.topBar.translate[0], ...this.upArrow.topBar.translate.slice(1)]}),
            bottomBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [0, 55, 0],
                size: this.stickDimensions
            }
        }
    });

    twistedMenu = new ShapeSpec({
        shape: {
            topBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0] + 40, 0, 0]}),
            midBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0] - 40, 0, 0]}),
            bottomBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0], 0, 0]})
        }
    })
}

export const ShapeSpecs = new ShapeSpecCollection();