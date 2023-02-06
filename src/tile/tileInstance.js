import { TILE_SIZE } from "../game/global.js";

export class TileInstance {
    constructor(world, x, y, model) {
        this.world = world;
        this.game = world.game;

        this.setModel(model);

        this.x = x;
        this.y = y;
        this.mapX = x * TILE_SIZE;
        this.mapY = -y * TILE_SIZE;
        this.centerX = this.x + this.getWidth() / 2;
        this.centerY = this.y + this.getHeight() / 2;
        this.setSpriteOffset();
    }

    setModel(model) {
        this.model = this.game.tileRegistry.get(model);
    }

    getHeight() {
        return this.model ? this.model.h : 0;
    }

    getWidth() {
        return this.model ? this.model.w : 0;
    }

    getRegistryName() {
        return this.model ? this.model.registryName : "";
    }

    getDisplayName() {
        return this.model ? this.model.displayName : "";
    }

    getRequiredTool() {
        return this.model.requiredTool;
    }

    getID() {
        return this.model.id;
    }

    getType() {
        return this.model.objectType;
    }

    getX() {
        return this.mapX;
    }

    getY() {
        return this.mapY;
    }

    getGridX() {
        return this.x;
    }

    getGridY() {
        return this.y;
    }

    // Runs whenever the tile is "refreshed", i.e. something happens to an adjacent tile.
    tileUpdate() {
        return;
    }

    // Runs at a regular interval (not every frame)
    tickUpdate() {
        return;
    }

    canBeMined(item) {
        if(this.getRequiredTool() && !item) {
            return false;
        }
        return true;
    }

    getSpritePosition() {
        let adjacent = this.getAdjacent();
        let position = this.model.getSpritePosition(adjacent);
        this.sx = 12 + (position.x * 60);
        this.sy = 12 + (position.y * 60);
    }

    /**
     * Set sprite offset position
     * (Used for spritesheets)
     * 
     * @param {int} offsetX // X offset in pixels
     * @param {int} offsetY // Y offset in pixels
     */
     setSpriteOffset(offsetX,offsetY) {
        if(!offsetX || !offsetY) {
            this.sx = 0;
            this.sy = 0;
        } else {
            this.sx = offsetX;
            this.sy = offsetY;
        }
    }

    getAdjacent() {
        let adjacent = {
            tl:false,tm:false,tr:false,ml:false,mr:false,bl:false,bm:false,br:false
        };

        let checkTile = (x,y) => {
            try {
                let tile = this.world.getTile(x,y);
                if(tile && !tile.transparent) {
                    return true;
                }
                return false;
            } catch {
                return false;
            }
        }

        adjacent.tl = checkTile(this.x-1,this.y+1);
        adjacent.tm = checkTile(this.x,this.y+1);
        adjacent.tr = checkTile(this.x+1,this.y+1);
        adjacent.ml = checkTile(this.x-1,this.y);
        adjacent.mr = checkTile(this.x+1,this.y);
        adjacent.bl = checkTile(this.x-1,this.y-1);
        adjacent.bm = checkTile(this.x,this.y-1);
        adjacent.br = checkTile(this.x+1,this.y-1);

        return adjacent;
    }

    render() {
        this.model.render(this.mapX,this.mapY,this.sx,this.sy);
    }
}