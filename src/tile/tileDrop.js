import { rng } from "../helper/helper.js";
import Item from "../item/item.js";
import { ItemStack } from "../item/itemStack.js";
import { Tile } from "./Tile.js";

// This should be converted into a general drop class later, so that it for example could be used for entity drops.
export class TileDrop {
    /**
     * @param {Item} item Dropped item
     * @param {number} amount How many items should drop
     * @param {number} maxAmount Leave blank for static amount
     */
    constructor(item, amount = 1, maxAmount = null) {
        this._item = item;

        if(typeof amount != "number") amount = 1;
        this._amount = maxAmount ? [amount, maxAmount] : amount;
        this._chance = 100;
        this._increasable = false;
        this._requiresTool = false;
    }

    requireTool() {
        this._requiresTool = true;
        return this;
    }

    chance(percent) {
        this._chance = percent;
        return this;
    }

    affectedByMultipliers() {
        this._increasable = true;
        return this;
    }

    /**
     * @param {Tile} tile 
     * @param {Item} item 
     * @param {number} [multiplier] UNUSED!! May be used in the future get better drops in some situations (Default: 1)
     * @returns {(ItemStack|null)}
     */
    roll(tile, item, multiplier) {

        // !! Currently doesn't support gathering multipliers
        multiplier ??= 1;

        if (this._requiresTool && !tile.isMineableBy(item)) return null;

        let dropRNG = rng(1, 100);
        if(dropRNG * multiplier > this._chance) return null;

        let dropAmount;
        if(Array.isArray(this._amount)) {
            dropAmount = rng(this._amount[0], this._amount[1]);
        } else {
            dropAmount = this._amount;
        }

        if(typeof dropAmount != "number" || isNaN(dropAmount)) dropAmount = 1;

        return new ItemStack(this._item, dropAmount);
    }
}