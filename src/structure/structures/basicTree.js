
// FIXED IMPORTS:
import { rng } from '../../misc/util.js';
import Structure from '../structure.js';

export class BasicTree extends Structure {
    constructor(gridX,gridY,world) {
        super(gridX,gridY,world);
        this.ID = 0;
    }

    generate() {
        // More compact than typing "this.gridX over and over"
        let bx = this.gridX;
        let by = this.gridY;

        // Generate logs
        let logHeight = rng(3,8);
        for(let i=0;i<logHeight;i++) {
            this.world.addStructureTile("Log",bx,by + i,false);
        }

        // Generate some values for the leaves
        let baseHeight = rng(2,4);
        let leftExtension = rng(0,baseHeight-1);
        let rightExtension = rng(0,baseHeight-1);
        let topExtension = rng(0,3);

        let topY = by + logHeight;
        if(baseHeight >= 3) {
            topY -= 1;
        }

        for(let y=0;y<baseHeight;y++) {
            for(let x=-1;x<=1;x++) {
                this.world.addStructureTile("Leaves",bx+x,topY + y-1,false);
            }
        }

        // Bottom extension:
        // 3 blocks below the leaf "base". Each has a 50% chance of appearing.
        for(let i=-1;i<=1;i++) {
            if(rng(0,1) == 1) {
                this.world.addStructureTile("Leaves",bx+i,topY - 2,false);
            }
        }


        // Top extension
        let lean = 0;
        if(topExtension == 1) {
            lean = 1;
        } else if(topExtension == 2) {
            lean = rng(0,1);
        }
        

        for(let i=0;i<topExtension;i++) {
            this.world.addStructureTile("Leaves",bx+i+lean-1,topY+baseHeight-1,false);
        }

        
        let o = rng(0,1);
        for(let i=0;i<leftExtension;i++) {
            this.world.addStructureTile("Leaves",bx-2,topY+i-o,false);
        }

        o = rng(0,1);
        for(let i=0;i<rightExtension;i++) {
            this.world.addStructureTile("Leaves",bx+2,topY+i-o,false);
        }

    }
}