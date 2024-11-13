//Things to solve:
//Place a wheelbarrow inside a fenced in area.
//Place a mushroom inside the forested area. (same thing)
//place multiple signs next to a path
//place a beehive anywhere there is nothing on the map.

//Forested area: square from (10,1) to (23,12)

//Fenced in areas: 1. Square from (35,3) to (35, 7) inclusive AND (22,18) to (28,19) inclusive

//Path is just gonna have to be found with a loop or something ugh.
import Phaser from "phaser";
import {init} from "z3-solver";

const {Context} = await init();
const {Solver, Int, And, Or, Distinct} = new Context("main");
const solver = new Solver();

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

        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(this.SCALE);

        // Create grid of visible tiles for use with path planning
        let tinyTownGrid = this.layersToGrid([this.groundLayer, this.treesLayer, this.housesLayer]);

        //Place everything on the map

        const validHiveLocs = this.placeBeehive(tinyTownGrid);

    }

    layersToGrid() {
        let grid = [];

        for(let i = 0; i < this.map.height; i++) {
            grid[i] = [];
        }

        for (let i = 0; i < this.map.layers.length; i++) {

            let data = this.map.layers[i].data;
            for (let j = 0; j < data.length; j++) {
                for (let k = 0; k < data[j].length; k++) {
                    if (data[j][k] != null && data[j][k].index !== -1) {
                        grid[j][k] = data[j][k].index;
                    }
                }
            }
        }
        return grid;
    }


    async placeBeehive(layerGrid) {
        solver.reset();

        const beehiveX = Int.const('beehiveX');
        const beehiveY = Int.const('beehiveY');
        const plainTileIndex = 1;
        const beeHiveTileIndex = 95;

        // Add constraints for the beehive position to be within the grid bounds
        solver.add(beehiveX.ge(0));
        solver.add(beehiveX.lt(layerGrid[0].length));
        solver.add(beehiveY.ge(0));
        solver.add(beehiveY.lt(layerGrid.length));

        // Loop through the map and add constraints to avoid non-plain tiles
        for (let i = 0; i < layerGrid.length; i++) {
            for (let j = 0; j < layerGrid[i].length; j++) {
                if (layerGrid[i][j] !== plainTileIndex) {
                    solver.add(Or(beehiveX.neq(j), beehiveY.neq(i)));
                }
            }
        }

        // If sat, add the solution to a list, then remove it from the solver and repeat
        let solutions = [];
        while (await solver.check() === "sat") {
            const model = solver.model();
            const x = parseInt(model.eval(beehiveX).toString());
            const y = parseInt(model.eval(beehiveY).toString());
            solutions.push({ x, y });
            solver.add(Or(beehiveX.neq(x), beehiveY.neq(y)));
        }

        //chose a random position and place the beehive there
        if (solutions.length > 0) {
            const randomIndex = Math.floor(Math.random() * solutions.length);
            const chosenPosition = solutions[randomIndex];
            const { x, y } = chosenPosition;

            this.treesLayer.putTileAt(beeHiveTileIndex, x, y);
        }

        // Return the list of solutions
        return solutions;
    }

}


function generatePhaserScene(content) {
    const config = {
        type: Phaser.AUTO,
        width: 640,
        height: 400,
        parent: content, // Attach the game to the content element
        scene: [Pathfinder]
    };
    return new Phaser.Game(config);
}

export { generatePhaserScene };
