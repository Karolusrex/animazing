/**
 * Created by lundfall on 6/13/16.
 */
import Surface               from 'famous/core/Surface.js';

import {View}                from 'arva-js/core/View.js';
import {layout, options}     from 'arva-js/layout/decorators.js';
import {HorizontalGrid}      from './grid/HorizontalGrid.js';
import {VerticalGrid}           from './grid/VerticalGrid.js';

let gridOptions = {
    color: "antiquewhite",
    borderThickness: "0.5px"
};
export class ShapeGrid extends View {


    @layout.fullscreen
    horizontal = new HorizontalGrid(gridOptions);

    @layout.fullscreen
    vertical = new VerticalGrid(gridOptions);

    getSize() {
        return ShapeGrid.getSize()
    }
    /* So it can be reused in other places */
    static getSize() {
        return [250, 250]
    }

}