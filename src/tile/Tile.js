import GameObject from "../class/GameObject.js";
import { TILE_SIZE } from "../game/global.js";
import { InputHandler } from "../game/InputHandler.js";
import Item from "../item/item.js";
import { ItemEntity } from "../item/itemEntity.js";
import { World } from "../world/World.js";
import { TileModel } from "./tileModel.js";
import { Tileset } from "./Tileset.js";

export class Tile extends GameObject {
    #spriteVariant
    #adjacency

    /**
     * @param {World} world 
     * @param {number} gridX X position in world
     * @param {number} gridY Y position in world
     * @param {TileModel} model 
     */
    constructor(world, gridX, gridY, model) {
        super(world.game, gridX * TILE_SIZE, -gridY * TILE_SIZE)
        this.world = world;

        if(!model instanceof TileModel) {
            throw new TypeError("Invalid TileModel!");
        }
        this.model = model;

        this.sheetX = 0;
        this.sheetY = 0;
        this.#spriteVariant;
        this.#adjacency;
    }

    //#region Enums

    static types = {
        NONE: 0, // (No tile should ever actually have this)
        SOLID: 1,
        NON_SOLID: 2,
        WALL: 3,
        PLATFORM: 4,
    }

    static connectTo = {
        NONE: 0,
        SELF: 1,
        ALL: 2,
    }

    //#endregion

    //#region Property getters/setters
    
    /** 
     * @override
     * @returns {number}
     */
    get height() { return this.model.height ?? 0 }

    /** 
     * @override
     * @returns {number}
     */
    get width() { return this.model.width ?? 0 }

    /** @returns {string} */
    get registryName() { return this.model.registryName ?? "" }

    /** @returns {string} */
    get displayName() { return this.model.displayName ?? "" }

    /** @returns {boolean} */
    get requiresTool() { return this.model.requiredTool ?? false }

    /** @returns {number} */
    get miningTime() { return this.model.miningTime ?? 0 }

    /** @returns {number} from Tile.toolTypes enum */
    get toolType() { return this.model.toolType ?? null }

    /** @returns {number} from Tille.types enum */
    get type() { return this.model.type ?? Tile.types.NONE }

    /** @returns {boolean} */
    get transparent() { return this.model.transparent ?? false }

    /** @returns {number} from Tile.connectTo enum */
    get connectivity() { return this.model.connectivity ?? Tile.connectTo.NONE }

    /** @returns {string} */
    get spriteVariantName() {
        let index = Object.values(Tileset.variants).indexOf(this.#spriteVariant);
        return index != null ? Object.keys(Tileset.variants)[index] : "";
    }

    //#endregion

    //#region Public methods

    /**
     * Runs whenever the tile is "refreshed", i.e. something happens to an adjacent tile.
     */
    tileUpdate() {
        this.model.tileUpdate(this, this.world);
    }

    /**
     * Runs at a regular interval (not every frame)
     */
    tickUpdate() {
        this.model.tickUpdate(this, this.world);
    }

    /**
     * @param {(Item | null)} item Held item
     * @param {World}
     * @returns {boolean}
     */
    canBeMined(item, world) {
        return this.model ? this.model.canBeMined(item, world) : false;
    }

    /**
     * @param {(Item | null)} item Held item
     */
    break(item) {
        const dropped = this.model.getDroppedItems(item);

        const entities = dropped.map(stack => {
            const entity = new ItemEntity(this.centerX, this.centerY, stack);
            entity.vector = ItemEntity.generateVector();
            return entity;
        });

        this.world.itemEntities.add(entities);
        
        this.model.removeFromWorld(this);
    }

    /**
     * @param {(Item | null)} item
     * @returns {boolean}
     */
    isMineableBy(item) {
        let noToolType = (this.toolType === null || this.toolType === Item.toolTypes.NONE);
        let isCorrectToolType = (Item.isTool(item, this.toolType));
        let sufficientToolLevel = (item.miningLevel >= this.model.toolLevel);

        return noToolType || (isCorrectToolType && sufficientToolLevel);
    }

    updateSpritePosition() {
        this.#adjacency = this.#getAdjacent(this.connectivity);
        this.#spriteVariant = Tileset.getVariant(this.#adjacency);
        let position = Tileset.getSpritesheetPosition(this.#spriteVariant, this.model.tilesetTemplate);
        
        this.sheetX = position?.x;
        this.sheetY = position?.y;
    }

    #getAdjacent(connectivity) {

        var connectsToAll = (x, y, grid) => {
            let object = grid.get(x, y);
            return (object && object.connectivity === Tile.connectTo.ALL);
        }

        var connectsToSelf = (x, y, grid) => {
            let object = grid.get(x, y);
            return (object && object.connectivity === Tile.connectTo.SELF && 
                object.registryName === this.registryName);
        }

        var notConnective = () => false;

        var checkSurrounding = (checkFn, grid) => {
            return {
                top: checkFn(this.gridX, this.gridY + 1, grid),
                left: checkFn(this.gridX - 1, this.gridY, grid),
                right: checkFn(this.gridX + 1, this.gridY, grid),
                bottom: checkFn(this.gridX, this.gridY - 1, grid),
                top_left: checkFn(this.gridX -1, this.gridY + 1, grid),
                top_right: checkFn(this.gridX + 1, this.gridY + 1, grid),
                bottom_left: checkFn(this.gridX - 1, this.gridY - 1, grid),
                bottom_right: checkFn(this.gridX + 1, this.gridY - 1, grid),
            };
        }

        let grid = (this.type === Tile.types.WALL ? this.world.walls : this.world.tiles);

        switch(connectivity) {
            case Tile.connectTo.NONE:
                return checkSurrounding(notConnective);
            case Tile.connectTo.ALL:
                return checkSurrounding(connectsToAll, grid);
            case Tile.connectTo.SELF:
                return checkSurrounding(connectsToSelf, grid);
        }
        throw new TypeError("'connectivity' must be a value from the Tile.connectTo enum");
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        this.model.render(ctx, this, this.sheetX, this.sheetY);
    }

    //#endregion

    //#region Static methods

    /** 
     * Returns true if 'arg' is a Tile.
     * If parameter 'tile' is provided, only returns true if 'arg' is the same type as 'tile'
     * @param {(Tile|any)}arg
     * @param {Tile|TileModel} [tile] (Optional) Check if 'arg' is the same tile as this
    */
    static isTile(arg, tile = null) {
        if(arg instanceof Tile) {
            if(tile instanceof Tile || tile instanceof TileModel)
                return (arg.registryName === tile.registryName)
            
            else return true;
        }
        return false;
    }

    /**
     * @param {Tile} tile
     * @param {InputHandler} input
     */
    static isHoveringTile(tile, input) {
        return (tile.gridX === input.mouse.gridX && tile.gridY === input.mouse.gridY);
    }

    //#endregion
}