//Things to solve:
//Place a wheelbarrow inside a fenced in area.
//Place a mushroom inside the forested area. (same thing)
//place multiple signs next to a path
//place a beehive anywhere there is nothing on the map.

//Forested area: square from (10,1) to (23,12)

//Fenced in areas: 1. Square from (35,3) to (35, 7) inclusive AND (22,18) to (28,19) inclusive

//Path is just gonna have to be found with a loop or something ugh.
import Phaser from "phaser";

class Pathfinder extends Phaser.Scene {
    constructor() {
        super("pathfinderScene");
    }

    init() {
        this.TILESIZE = 16;
        this.SCALE = 1.0;
        this.TILEWIDTH = 40;
        this.TILEHEIGHT = 25;
    }

    preload() {
        this.load.image("tilemap_tiles", "/assets/Tilemap_Packed.png");
        this.load.tilemapTiledJSON("three-farmhouses", "/assets/Three_Farmhouses.tmj");
    }

    findPathAdj() {
        const pathTiles = [43, 39, 40, 41, 42]
    }

    create() {
        this.map = this.add.tilemap("three-farmhouses", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
        this.treesLayer = this.map.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
        this.housesLayer = this.map.createLayer("Houses-n-Fences", this.tileset, 0, 0);

        // Create townsfolk sprite
        // Use setOrigin() to ensure the tile space computations work well
        //my.sprite.purpleTownie = this.add.sprite(this.tileXtoWorld(5), this.tileYtoWorld(5), "purple").setOrigin(0,0);

        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(this.SCALE);

        // Create grid of visible tiles for use with path planning
        //let tinyTownGrid = this.layersToGrid([this.groundLayer, this.treesLayer, this.housesLayer]);

    }


}


function generatePhasorScene(content) {
    const config = {
        type: Phaser.AUTO,
        width: 640,
        height: 400,
        parent: content, // Attach the game to the content element
        scene: [Pathfinder]
    };
    return new Phaser.Game(config);
}

export { generatePhasorScene };
