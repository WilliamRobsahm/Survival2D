import { ctx } from "../../game/global.js";
import { rgb, rgbm } from "../../game/graphics/renderUtil.js";
import { mouseOn } from "../../misc/util.js";
import UIElement from "./UIElement.js";


export class ClickableElement extends UIElement {
    constructor(game, attributes) {
        super(game, attributes);

        this.clickable = true;

        this.onClick = () => {};
        this.setOnClick(attributes.onClick);
    }

    /**
     * Set the function which should run when the button is clicked
     * @param {function} onClick 
     */
    setOnClick(onClick) {
        if(typeof onClick == "function") {
            this.onClick = onClick;
        }
    }

    /**
     * Set whether or not the button is able to be clicked at the current time.
     * (Note: Clickable being false also disables hover effects)
     * @param {boolean} clickable 
     */
    setClickable(clickable) {
        if(typeof clickable == "boolean") {
            this.clickable = clickable;
        }
    }

    update() {
        this.updatePositionX();
        this.updatePositionY();
        this.updateHover(this.game.input);
        this.updateClick(this.game.input);
    }

    updateHover(input) {
        
        // If the element is in a scrollable list, it cannot be hovered if it isn't visible.
        if(this.parent && this.parent.scrollable && !mouseOn(this.parent,input.mouse)) {
            this.hovering = false;
            return;
        }

        this.hovering = mouseOn(this,input.mouse);

        if(this.clickable && this.hovering) {
            document.body.style.cursor = "pointer";
        }
    }

    updateClick(input) {
        if(this.clickable && this.hovering && input.mouse.click) {
            input.mouse.click = false;
            this.onClick();
        }
    }

    /**
     *  Overwrite of default function, to have different colors when hovered.
     */ 
    updateColor(fillColor,strokeColor) {
        if(fillColor) {
            if(!this.clickable) {
                ctx.fillStyle = rgbm(fillColor,0.7);
            } else if(this.hovering) {
                ctx.fillStyle = rgbm(fillColor,1.3);
            } else {
                ctx.fillStyle = rgb(fillColor);
            }
        }
            
        if(strokeColor) {
            ctx.strokeStyle = rgb(strokeColor);
        }
    } 
}