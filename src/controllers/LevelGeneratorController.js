import LayoutNode                   from 'famous-flex/LayoutNode.js';

import {Controller}                 from 'arva-js/core/Controller.js';
import {LevelGenerator}             from '../logic/LevelGenerator.js';

export class LevelGeneratorController extends Controller {

    CheckCollisions(visualFeedback = false) {
        if (visualFeedback) {
            /* Patch to make it work */
            LayoutNode.prototype.getSpec = function() {
                this._specModified = false;
                /* This line is removed from the original, to make far apart updates possible without removing the node */
                // this._spec.removed = !this._invalidated;
                return this._spec;
            };
            return LevelGenerator.generateCollisionGraphVisualFeedback();
        } else {
            return LevelGenerator.generateCollisionGraph();
        }
    }

    FindLevels() {
        return LevelGenerator.findLevels();
    }

}
