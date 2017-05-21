import LayoutNode                   from 'famous-flex/LayoutNode.js';

import {Controller}                 from 'arva-js/core/Controller.js';
import {LevelGenerator}             from '../logic/LevelGenerator.js';
import {RotationMode} from '../util/SpecProcessing';

export class LevelGeneratorController extends Controller {

    CheckCollisions(visualFeedback = false, speed = 0.01) {
        if (visualFeedback) {
            /* Patch to make it work */
            LayoutNode.prototype.getSpec = function() {
                this._specModified = false;
                /* This line is removed from the original, to make far apart updates possible without removing the node */
                // this._spec.removed = !this._invalidated;
                return this._spec;
            };
            return LevelGenerator.generateCollisionGraphVisualFeedback(+speed);
        } else {
            return LevelGenerator.generateCollisionGraph();
        }
    }

    FindLevels() {
        return LevelGenerator.initLevelFinding();
    }

}
