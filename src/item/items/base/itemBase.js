import { sprites } from "../../../graphics/assets.js";
import Item from "../../../item/item.js";

export class ItemBase extends Item {
    constructor(registryName, rarity) {
        super(registryName, rarity);

        this.miningLevel;
        this.miningSpeed;

        this.setSprite(sprites.items[this.registryName]);

        this.entitySize = 32;
        this.placeable = false;
        this.stackLimit = 99;
    }
}