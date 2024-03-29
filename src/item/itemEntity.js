import { EntityComponent } from "../components/EntityComponent.js";
import { ItemContainer } from "../container/ItemContainer.js";
import { GRAVITY } from "../game/global.js";
import { getPhysicsMultiplier, rng } from "../helper/helper.js";

const VECTOR_RANGE = 20;

export class ItemEntity {
    constructor(x, y, stack) {
        this.stack = stack;

        let size = stack.item.entitySize;
        this._entity = new EntityComponent(x - size / 2, y - size / 2, size);

        this._entity.topCollision = (tile) => {
            this.y = tile.y - this.height;

            if(this.dy > 0) 
                this.#bounce();
            if(this.dy == 0) 
                this.grounded = true;
        }
    }

    //#region Property getters/setters

    get item() { return this.stack.item }
    get amount() { return this.stack.amount }
    set amount(val) { if(typeof val == "number") this.stack.amount = val }

    //#endregion

    //#region EntityComponent wrappers

    get x() { return this._entity.x }
    set x(value) { this._entity.x = value }

    get x2() { return this._entity.x2 }
    set x2(value) { this._entity.x2 = value }

    get y() { return this._entity.y }
    set y(value) { this._entity.y = value }

    get y2() { return this._entity.y2 }
    set y2(value) { this._entity.y2 = value }

    get centerX() { return this._entity.centerX }
    set centerX(value) { this._entity.centerX = value }

    get centerY() { return this._entity.centerY }
    set centerY(value) { this._entity.centerY = value }

    get gridX() { return this._entity.gridX }
    get gridY() { return this._entity.gridY }

    get width() { return this._entity.width }
    set width(value) { this._entity.width = value }

    get height() { return this._entity.height }  
    set height(value ) { this._entity.height = value }

    get dx() { return this._entity.dx }
    set dx(value) { this._entity.dx = value }

    get dy() { return this._entity.dy }
    set dy(value) { this._entity.dy = value }

    get vector() { return this._entity.vector }
    set vector(value) { this._entity.vector = value }

    //#endregion

    //#region Methods

    update(deltaTime, world) {
        let m = getPhysicsMultiplier(deltaTime);
        
        this.inLiquid = false;
        this.grounded = false;

        this.dy += (GRAVITY * 0.6 * m);
        this.dx *= 1 - (0.05 * m);

        this._entity.updateCollision(world);
        this._entity.move(this.vector, deltaTime);
    }

    /**
     * Try to add item stack to a container (such as a player inventory)
     * The item amount of this entity will be updated to match the remainder after trying to insert.
     * This will usually be 0, unless the container becomes full.
     * @param {ItemContainer} container 
     * @returns {boolean} True if all items were successfully inserted
     */
    addToContainer(container) {
        let remaining = container.addItem(this.item, this.amount);
        this.stack.amount = remaining;
        return (this.stack.amount === 0);
    }

    #bounce() {
        if(this.dy < 1) {
            this.grounded = true;
            this.vector = { dx: 0, dy: 0 };
        }
        this.dy = -this.dy * 0.5;
    }

    //#endregion

    //#region Static methods

    static generateVector() {
        let dx = rng(-VECTOR_RANGE, VECTOR_RANGE) / 10;
        let dy = rng(-VECTOR_RANGE, 0) / 10;
        return { dx: dx, dy: dy }
    }

    //#endregion

    //#region Rendering methods

    render(ctx, input) {
        this.item.render(ctx, this.x, this.y, this.width, this.height);

        if(input.mouse.on(this)) {
            this.#renderLabel(ctx, input);
        }
    }

    #renderLabel(ctx, input) {
        // Todo this should probably be refactored out of this class
        Object.assign(ctx, { font: "20px Font1", fillStyle: "rgba(0,0,0,0.5)", textAlign: "left" });
        let padding = 20;
        let txt = `${this.item.displayName} (${this.amount})`;
        let boxWidth = ctx.measureText(txt).width + padding * 2;
        ctx.fillRect(input.mouse.mapX, -input.mouse.mapY - 28, boxWidth, 28);
        ctx.fillStyle = "white";
        ctx.fillText(txt, input.mouse.mapX + padding, -input.mouse.mapY - 8);
    }

    //#endregion
}