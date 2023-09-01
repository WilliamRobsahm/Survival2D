import { ctx } from "../../game/global.js";
import { TileDrop } from "../tileDrop.js";
import WallBase from "../base/WallBase.js";
import { toolTypes as tool } from "../../item/itemTypes.js";
import { ItemRegistry as Items } from "../../item/itemRegistry.js";

export class LogModel extends WallBase {
    constructor(world, registryName) {
        super(world, registryName);
        this.transparent = true;
        this.setMiningProperties(tool.AXE, 0, 1.5, false);

        this.tileDrops = [
            new TileDrop(Items.WOOD, 1, 3).affectedByMultipliers(),
        ]
    }

    // Override
    canBeMined(item) {
        return (!item || item.toolType != tool.HAMMER);
    }

    breakTile(tile, toolType, miningLevel) {
        let tileAbove = this.world.getWall(tile.gridX, tile.gridY + 1);
        if(tileAbove && tileAbove.registryName == "log") {
            tileAbove.breakTile(tileAbove, toolType, miningLevel);
        }

        // Remove tile
        this.world.clearWall(tile.gridX, tile.gridY);

        this.dropItems(tile, toolType, miningLevel);
        this.world.updateNearbyTiles(tile.gridX, tile.gridY);
    }

    render(x, y) {
        ctx.fillStyle = "rgb(200,130,110)";
        ctx.fillRect(x + 4, y, this.w - 8, this.h);
    }
}