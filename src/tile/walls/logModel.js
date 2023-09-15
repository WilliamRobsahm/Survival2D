import { TileDrop } from "../tileDrop.js";
import WallBase from "../base/WallBase.js";
import { ItemRegistry as Items } from "../../item/itemRegistry.js";
import Item from "../../item/item.js";
import { Tile } from "../Tile.js";
import { TileRegistry } from "../tileRegistry.js";

export class LogModel extends WallBase {
    constructor(registryName) {
        super(registryName);
        this.transparent = true;
        this.setMiningProperties(Item.toolTypes.AXE, 0, 1.5, false);

        this.tileDrops = [
            new TileDrop(Items.WOOD, 1, 3).affectedByMultipliers(),
        ]
    }

    // Override
    canBeMined(item) {
        return(!Item.isTool(item, Item.toolTypes.HAMMER));
    }

    breakTile(tile, item, world) {
        let tileAbove = world.walls.get(tile.gridX, tile.gridY + 1);
        if(Tile.isTile(tileAbove, TileRegistry.LOG)) {
            tileAbove.breakTile(tileAbove, item, world);
        }
        super.breakTile(tile, item, world);
    }

    render(ctx, tile) {
        ctx.fillStyle = "rgb(150,100,85)";
        ctx.fillRect(tile.x + 5, tile.y, this.w - 10, this.h);
    }
}