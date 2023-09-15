import { PATH } from "../global.js";

export const image = (src) => {
    let img = new Image;
    try {
        img.src = PATH + src + ".png";
    } 
    catch {
        img.src = "assets/missing_texture.png";
    } 
    finally {
        return img;
    }
}

export const sprites = {
    
    tiles: {
        tile_dirt: image("tiles/tileset_dirt"),
        tile_stone: image("tiles/tileset_stone"),
        tile_grass: image("tiles/tileset_grass"),
    },

    walls: {
        dirt_wall: image("tiles/tileset_dirt_wall"),
        stone_wall: image("tiles/tileset_stone_wall"),
    },

    placeables: {
        sapling: image("tiles/sapling"),
        cloth_plant: image("tiles/cloth_plant"),
    },

    items: {
        dev_pickaxe: image("items/dev_pickaxe"),
        dev_axe: image("items/dev_axe"),
        dev_hammer: image("items/dev_hammer"),
        dev_shovel: image("items/dev_shovel"),
        wood: image("items/wood"),
        branch: image("items/branch"),
        acorn: image("items/acorn"),
        grass_seeds: image("items/grass_seeds"),
        plant_fiber: image("items/plant_fiber"),
        cloth_seeds: image("items/cloth_seeds"),
        wooden_pickaxe: image("items/wooden_pickaxe"),
        wooden_axe: image("items/wooden_axe"),
        wooden_shovel: image("items/wooden_shovel"),
        wooden_hammer: image("items/wooden_hammer"),
    },

    entities: {
        player: image("entities/spritesheet_player"),
    },

    ui: {
        item_type: {
            icon_pickaxe: image("ui/icons/item_pickaxe"),
            icon_axe: image("ui/icons/item_axe"),
            icon_shovel: image("ui/icons/item_shovel"),
            icon_hammer: image("ui/icons/item_hammer"),
            icon_tile: image("ui/icons/item_tile"),
        }   
    },

    misc: {
        missing_texture: image("missing_texture"),
    }
}

export const SOUND_EFFECTS = {

}

export const SOUNDTRACK = {

}