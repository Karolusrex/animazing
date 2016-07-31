/**
 * Created by lundfall on 26/07/16.
 */

export class Settings{
    static get backgroundColor() {
        return 'rgb(47, 47, 64)';
    }

    static get transparentBackgroundColor() {
        return Settings.backgroundColor.replace('rgb(','rgba(').replace(')', ', 0.5)');
    }
}