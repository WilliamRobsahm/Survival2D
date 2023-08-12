import { setAttributes, gridXfromCoordinate, gridYfromCoordinate, disableShadow } from "../../misc/util.js";
import { ctx } from "../global.js";

export function drawDebugUI(game) {
    setAttributes(ctx, { 
        fillStyle:"white", font:"20px Font1", textAlign:"left",
        shadowOffsetX:2, shadowOffsetY:2, shadowColor:"black", shadowBlur:5
    });

    let x = game.player.camera.x + canvas.width - 256;
    let y = game.player.camera.y;
    let rowHeight = 32;

    // FPS counter
    ctx.fillText("FPS: " + game.fpsCounter.display, x, y + rowHeight);

    // Entity Count
    ctx.fillText("Entity Count: " + game.itemEntities.entities.length, x, y + rowHeight * 2);

    // Player info
    let playerX = gridXfromCoordinate(game.player.centerX);
    let playerY = gridYfromCoordinate(game.player.centerY) -1;
    ctx.fillText(`Player Pos: X ${playerX}, Y ${playerY}`, x, y + rowHeight * 3); 
    ctx.fillText(`Player State: ${game.player.state.name}`, x, y + rowHeight * 4)
    
    // Tile info
    let tile = game.world.getTile(game.input.mouse.gridX, game.input.mouse.gridY);

    let tilePosText, tileTypeText;

    if(tile) {
        ctx.fillText(`Tile Pos: X ${tile.gridX}, Y ${tile.gridY}`, x, y + rowHeight * 5); 
        ctx.fillText(`Tile Type: ${tile.registryName}`, x, y + rowHeight * 6); 
    } else {
        ctx.fillText(`Tile Pos: -`, x, y + rowHeight * 5); 
        ctx.fillText(`Tile Type: -`, x, y + rowHeight * 6); 
    }

    disableShadow(ctx);
}