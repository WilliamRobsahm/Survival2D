import { sprites } from "../../game/graphics/loadAssets.js";
import HammerBase from "./base/hammerItemBase.js";

export class ItemDevHammer extends HammerBase {
    constructor(game) {
        super(game);
        this.setRegistryName("dev_hammer");
        this.setRarity(99);

        this.miningLevel = 999;
        this.miningSpeed = 5;
        this.reach = 10;

        this.setSprite(sprites.items.dev_hammer);
    }
}