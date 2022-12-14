
// FIXED IMPORTS:
import { ctx } from "../game/global.js";
import { setAttributes } from "../misc/util.js";

export default class HotbarText {
    constructor(player) {
        this.player = player;
        this.text = "";
        this.opacity = 0;
        this.frameCounter = 0;
        this.displayDuration = 100;
        this.fadeDuration = 50;
    }

    set(text) {
        this.text = text;
        this.opacity = 1;
        this.frameCounter = 0;
    }

    incrementFrames() {
        // For the first (100) frames of being displayed, the hotbar text is at full opacity.
        if(this.frameCounter < this.displayDuration) {
            this.frameCounter += 1;
            return;
        }

        // After the display duration has passed, the text starts to fade out.
        this.opacity -= (1 / this.displayDuration);
        if(this.opacity <= 0) {
            this.text = "";
        }
    }

    draw() {
        this.incrementFrames();

        if(this.player.inventory.view) {
            return;
        }

        setAttributes(ctx,{font:"24px Font1",textAlign:"center",fillStyle:"rgba(255,255,255," + this.opacity + ")",
            shadowOffsetX:2,shadowOffsetY:2,shadowColor:"black",shadowBlur:4});
        let x = this.player.camera.limX() + canvas.width / 2;
        let y = this.player.camera.y + canvas.height - 144;
        ctx.fillText(this.text,x,y);
        setAttributes(ctx,{shadowOffsetX:0,shadowOffsetY:0,shadowColor:0,shadowBlur:0});
    }
}