import { sprites } from "../../game/graphics/loadAssets.js";
import AxeBase from "./base/axeItemBase.js";

export class ItemDevAxe extends AxeBase {
    constructor(game) {
        super(game);
        this.setRegistryName("dev_axe");
        this.setRarity(99);

        this.miningLevel = 999;
        this.miningSpeed = 5;
        this.reach = 10;

        this.setSprite(sprites.items.dev_axe);
    }
}