import { canvas, INVENTORY_HEIGHT, INVENTORY_WIDTH } from "../game/global.js";
import { renderPath } from "../helper/canvashelper.js";
import { dropItemFromPlayer } from "../item/dropItem.js";
import Item from "../item/item.js";
import { ItemStack } from "../item/itemStack.js";

const HOTBAR_OFFSET_Y = 24;
const SLOT_SIZE = 64;

// I think inventory needs a full rewrite... 
// Item container needs to be refactored out to be used in storage tiles etc

export class Inventory {
    constructor(player) {
        this.player = player; // Pointer

        // Grid size
        this.w = INVENTORY_WIDTH;
        this.h = INVENTORY_HEIGHT;
        this.fullWidth = this.w * SLOT_SIZE;

        this.topEdge = canvas.height - SLOT_SIZE * this.h - SLOT_SIZE;
        this.leftEdge = canvas.width / 2 - SLOT_SIZE * (this.w / 2);

        this.close();

        // Set up grid
        this.grid = [];
        for(let invX = 0; invX < this.w; invX++) {
            let row = [];
            for(let invY = 0; invY < this.h; invY++) {

                let xPos = this.leftEdge + SLOT_SIZE * invX;
                let yPos = this.topEdge + SLOT_SIZE * invY;
                if(invY !== this.hotbarY) yPos -= HOTBAR_OFFSET_Y;

                let slot = new InventorySlot(xPos, yPos, invX, invY, this.player);
                row.push(slot);
            }
            this.grid.push(row);
        }
    }

    get hotbarY() { return this.h - 1 }

    get _cameraX() { return this._camera.x }
    get _cameraY() { return this._camera.y }

    get _camera() { return this.player.camera }

    getSlot(x, y) {
        if (typeof x == "number" && typeof y == "number" &&
            x >= 0 && x < this.w && y >= 0 && y < this.h) {
                return this.grid[x][y]
            }
        return null;
    }

    getSlotsAsArray() {
        let slotArray = [];
        this.grid.forEach(row => {
            row.forEach(slot => { slotArray.push(slot) })
        });
        return slotArray;
    }

    getRow(y) {
        if(y < 0 || y >= this.h) return [];
        return this.grid.map(column => column[y]);
    }

    getStack(x, y) {
        return this.getSlot(x, y)?.stack ?? null;
    }

    close() {
        if(this.holdingStack) {
            this.addItem(this.holdingStack.item, this.holdingStack.amount);
        }

        this.view = false;
        this.holdingStack = null;
        this.hoveredSlot = { x: null, y: null }
    }

    update(input) {
        this.updateInteraction(input);
        this.updateItemInfo();
    }

    updateItemInfo() {

        // If no slot is hovered, hide item info
        if(this.hoveredSlot.x === null || this.hoveredSlot.y === null) {
            this.player.itemInfoDisplay.set(null);
            return;
        }

        let stack = this.getStack(this.hoveredSlot.x, this.hoveredSlot.y);
        if(stack) {
            this.player.itemInfoDisplay.set(stack.item);
            return;
        }
        
        this.player.itemInfoDisplay.set(null);
    }

    updateInteraction(input) {
        this.hoveredSlot = this.checkHover(input);

        if(!input.mouse.click && !input.mouse.rightClick) return;

        const insertAmount = (
            input.mouse.click ? (this.holdingStack ? this.holdingStack.amount : null) : 
            input.mouse.rightClick ? 1 : null
        );

        const split = (input.mouse.rightClick ? true : false);
        
        if(this.holdingStack) {
            this.insertIntoSlot(this.hoveredSlot, insertAmount);
        } else {
            this.selectSlot(this.hoveredSlot.x, this.hoveredSlot.y, split);
        }

        input.mouse.click = false;
        input.mouse.rightClick = false;
    }

    selectSlot(x, y, split) {
        // No slot hovered
        if(x === null || y === null) return;

        // Get slot position
        let slot = this.getSlot(x, y);
        let stack = slot.stack;
        if(!stack) return;

        this.holdingStack = split ? stack.split() : stack.extract();

        // Delete source stack if empty
        slot.refreshStack();
    }

    /**
     * Try to insert the selected item into a slot
     * @param {object} slot New slot
     * @param {number} insertAmount Amount of items to be inserted into slot
     */
    insertIntoSlot(slot, insertAmount) {

        // If player is holding an item and clicks outside the inventory, drop the item.
        if(slot.x === null || slot.y === null) {
            if(this.holdingStack) {
                dropItemFromPlayer(this.player, this.holdingStack);
                this.holdingStack = null;
            }
            return;
        }

        // Create a reference to the existing stack in the clicked slot
        slot = this.getSlot(slot.x, slot.y);
        let stack = slot.stack;

        if(stack) {
            // If clicked slot contains the same item, fill up the stack as much as possible.
            if(stack.containsItem(this.holdingStack.item)) {
                let remaining = stack.fill(insertAmount);
                this.holdingStack.amount -= (insertAmount - remaining);
            } 
            // If clicked slot has a different item, insert the held stack and pick up the new one.
            else {
                let temp = this.holdingStack;
                this.selectSlot(slot.invX, slot.invY, false);
                slot.stack = temp;
            }
        } else {
            // Insert stack and remove old stack
            let stack = new ItemStack(this.holdingStack.item, insertAmount);
            slot.stack = stack;
            this.holdingStack.amount -= insertAmount;
        }

        // If entire fheld stack has been inserted, delete it
        if(this.holdingStack.amount <= 0) {
            this.holdingStack = null;
        }
    }

    /**
     * Calculate which inventory slot is being hovered,
     */
    checkHover(input) {

        // Get currently hovered inventory grid coordinates
        let invX = Math.floor((input.mouse.x - this.leftEdge) / SLOT_SIZE);
        let invY = Math.floor((input.mouse.y - this.topEdge + HOTBAR_OFFSET_Y) / SLOT_SIZE);

        // Invalid X value
        if(invX < 0 || invX >= this.w) invX = null;

        // Invalid Y value OR in hotbar row
        if(invY < 0 || invY >= this.hotbarY) invY = null;

        // Check if hotbar row is hovered
        if(Math.floor((input.mouse.y - this.topEdge) / SLOT_SIZE) == this.hotbarY) {
            invY = this.hotbarY;
        }

        return { x: invX, y: invY };
    }

    // If a stack with the given item already exists and it isn't full, return its grid position
    findExistingStack(item) {
        for(let invX = 0; invX < this.w; invX++) {
            let invY = this.grid[invX].findIndex(slot => (slot.stack && slot.stack.containsItem(item) && !slot.stack.isFull()));
            if(invY != -1) return { x: invX, y: invY };
        }
        return false;
    }

    // If an empty slot exists, return it.
    findEmptySlot() {
        // Search hotbar first
        let invY = this.hotbarY;
        for(let invX = 0; invX < this.w; invX++) {
            if(!this.getStack(invX, invY)) {
                return { x: invX, y: invY };
            }
        }

        // Search rest of inventory
        for(let invY = 0; invY < this.hotbarY; invY++) {
            for(let invX = 0; invX < this.w; invX++) {
                if(!this.getStack(invX, invY)) {
                    return { x: invX, y: invY };
                }
            }
        }
        return false;
    }

    /**
     * Search inventory for a certain item and returns the total amount
     * @param {Item} item The item to be searched for
     */
    getItemAmount(item) {
        if(!Item.isItem(item)) return;
        let amount = 0;
        this.grid.forEach(row => {
            amount = row.reduce((a, slot) => (a + (slot.stack?.containsItem(item) ? slot.stack.amount : 0)), amount);
        })
        return amount;
    }

    /**
     * Try to add an item into the inventory
     * @param {Item} item 
     * @param {number} amount 
     * @returns 
     */
    addItem(item, amount = 1) {
        if(!Item.isItem(item) || typeof amount != "number") return;
        
        let startAmount = amount;

        // Fill existing stacks first
        while(amount > 0) {
            let slot = this.findExistingStack(item);
            if(!slot) break;
            amount = this.getStack(slot.x, slot.y).fill(amount);
        }

        // If no existing stacks remain, start adding to empty slots
        while(amount > 0) {

            let emptySlot = this.findEmptySlot();

            // If inventory is full, return the amount of items left.
            if(!emptySlot) {
                if(startAmount - amount != 0) {
                    this.player.onItemPickup(item, startAmount - amount);
                }
                return amount;
            }

            let x = emptySlot.x; 
            let y = emptySlot.y;

            // Creates new item stack
            // (If the item entity picked up still has items left after this, they will be deleted)
            // (Unless Tile entities of the same type combine with eachother in the future, this won't be a problem) (IT ENDED UP BEING A PROBLEM)
            if(item.stackLimit < amount) {
                this.getSlot(x, y).stack = new ItemStack(item, item.stackLimit);
                amount -= item.stackLimit;
            } else {
                this.getSlot(x, y).stack = new ItemStack(item, amount);
                amount = 0;
            }

            let selected = this.player.selectedSlot;
            if(x === selected.invX && y === selected.invY) {
                this.player.onItemSelectionChanged();
            }
        }

        this.player.onItemPickup(item, startAmount);
        return 0;
    }

    /**
     * Remove a certain amount of a specific item from the inventory.
     * Searches through all slots.
     * @param {Item} item Item type to remove
     * @param {number} amount Amount of items to remove
     * @returns True if the full amount of items could be deleted. False if inventory didn't contain enough.
     */
    removeItem(item, amount) {
        if(!Item.isItem(item) || typeof amount != "number") return false;

        for(let invY = this.hotbarY; invY >= 0; invY--) {
            for(let invX = this.w - 1; invX >= 0; invX--) {

                // Loop through inventory until a slot is found that has the given item
                let slot = this.getSlot(invX, invY);
                if(!slot.stack?.containsItem(item)) continue;

                // Delete the given amount from the stack
                amount = slot.stack.remove(amount);

                slot.refreshStack();

                // If there are still items to remove after the stack is empty, we continue looking for the stack
                if(amount == 0) return true;
            }
        }

        return false;
    }

    //#region Rendering

    render(ctx) {

        Object.assign(ctx, { 
            strokeStyle: "rgba(0,0,0,0.5)", fillStyle: "rgba(0,0,0,0.25)", lineWidth: 3
        });

        // todo refactor inventory positions to be dynamic
        let bgX = this._camera.x + this.leftEdge;
        let bgY = this._camera.y + this.topEdge + SLOT_SIZE * 3; 
        this.#renderBackground(ctx, bgX, bgY, this.w, 1);

        // If inventory view is enabled, render rest of the inventory.
        if(this.view) {
            // Render inventory boxes
            bgY = this._cameraY + this.topEdge - 24;
            this.#renderBackground(ctx, bgX, bgY, this.w, this.hotbarY);
        }

        this.#renderSlots(ctx);
    }

    #renderBackground(ctx, xPos, yPos, slotsPerRow, rowCount) {
        
        const padding = 3;

        ctx.beginPath();

        let width = slotsPerRow * SLOT_SIZE + (padding * 2);
        let height = SLOT_SIZE * rowCount + (padding * 2);
        //let x = this._camera.centerX - (width / 2);

        ctx.rect(
            xPos - padding, yPos - padding, width, height
        );
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    #renderSlots(ctx) {
        let visibleSlots = this.view ? this.getSlotsAsArray() : this.getRow(this.hotbarY);
        visibleSlots.forEach(slot => {
            slot.render(ctx);
        })
    }

    #renderHoldingStack(ctx, input) {
        let mx = input.mouse.mapX;
        let my = -input.mouse.mapY;
        this.holdingStack.render(ctx, mx, my);
    }

    renderItems(ctx, input) {

        let visibleSlots = this.view ? this.getSlotsAsArray() : this.getRow(this.hotbarY);
        visibleSlots.forEach(slot => slot.renderItem(ctx));

        if(this.holdingStack) {
            this.#renderHoldingStack(ctx, input);
        }

        let hovered = this.getSlot(this.hoveredSlot.x, this.hoveredSlot.y);
        hovered?.renderHoverEffect(ctx);
    }

    //#endregion
}

class InventorySlot {
    constructor(x, y, invX, invY, player) {
        this.player = player; // Pointer
        this.stack = null;

        this.invX = invX,
        this.invY = invY,

        this.x = x;
        this.y = y;
    }

    get _cameraX() { return this.player.camera.x }
    get _cameraY() { return this.player.camera.y }

    get xPos() { return this.x + this._cameraX }
    get yPos() { return this.y + this._cameraY }

    get w() { return SLOT_SIZE }
    get h() { return SLOT_SIZE }

    refreshStack() {
        if(this.stack && this.stack.isEmpty()) {
            this.stack = null;
        }
    }

    isHovered() {
        return (
            this.player.inventory.hoveredSlot.x == this.invX && 
            this.player.inventory.hoveredSlot.y == this.invY
        );
    }

    //#region Rendering methods

    render(ctx) {
        Object.assign(ctx, { 
            strokeStyle: "rgb(200,200,200)", lineWidth:3 
        });

        ctx.beginPath();
        ctx.rect(this.xPos, this.yPos, this.w, this.h);
        ctx.stroke();
        ctx.closePath();
    }

    renderItem(ctx) {
        this.stack?.render(ctx, this.xPos + 16, this.yPos + 16);
    }

    renderHoverEffect(ctx) {
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(this.xPos, this.yPos, this.w, this.h)
    }

    renderSelection(ctx) {
        Object.assign(ctx, { 
            strokeStyle: "white", lineWidth: 5
        });

        renderPath(ctx, () => {
            ctx.rect(this.xPos, this.yPos, this.w, this.h);
            ctx.stroke();
        });
    }

    //#endregion
}