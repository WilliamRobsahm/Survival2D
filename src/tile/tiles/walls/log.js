import { ctx } from "../../../game/global.js";
import { Tile } from "../../../tile/tile.js";
import { updateNearbyTiles } from "../../../world/world.js";

export class Log extends Tile {
    constructor(world,gridX,gridY) {
        super(world,gridX,gridY);
        this.setRegistryName("wall_log");

        this.transparent = true;

        this.objectType = "wall";
        this.toolType = "axe";
        this.miningLevel = 0;
        this.miningTime = 1.5;

        this.tileDrops = [
            {id:7,rate:100,amount:[1,3],requireTool:false}
        ]
    }

    breakTile() {
        
        // If

        let tileAbove = getWall(this.gridX,this.gridY+1);
        if(tileAbove && tileAbove.registryName == "wall_log") {
            tileAbove.breakTile();
        }

        // Remove tile
        world.clearWall(this.gridX,this.gridY);
        wallGrid[this.gridX][this.gridY] = null;

        this.dropItems();
        updateNearbyTiles(this.gridX,this.gridY);
    }

    draw() {
        ctx.fillStyle = "rgb(200,130,110)";
        ctx.fillRect(this.x+4,this.y,this.w-8,this.h);
    }


}