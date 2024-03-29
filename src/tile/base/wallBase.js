import Item from "../../item/item.js";
import { Tile } from "../Tile.js";
import { TileModel } from "../tileModel.js";

export default class WallBase extends TileModel {
    constructor(registryName, width, height) {
        super(registryName, width, height);
        this.type = Tile.types.WALL;
        this.connectivity = Tile.connectTo.ALL;

        this.setMiningProperties(Item.toolTypes.HAMMER, 0, 1, true);
        this.transparent = false;
    }

    // Override
    canBeMined(item, world) {
        if (item && item.placeable) 
            return false;

        if (world.tiles.get(this.gridX, this.gridY)?.transparent) 
            return false;

        if (this.requireTool) {
            return Item.isTool(item, Item.toolTypes.HAMMER);
        }

        return true;
    }
}