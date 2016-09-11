import {Controller}                 from 'arva-js/core/Controller.js';
import {LevelGenerator}             from '../logic/LevelGenerator.js';

export class LevelGeneratorController extends Controller {

    CheckCollisions(){
        return LevelGenerator.generateCollisionGraph();
    }

    FindLevels() {
        return LevelGenerator.findLevels();
    }

}
