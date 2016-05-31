/**
 * Created by lundfall on 5/31/16.
 */


export class ShapeCollection {

    stickDimensions = [100, 10];
    
    startState = {
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

     upArrow = {
        topBar: {
            rotate: [0, 0, Math.PI / 3],
            align: [0.5, 0.5],
            translate: [35, -30, 0], //7.2, 9.1 normalized, -7.2, -9.1 flipped
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


     downArrow = {
        midBar: Object.assign({}, this.upArrow.midBar, {
            rotate: [0, 0, Math.PI / 3],
            translate: [this.upArrow.midBar.translate[0], -this.upArrow.midBar.translate[1], this.upArrow.midBar.translate[2]]
        }),
        topBar: Object.assign({}, this.upArrow.topBar, {
            rotate: [0, 0, -Math.PI / 3],
            translate: [this.upArrow.topBar.translate[0], -this.upArrow.topBar.translate[1], this.upArrow.topBar.translate[2]]
            /*translate: [42.8, 40.9, 0],*/

        }),
        bottomBar: Object.assign({}, this.upArrow.bottomBar, {translate: [0, -this.upArrow.bottomBar.translate[1], 0]})
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

     rightPointArrow = {
        topBar: {
            rotate: [0, 0, Math.PI / 4],
            align: [0.5, 0.5],
            translate: [-10, -40, 0],
            size: this.stickDimensions
        },
        midBar: {
            rotate: [0, 0, 0],
            align: [0.5, 0.5],
            translate: [-70, 0, 0],
            size: [120, 10]
        },
        bottomBar: {
            rotate: [0, 0, -Math.PI / 4],
            align: [0.5, 0.5],
            translate: [-10, 40, 0],
            size: this.stickDimensions
        }
    };


     leftPointArrow = {
        topBar: Object.assign({}, this.rightPointArrow.topBar, {
            translate: [-30, this.rightPointArrow.topBar.translate[1], 0],
            rotate: [0, 0, -this.rightPointArrow.topBar.rotate[2]]
        }),
        midBar: Object.assign({}, this.rightPointArrow.midBar, {translate: [20, ...this.rightPointArrow.midBar.translate.slice(1)]}),
        bottomBar: Object.assign({}, this.rightPointArrow.bottomBar, {
            origin: [0.5, 0.5],
            translate: [-30, this.rightPointArrow.bottomBar.translate[1], 0],
            rotate: [0, 0, -this.rightPointArrow.bottomBar.rotate[2]]
        })
    }

     upPointArrow = {
        topBar: Object.assign({}, this.upArrow.topBar, {translate: [this.upArrow.topBar.translate[0], ...this.upArrow.topBar.translate.slice(1)]}),
        midBar: Object.assign({}, this.upArrow.midBar, {translate: [this.upArrow.midBar.translate[0], ...this.upArrow.midBar.translate.slice(1)]}),
        bottomBar: Object.assign({}, this.rightPointArrow.midBar, {
            rotate: [0, 0, Math.PI / 2],
            translate: [0, 45, 0],
            size: this.stickDimensions
        })
    };

     twistedMenu = {
        topBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0] + 40, 0, 0]}),
        midBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0] - 40, 0, 0]}),
        bottomBar: Object.assign({}, this.upPointArrow.bottomBar, {translate: [this.upPointArrow.bottomBar.translate[0], 0, 0]}),
    }
}

export const Shapes = new ShapeCollection();