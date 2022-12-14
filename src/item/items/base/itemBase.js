import Item from "../../../item/item.js";

export default class ItemBase extends Item {
    constructor(game) {
        super(game);
        this.itemType = 'default';
        this.toolType = 'axe';
        this.miningLevel;
        this.miningSpeed;

        this.entitySize = 32;
        this.placeable = false;
        this.stackLimit = 99;
    }
}