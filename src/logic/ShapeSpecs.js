/**
 * Created by lundfall on 5/31/16.
 */

import {turnShape}  from '../util/SpecProcessing.js';

export class ShapeSpec {
    constructor({ shape, isRotationOf, quarterCycles }) {
        this._specs = shape;
        this._keys = Object.keys(shape).sort();
        this._unrotatedShape = isRotationOf;
        this._quarterTurns = quarterCycles || 0;
        /* for ease of use and backwards compatibility */
        this.forEach((name, spec) => {
            this[name] = spec;
        });
    }

    static getBarNames() {
        return ['topBar', 'midBar', 'bottomBar', 'extraBar'].sort();
    }
    toString() {
        let shapeName = this._shapeName || this.getUnrotated()._shapeName;
        let quarterTurns = this._quarterTurns;
        return `${shapeName}_${quarterTurns}`;
    }

    /**
     *
     * @returns {*|number}
     */
    getNoQuarterTurns() {
        return this._quarterTurns;
    }

    setShapeName(shapeName) {
        this._shapeName = shapeName;
    }

    getStickCount() {
        return this._keys.length;
    }

    /**
     * Loops over the specs in a deterministic order
     * @param callback Called with (specName, spec)
     */
    forEach(cb) {
        for (let key of this._keys.sort()) {
            cb(key, this._specs[key]);
        }
    }

    hasStickName(stickName) {
        return this._keys.includes(stickName);
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
        if (this._unrotatedShape) {
            return this._unrotatedShape.isSameUnrotated(otherShapeSpec);
        }
        return this == otherShapeSpec || this == otherShapeSpec.getUnrotated();
    }

    isSameAs(otherShapeSpec) {
        return this.isSameUnrotated(otherShapeSpec) && (this._quarterTurns % 4) === (otherShapeSpec._quarterTurns % 4);
    }

    setNoQuarterTurns(quarterTurns) {
        this._quarterTurns = quarterTurns;
    }
}

const stickDimensions = [100, 10];

export class ShapeSpecCollection {
    /* Two sticked shapes */
    t = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [70, 0, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI],
                translate: [0, 0, 0],
                size: stickDimensions
            }
        }
    });

    chineeseSticks = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, -Math.PI / 3],
                translate: [35, 0, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI / 3],
                translate: [-35, 0, 0],
                size: stickDimensions
            }
        }
    });

    parallel = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI],
                translate: [35, 50, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI],
                translate: [-35, -50, 0],
                size: stickDimensions
            }
        }
    });

    shuffledParallel = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI / 4],
                translate: [35, -35, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI / 4],
                translate: [-35, 35, 0],
                size: stickDimensions
            }
        }
    });



    /* Three sticked shapes */
    hamburger = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, 0],
                translate: [0, -40, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, 0],
                translate: [0, 0, 0],
                size: stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, 0],
                translate: [0, 40, 0],
                size: stickDimensions
            }
        }
    });

    upArrow = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI / 3],
                translate: [35, -30, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, -Math.PI / 3],
                translate: [-35, -30, 0],
                size: stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, 0],
                translate: [0, 30, 0],
                size: stickDimensions
            }
        }
    });


    upPointArrow = new ShapeSpec({
        shape: {
            topBar: Object.assign({}, this.upArrow.midBar, { translate: [this.upArrow.midBar.translate[0], ...this.upArrow.midBar.translate.slice(1)] }),
            midBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [0, 55, 0],
                size: stickDimensions
            },
            bottomBar: Object.assign({}, this.upArrow.topBar, { translate: [this.upArrow.topBar.translate[0], ...this.upArrow.topBar.translate.slice(1)] })
        }
    });




    pi = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, 0],
                translate: [-70, 20, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, 0],
                translate: [-70, -20, 0],
                size: stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [30, 0, 0],
                size: stickDimensions
            }
        }
    });



    capitalN = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, -Math.PI / 3],
                translate: [75, -50, 0],
                size: stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, Math.PI / 3],
                translate: [0, -50, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, -Math.PI / 3],
                translate: [-75, -50, 0],
                size: stickDimensions
            }
        }
    });

    hat = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI / 3],
                translate: [35, 20, 0],
                size: stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, -Math.PI / 3],
                translate: [-35, 20, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, 0],
                translate: [0, -45, 0],
                size: stickDimensions
            }
        }
    });


    sauron = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI / 5],
                translate: [-30, 30, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, 0],
                translate: [0, 0, 0],
                size: stickDimensions
            },

            bottomBar: {
                rotate: [0, 0, Math.PI / 5],
                translate: [30, -30, 0],
                size: stickDimensions
            }
        }
    });

    insect = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, -Math.PI / 3],
                translate: [35, -70, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI / 3],
                translate: [-35, -70, 0],
                size: stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [0, 50, 0],
                size: stickDimensions
            }
        }
    });

    line = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, -Math.PI / 4],
                translate: [-60, 60, 0],
                size: stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, -Math.PI / 4],
                translate: [60, -60, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI / 4],
                translate: [0, 0, 0],
                size: stickDimensions
            }
        }
    });

    mess = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, 0],
                translate: [-75, -55, 0],
                size: stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, 0],
                translate: [65, 65, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [0, 40, 0],
                size: stickDimensions
            }
        }
    });

    shuffledUpPointArrow = new ShapeSpec({
        shape: {
            topBar: Object.assign({}, this.upArrow.midBar, { translate: [this.upArrow.midBar.translate[0], ...this.upArrow.midBar.translate.slice(1)] }),
            midBar: Object.assign({}, this.upArrow.topBar, { translate: [this.upArrow.topBar.translate[0], ...this.upArrow.topBar.translate.slice(1)] }),
            bottomBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [0, 55, 0],
                size: stickDimensions
            }
        }
    });


    sum = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI / 4],
                translate: [0, -45, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, - Math.PI / 4],
                translate: [0, 45, 0],
                size: stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, 0],
                translate: [0, 100, 0],
                size: stickDimensions
            },
            extraBar: {
                rotate: [0, 0, 0],
                translate: [0, -100, 0],
                size: stickDimensions
            }
        }
    });

    box = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [75, 0, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [-75, 0, 0],
                size: stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, 0],
                translate: [0, 75, 0],
                size: stickDimensions
            },
            extraBar: {
                rotate: [0, 0, 0],
                translate: [0, -75, 0],
                size: stickDimensions
            }
        }
    });

    crossBow = new ShapeSpec({
        shape: {
            topBar: {
                rotate: [0, 0, -Math.PI / 3],
                translate: [-35, -50, 0],
                size: stickDimensions
            },
            midBar: {
                rotate: [0, 0, Math.PI / 2],
                translate: [0, 25, 0],
                size: stickDimensions
            },
            bottomBar: {
                rotate: [0, 0, Math.PI / 3],
                translate: [35, -50, 0],
                size: stickDimensions
            },
            extraBar: {
                rotate: [0, 0, 0],
                translate: [0, 100, 0],
                size: stickDimensions
            }
        }
    });


}


let shapeCollection = new ShapeSpecCollection();
export const ShapeSpecs = shapeCollection;


for (let shapeName in shapeCollection) {
    /* Set the shape names so that every shape knows it owns name */
    shapeCollection[shapeName].setShapeName(shapeName);
}


