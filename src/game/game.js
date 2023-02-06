import ItemEntityHandler from "../item/itemEntityHandler.js";
import ItemRegistry from "../item/itemRegistry.js";
import TileRegistry from "../tile/tileRegistry.js";
import { Player } from "../player/player.js";
import RecipeManager from "../player/recipe.js";
import { World } from "../world/world.js";
import FPSCounter from "./graphics/FPScounter.js";
import { InputHandler } from "./input.js";


export class Game {
    constructor() {
        this.world = new World(this,127,127);
        
        this.itemRegistry = new ItemRegistry(this);
        this.tileRegistry = new TileRegistry(this);

        this.world.generate();

        this.recipeManager = new RecipeManager(this);
        this.itemEntities = new ItemEntityHandler(this);
        this.player = new Player(this);
        this.input = new InputHandler(this);
        this.fpsCounter = new FPSCounter(this);
    }

    update() {
        document.body.style.cursor = "default";
        this.world.tickCounter();
        this.fpsCounter.increment();
        this.player.update(this.input);
        this.player.craftingMenu.ui.update();
        this.itemEntities.update();
    }
}