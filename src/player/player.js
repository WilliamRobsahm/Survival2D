
// FIXED IMPORTS:
import { ctx, canvas, TILE_SIZE } from '../game/global.js';
import { Inventory } from './inventory.js';
import { MiningEvent } from './mining.js';
import { calculateDistance, clamp, gridXfromCoordinate, gridYfromCoordinate } from '../misc/util.js';
import { HEIGHTMAP } from '../world/world.js';
import { overlap, surfaceCollision } from '../game/collision.js';
import { PlayerStatBar } from './statBar.js';
import { checkToolInteraction } from '../tile/toolInteraction.js';
import HotbarText from './hotbarText.js';
import { PickupLabelHandler } from './pickupLabels.js';
import { validPlacementPosition } from './placementPreview.js';
import { Camera } from '../game/camera.js';
import ItemInfoDisplay from './itemInfo.js';
import { PlayerFalling, PlayerJumping, PlayerRunning, PlayerStanding, PlayerSwimming, stateEnum } from './playerStates.js';
import { sprites } from '../game/graphics/loadAssets.js';

class Player {
    constructor(game) {
        this.game = game;
        this.w = 36;
        this.h = 72;

        this.stateList = [new PlayerStanding(this), new PlayerRunning(this), new PlayerJumping(this),
            new PlayerFalling(this), new PlayerSwimming(this)];
        
        this.x;
        this.y;
        this.centerX;
        this.centerY;
        this.facing = "right";
        
        this.dx = 0;
        this.dy = 0;
        this.maxSpeed = 5;
        this.maxFallSpeed = 12;
        this.grounded = false;
        this.gravity = 0.35;
        this.acceleration = 0.5;

        this.inLiquid = false;
        
        this.jumpFrames = false;

        this.health = new PlayerStatBar(50,45);
        this.hunger = new PlayerStatBar(50,20);
        this.thirst = new PlayerStatBar(50,20);

        this.pickupLabels = new PickupLabelHandler(this);
        this.hotbarText = new HotbarText(this);
        this.itemInfoDisplay = new ItemInfoDisplay(this);
        this.camera = new Camera(this);

        this.miningEvent = null;
        
        this.defaultReach = 3;
        this.reach = 3 * TILE_SIZE;

        this.heldItem = null;

        this.cheetahFrames = 0;

        this.spriteSheet = sprites.entities.player;
        this.frameX = 0;
        this.frameY = 0;
        this.frameDelay;
        this.frameAmount;
        this.frameWidth = 96;
        this.frameCounter = 0;

    }

    setState(state) {
        this.frameCounter = 0;
        this.state = this.stateList[stateEnum[state]];
        this.state.enter();
    }

    addDevKit() {
        this.inventory.addItem(this.game.itemRegistry.get("dev_pickaxe"),1);
        this.inventory.addItem(this.game.itemRegistry.get("dev_axe"),1);
        this.inventory.addItem(this.game.itemRegistry.get("dev_hammer"),1);
        this.inventory.addItem(this.game.itemRegistry.get("dev_shovel"),1);
    }

    update(input) {
        this.inLiquid = false;
        this.grounded = false;

        // Handle input
        if(input.keys.includes("X")) {
            this.addDevKit();
            input.keys.splice(input.keys.indexOf("X"),1);
        }

        let left = input.keys.includes("A");
        let right = input.keys.includes("D");

        if(left) {this.facing = "left"}
        if(right) {this.facing = "right"}

        this.getHorizontalMovement(left,right);
        this.checkCollision();
        this.pickupLabels.update();

        this.state.handleInput(this.game.input);
        this.state.update(this.game.input);

        if(this.placeDelay > 0) {
            this.placeDelay -= 1;
        }
            
        // Tile interaction
        if(input.mouse.click && !this.inventory.view) {

            if(this.heldItem && this.heldItem.placeable) {
                this.placeTile(this.heldItem,input.mouse.gridX,input.mouse.gridY);
            } else {
                this.updateMining(input);
            }
        } else {
            this.miningEvent = null;
        }

        this.updatePosition(input);
        this.updateInventory(input);

        // Old water physics
        /*
        // Gravity in water
        if(this.inLiquid) {
            this.dy += GRAVITY/3;
            this.dy = clamp(this.dy,-4,4);
        } 

        if(jump && this.inLiquid) {
            this.dy -= 0.2;
        }
        */
    }

    updateInventory(input) {
        // Open and Close inventory
        if(input.keys.includes("E")) {
            if(this.inventory.view) {
                this.inventory.close();
            } else {
                this.inventory.view = true;
            }
            input.keys.splice(input.keys.indexOf("E"),1);
        }

        // Select inventory slot
        for(let i=1;i<=6;i++) {
            if(input.keys.includes(i.toString())) {
                this.miningEvent = null;
                this.selectItem(i);
                input.keys.splice(input.keys.indexOf(i.toString()),1);
            }
        }

        if(this.inventory.view) {
            this.inventory.update(input);
        }
    }

    updateMining(input) {

        // Check if the tool can interact with the tile
        let obj = checkToolInteraction(input.mouse.gridX,input.mouse.gridY,this.heldItem,this.game.world);

        if(!obj) {
            this.miningEvent = null;
            return;
        }

        // If not currently mining the block, create a new Mining event
        if(!this.miningEvent) {
            this.miningEvent = new MiningEvent(obj,this.heldItem,this.game);
        }

        // If not in range of the block, cancel Mining event
        if(calculateDistance(this,this.miningEvent.tile) > this.reach) {
            this.miningEvent = null;
            return;
        }

        // If mouse has moved outside the previous block being mined, create new Event
        if(this.miningEvent.tile.gridX != input.mouse.gridX || 
            this.miningEvent.tile.gridY != input.mouse.gridY) {
                this.miningEvent = new MiningEvent(obj,this.heldItem,this.game);
        }

        // Increase mining progress.
        this.miningEvent.increaseProgress();

        if(this.miningEvent.finished) {
            this.game.world.lighting.update(this);
            this.miningEvent = null;
        }
    }
        

    getHorizontalMovement(walkLeft,walkRight) {
        // If player is holding A, accelerate left.
        if(walkLeft) {
            this.dx -= this.acceleration;
        }
        // If player is holding D, accelerate right.
        else if(walkRight) {
            this.dx += this.acceleration;
        }

        // If player is not moving left but has left momentum, slow down.
        if(!walkLeft && this.dx < 0) {
            this.dx += 0.8;
            if(this.dx > 0) {
                this.dx = 0;
            }
        } 

        // If player is not moving right but has right momentum, slow down.
        if(!walkRight && this.dx > 0) {
            this.dx -= 0.8;
            if(this.dx < 0) {
                this.dx = 0;
            }
        }

        // Limit speed to max running speed
        
        this.dx = clamp(this.dx,-this.maxSpeed,this.maxSpeed);
    }

    // Move player and camera by dx and dy
    updatePosition(input) {
        this.x += Math.round(this.dx);
        this.y += Math.round(this.dy);
        this.camera.x += Math.round(this.dx);
        this.camera.y += Math.round(this.dy);
        this.centerX = this.x + this.w/2;
        this.centerY = this.y + this.w/2;
        this.gridX = gridXfromCoordinate(this.centerX);
        this.gridY = gridYfromCoordinate(this.centerY);
        input.mouse.updateGridPos();
    }

    checkCollision() {
        // Left wall
        if(this.x + this.dx < 0) {
            let distance = this.x;
            this.dx = 0;
            this.x = 0;
            this.camera.x -= distance;
        }

        // Right wall
        let rightEdge = this.game.world.width * TILE_SIZE;
        if(this.x + this.w + this.dx > rightEdge) {
            let distance = this.x + this.w - rightEdge;
            this.dx = 0;
            this.x = rightEdge - this.w;
            this.camera.x -= distance;
        }

        // Only check collision of blocks within a 2 block radius
        // This is a *very* major optimization!
        for(let x=this.gridX - 2;x<this.gridX + 2;x++) {
            for(let y=this.gridY - 2;y<this.gridY + 2;y++) {
                if(this.game.world.outOfBounds(x,y)) {
                    continue;
                }

                let tile = this.game.world.tileGrid[x][y];
                if(!tile) {
                    continue;
                }

                if(tile.objectType == "solid") {
                    if(surfaceCollision("top",this,tile)) {
                        this.grounded = true;
                        let distance = this.y + this.h - tile.y;
                        this.dy = 0;
                        this.y = tile.y - this.h;
                        this.camera.y -= distance;
                    }

                    if(surfaceCollision("bottom",this,tile)) {
                        let distance = this.y - (tile.y + tile.h);
                        this.dy = 0;
                        this.y = tile.y + tile.h;
                        this.camera.y -= distance;
                        this.jumpFrames = false;
                    }

                    if(surfaceCollision("left",this,tile)) {
                        let distance = this.x + this.w - tile.x;
                        this.dx = 0;
                        this.x = tile.x - this.w;
                        this.camera.x -= distance;
                    }

                    if(surfaceCollision("right",this,tile)) {
                        let distance = this.x - (tile.x + tile.w);
                        this.dx = 0;
                        this.x = tile.x + tile.w;
                        this.camera.x -= distance;
                    }
                }

                if(tile.objectType == "liquid") {
                    if(overlap(this,tile)) {
                        this.inLiquid = true;
                    }
                }
            }
        }
    }

    selectItem(slot) {
        this.inventory.selectedHotbarSlot = slot;
        let selected = this.inventory.getSelectedSlot();
        if(selected.stack) {
            this.hotbarText.set(selected.stack.item.displayName);

            if(selected.stack.item.reach) {
                this.reach = selected.stack.item.reach * TILE_SIZE;
            } else {
                this.reach = this.reach;
            }
            this.heldItem = selected.stack.item;
            this.miningEvent = null;
        } else {
            this.heldItem = null;
            this.reach = this.reach;
        }
    }

    drawPlacementPreview(input) {
        // Held item must have a placement preview
        if(!this.heldItem) {
            return;
        }
        
        if(!this.heldItem.placementPreview) {
            return;
        }

        // Will not draw a preview on top of already existing tile
        if(this.game.world.getTile(input.mouse.gridX,input.mouse.gridY)) {
            return;
        }

        this.heldItem.placementPreview.draw(input.mouse.gridX,input.mouse.gridY);
    }

    updateAnimationFrame() {

        this.frameCounter += 1;

        if(this.frameCounter < this.frameDelay) {
            return;
        }
        
        this.frameCounter = 0;
        if(this.frameX < this.frameAmount - 1) {
            this.frameX++;
        } else {
            if(this.frameLoop) {
                this.frameX = 0;
            }
        }
    }

    draw() {
        this.updateAnimationFrame();

        let frameSize = 96;
        let x = this.x - (frameSize - this.w) / 2;
        let y = this.y + this.h - frameSize;
        ctx.drawImage(this.spriteSheet, frameSize * this.frameX, frameSize * this.frameY, frameSize, frameSize,
            x, y, frameSize, frameSize);
    }

    placeTile(item,x,y) {

        // Placement delay
        if(this.placeDelay > 0) {
            return;
        }

        // Check if item is placeable
        if(!item || !item.placeable) {
            return;
        }

        // Must be a valid placement position
        if(!validPlacementPosition(x,y,this.game.world)) {
            return;
        }
    
        // X and Y must be within grid
        if(isNaN(x) || isNaN(y) || this.game.world.outOfBounds(x,y)) {
            return;
        }

        let tile = item.place(x,y);

        if(!tile || this.game.world.getTile(x,y)) {
            return;
        }

        if(calculateDistance(this,tile) > this.reach) {
            return;
        } 

        if(overlap(this,tile)) {
            return;
        }

        this.game.world.setTile(x,y,tile);
        
        // Decrease amount in stack by 1
        let heldStack = this.inventory.getSelectedSlot().stack;
        heldStack.subtractAmount(1);

        // Remove stack if amount reaches 0
        if(heldStack.amount == 0) {
            this.inventory.getSelectedSlot().stack = null;
            this.heldItem = null;
        }

        this.placeDelay = 15;

        this.game.world.updateNearbyTiles(x,y);
        this.game.world.lighting.update(this);
    }

    // Put the player in the center of the map
    spawn() {
        this.x = Math.round(this.game.world.width / 2 * TILE_SIZE - this.w / 2);
        this.y = Math.round((-HEIGHTMAP[63] - 2) * TILE_SIZE);
        this.camera.x = Math.round(this.x - canvas.width / 2 + this.w / 2);
        this.camera.y = Math.round(this.y - canvas.height / 2 + this.h / 2);
        this.centerX = this.x + this.w/2;
        this.centerY = this.y + this.w/2;
        this.gridX = gridXfromCoordinate(this.centerX);
        this.gridY = gridYfromCoordinate(this.centerY);
        this.inventory = new Inventory(this);
        this.setState("FALLING");
    }
}
export { Player }