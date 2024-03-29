import { sprites } from "../../graphics/assets.js";
import { Tile } from "../../tile/Tile.js";
import { TileRegistry as Tiles } from "../../tile/tileRegistry.js";
import PlaceableBase from "./base/placeableItemBase.js";

export class ItemAcorn extends PlaceableBase {
    constructor(registryName, rarity) {
        super(registryName, rarity);
        this.placementPreview.sprite = sprites.placeables.sapling;
    }

    // Return true if position isn't occupied and tile below is either dirt or grass
    canBePlaced(x, y, world) {
        if(world.outOfBounds(x, y) || world.tiles.get(x, y)) return false;

        let tile = world.tiles.get(x, y - 1);
        return (Tile.isTile(tile, Tiles.DIRT) || Tile.isTile(tile, Tiles.GRASS));
    }

    getPlacedTile() {
        return Tiles.SAPLING
    }
}