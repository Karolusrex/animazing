import {Controller}                 from 'arva-js/core/Controller.js';
import {GamePlayView}               from '../views/GamePlayView';

export class HomeController extends Controller {

    Index(){
        if(!this.homeView) {
            this.homeView = new GamePlayView();
        }
        return this.homeView;
    }
}