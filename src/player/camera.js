import GameObject from "../class/GameObject.js";
import { canvas, TILE_SIZE } from "../game/global.js";
import { clamp } from "../helper/helper.js";

export default class PlayerCamera extends GameObject {
    constructor(player) {
        super(player.game);
        this.player = player;
    }

    /**
     * Set the camera position to center the player
     */
    update() {
        this._x = Math.round(this.player.centerX - (canvas.width / 2));
        this._y = Math.round(this.player.centerY - (canvas.height / 2));
    }

    /**
     * Return the camera X value, limited by the world boundaries
     * @returns {Number}
     */
    get x() {
        return clamp(this._x, 0, this.player.game.world.width * TILE_SIZE - canvas.width);
    }
    
    /**
     * Return the camera Y value, limited by the world boundaries
     * @returns {Number}
     */
    get y() {
        return clamp(this._y, -this.player.game.world.height * TILE_SIZE, -canvas.height + TILE_SIZE);
    }

    get width() { return canvas.width }
    get height() { return canvas.height }

    // Outdated! kept as wrappers for now in order to not accidentally break anything
    getX() { return this.x }
    getY() { return this.y }
}