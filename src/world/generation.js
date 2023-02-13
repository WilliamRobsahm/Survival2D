import * as structures from '../structure/structureParent.js';
import { BASE_TERRAIN_HEIGHT, WORLD_WIDTH } from "../game/global.js";
import { rng, rollMax } from "../misc/util.js";
import { HEIGHTMAP } from "./world.js";
import Noise from './noise.js';
import { TileInstance } from '../tile/tileInstance.js';

export class WorldGeneration {
    constructor(world) {
        this.world = world;

        for(let x=0;x<this.world.width;x++) {
            this.world.tileGrid.push([]);
            this.world.wallGrid.push([]);
        }
    }

    generate() {
        this.terrainNoise = new Noise(0,100,this.world);
        this.terrainNoise.blur(3);
        this.dirtMap = this.generateDirtDepth(2,5);
        this.threshold = 53;

        // Place tiles based on noise
        for(let x=0;x<this.world.width;x++) {
            for(let y=0;y<this.world.height;y++) {
                this.world.tileGrid[x].push(this.getTerrainTile(x,y,this.terrainNoise.get(x,y)));
                this.world.wallGrid[x].push(this.getTerrainWall(x,y));
            }
        }

        this.generateVegetation();
    }

    getTerrainTile(x,y,noiseValue) {
        // No blocks or walls are generated above surface height
        if(y > HEIGHTMAP[x] || noiseValue >= this.threshold) {
            return null;
        }

        let tileName = "";

        // Grass
        if(HEIGHTMAP[x] == y) {
            tileName = "grass";
        } 
        
        // Dirt
        else if(HEIGHTMAP[x] - this.dirtMap[x] < y) {
            tileName = "dirt";
        } 
        
        // Stone
        else {
            tileName = "stone";
        }

        let tile = new TileInstance(this.world, x, y, tileName);
        return tile.model ? tile : null;
    }

    getTerrainWall(x,y) {
        // No wall
        if(y > HEIGHTMAP[x]) {
            return null;
        }

        let tileName = "";

        // Dirt walls
        if(HEIGHTMAP[x] - this.dirtMap[x] <= y) {
            tileName = "dirt_wall";
        } 
        
        // Stone walls
        else {
            tileName = "stone_wall";
        }

        let tile = new TileInstance(this.world, x, y, tileName);
        return tile.model ? tile : null;
    }

    /**
     * Return an array of randomized dirth depths, as long as the world is wide.
     * @param {number} minDepth Minimum dirt depth
     * @param {number} maxDepth Maximum dirt depth
     * @returns {Array} 
     */
    generateDirtDepth(minDepth,maxDepth) {
        let dirtDepth = [];
        for(let i=0;i<this.world.width;i++) {
            dirtDepth.push(rng(minDepth,maxDepth));
        }
        return dirtDepth;
    }

    generateVegetation() {
        let lastTree = -1;
        let treeGap = 2;

        // 1 in X chance of generating these on each grass tile
        let treeValue = 10;
        let clothValue = 16;

        for(let x = 0; x < this.world.width; x++) {
            let y = HEIGHTMAP[x];
            let tile = this.world.getTile(x,y);
            if(!tile || tile.getRegistryName() != "grass") {
                continue;
            }

            if(rollMax(treeValue) && (x - lastTree) > treeGap) {
                this.world.structures.push(new structures.BasicTree(x,y+1,this.world));
                lastTree = x;
                continue;
            }

            if(rollMax(clothValue)) {
                this.world.setTile(x, y+1, "cloth_plant");
            }
        }
    }
}


export function generateTerrainHeight() {
    let heightMap = [];
    heightMap.push(BASE_TERRAIN_HEIGHT + 6);

    for(let x=0 ; x<WORLD_WIDTH ; x++) {
        let pHeight = heightMap[x];

        let rand = rng(1,100);

        //let highThreshold = [5,10,20,40,16,7,2];

        // Down 3: 1%; Down 2: 5%, Down 1: 19%, Equal: 50%, Up 1: 19%, Up 2: 5%, Up 3: 1%
        //let t = [3,10,26,76,92,99];
        let t = [2,7,26,76,95,100];

        let c;
        if(rand >= 1 && rand < t[0]) {
            c = -3;
        } else if(rand >= t[0] && rand < t[1]) {
            c = -2
        } else if(rand >= t[1] && rand < t[2]) {
            c = -1
        } else if(rand >= t[2] && rand < t[3]) {
            c = 0;
        } else if(rand >= t[3] && rand < t[4]) {
            c = 1;
        } else if(rand >= t[4] && rand < t[5]) {
            c = 2;
        } else if(rand >= t[5] && rand <= 100) {
            c = 3;
        }

        heightMap[x+1] = pHeight + c;
    }

    return heightMap;
}

// Has a chance of placing a Tree structure.
export function generateTree(x,y,world) {
    let n = rng(0,20);
    if(n == 20) {
        world.structures.push(new structures.BasicTree(x,y,world));
    }
}