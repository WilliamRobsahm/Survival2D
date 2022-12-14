
// FIXED IMPORTS:
import { ctx, TILE_SIZE } from "../game/global.js";
import { sprites } from "../game/graphics/loadAssets.js";
import { calculateDistance } from "../misc/util.js";

export default class PlacementPreview {
    constructor(sprite,offsetX,offsetY,game) {
        this.game = game;
        this.sx = offsetX;
        this.sy = offsetY;

        this.sprite = sprite;
        
        // If sprite is missing, use 'missing texture'
        if(!this.sprite) {
            this.sprite = sprites.misc["missing_texture"];
            this.missingTexture = true;
        } else {
            this.missingTexture = false;
        }

        this.aRange = [0.4,0.7];

        this.a = this.aRange[0];
        this.aFade = 0.02;
    }

    // Alpha (a) goes back and forth between the lower and higher points in this.aRange
    updateAlpha() {
        this.a += this.aFade;
        if((this.aFade > 0 && this.a >= this.aRange[1]) || 
            (this.aFade < 0 && this.a <= this.aRange[0])) {
                this.aFade *= -1;
        }
    }

    draw(gridX,gridY) {
        this.updateAlpha();

        // If out of placement range, 
        let pos = {
            centerX:gridX * TILE_SIZE + TILE_SIZE / 2,
            centerY:-gridY * TILE_SIZE + TILE_SIZE / 2
        }

        if(calculateDistance(this.game.player,pos) > this.game.player.reach || 
            !validPlacementPosition(gridX,gridY,this.game.world)) {
                ctx.globalAlpha = 0.05;
        } else {
            ctx.globalAlpha = this.a;
        }

        let x = gridX * TILE_SIZE;
        let y = -gridY * TILE_SIZE;
        ctx.drawImage(this.sprite,this.sx,this.sy,TILE_SIZE,TILE_SIZE,x,y,TILE_SIZE,TILE_SIZE);
        ctx.globalAlpha = 1;
    }
}



/**
 * If a tile can be placed in the given position return true.
 * A placement position is valid if it is touching another tile
 * or if there's a wall behind it
 * 
 * @param {number} gridX X position in grid
 * @param {number} gridY Y position in grid
 * @returns {boolean}
 */
export function validPlacementPosition(gridX,gridY,world) {

    // Check if tile is already occupied
    if (world.getTile(gridX,gridY)) {
        return false;
    }

    // Check for adjacent tile or wall
    if (world.getTile(gridX-1,gridY) || world.getTile(gridX+1,gridY) ||
        world.getTile(gridX,gridY-1) || world.getTile(gridX,gridY+1) ||
        world.getWall(gridX,gridY)) {
            return true;
    }
    return false;
}
