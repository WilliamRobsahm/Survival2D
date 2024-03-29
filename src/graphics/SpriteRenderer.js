import { TILE_SIZE } from "../game/global.js";
import { isPositiveInteger, validNumbers } from "../helper/helper.js";
import { AlignmentX, AlignmentY, getAlignedX, getAlignedY } from "../misc/alignment.js";
import { Spritesheet } from "./Spritesheet.js";
import { MISSING_TEXTURE, getImageCallback, isMissingTexture } from "./assets.js";

export class SpriteRenderer {
    #sx;
    #sy;
    #width = 0;
    #height = 0;
    #source = MISSING_TEXTURE;
    #scale = false;
    #imageError = false;

    sheetX = 0;
    sheetY = 0;

    alignX = AlignmentX.MIDDLE;
    alignY = AlignmentY.MIDDLE;

    /**
     * @param {HTMLImageElement|Spritesheet} source 
     */
    constructor(source = null) {
        if(source instanceof Spritesheet) {
            this.setSource(source.source);
        } else {
            this.setSource(source);
        }
    }

    //#region Getters

    /** @returns {number} */
    get sx() {
        return this.#imageError ? 0 : (this.#sx || (this.sheetX * this.width));
    }

    /** @returns {number} */
    get sy() {
        return this.#imageError ? 0 : (this.#sy || (this.sheetY * this.height));
    }

    /** @returns {number} */
    get height() {
        return this.#imageError ? TILE_SIZE : this.#height;
    }

    /** @returns {number} */
    get width() {
        return this.#imageError ? TILE_SIZE : this.#width;
    }

    /** @returns {HTMLImageElement} */
    get source() {
        return this.#source;
    }

    /** @returns {boolean} */
    get hasMissingTexture() {
        return isMissingTexture(this.source);
    }

    /** @returns {boolean} */
    get scaleToFitSize() {
        return this.#imageError ? true : this.#scale
    }

    /**
     * @param {boolean} value
     */
    set scaleToFitSize(value) {
        if(typeof value == "boolean") {
            this.#scale = value;
        }
    }

    //#endregion

    //#region Setters

    /**
     * Set sprite source image
     * @param {(HTMLImageElement | Promise<HTMLImageElement>)} image Sprite source image
     * @returns {SpriteRenderer} this
     */
    setSource(image) {

        getImageCallback(image, (result) => {
            this.#source = result;
            this.#imageError = isMissingTexture(result);
        })

        return this;
    }

    /** 
     * Set sprite offset in pixels
     */
    setSourcePosition(sx, sy) {
        this.#sx = sx;
        this.#sy = sy;
        return this;
    }

    /** 
     * Set position in spritesheet.
     * Offset is automatically calculated using sprite size
     */
    setSheetPosition(sheetX, sheetY) {
        this.sheetX = sheetX;
        this.sheetY = sheetY;
        return this;
    }

    /**
     * Set width and height of sprite
     * @overload
     * @param {number} width Sprite width
     * @param {number} height Sprite height
     * @returns 
     */
    /**
     * Set size of sprite (equal width and height)
     * @overload
     * @param {number} size Sprite size (Equal width and height)
     * @returns 
     */
    setSpriteSize(arg1, arg2) {
        if(isPositiveInteger(arg1)) {
            if(!isPositiveInteger(arg2)) arg2 = arg1;
            this.#width = arg1;
            this.#height = arg2;
        }
        return this;
    }

    //#endregion

    //#region Rendering methods

    /**
     * Render sprite at given canvas coordinates
     * @overload
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x 
     * @param {number} y 
     */

    /**
     * Render sprite at given canvas coordinates.
     * If given size is smaller than the sprite size, the sprite will 
     * automatically extend outside of the area, you do not need to
     * calculate the difference and adjust the coordinates
     * @overload
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width
     * @param {number} height
     */

    /**
     * Render sprite based of the position of an object.
     * If the object's size is smaller than the sprite size, the sprite will 
     * automatically extend outside its area, you do not need to
     * calculate the difference and adjust the coordinates
     * @overload
     * @param {CanvasRenderingContext2D} ctx 
     * @param {object} obj Must have properties x, y, width / w, and height / h
     */
    render(ctx, arg1, arg2, arg3, arg4) {

        var renderDefault = (x, y) => {
            if(!this.source instanceof Image) {
                console.warn("SpriteRenderer does not have a valid image");
                return;
            }
            ctx.drawImage(this.source, 
                this.sx, this.sy, 
                this.width, this.height,
                x, y,
                this.width, this.height);
        }

        var renderScaled = (x, y, w, h) => {
            ctx.drawImage(this.source, 
                this.sx, this.sy, 
                this.width, this.height,
                x, y, w, h);
        }

        var renderWithSize = (x, y, w, h) => {
            if(this.scaleToFitSize) {
                renderScaled(x, y, w, h);
                return;
            } 

            x = getAlignedX(x, w, this.width, this.alignX);
            y = getAlignedY(y, h, this.height, this.alignY);

            renderDefault(x, y);
        }

        var renderFromObject = (obj) => {
            let w = obj.w || obj.width;
            let h = obj.h || obj.height;
            if(validNumbers(obj.x, obj.y, w, h)) {
                renderWithSize(obj.x, obj.y, w, h);
            }
        }

        if(typeof arg1 == "object") {
            renderFromObject(arg1);
        }
        else if(arg3 == null || arg4 == null) {
            renderDefault(arg1, arg2);
        }
        else {
            renderWithSize(arg1, arg2, arg3, arg4);
        }
    }

    renderCentered(ctx, x, y) {
        this.render(ctx, x - (this.width / 2), y - (this.height / 2));
    }

    //#endregion
}