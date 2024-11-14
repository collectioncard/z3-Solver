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

    async create() {
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

        //Place everything on the map

        this.validHiveLocs = await this.placeBeehive(this.layersToGrid([this.groundLayer, this.treesLayer, this.housesLayer]));
        this.validWheelLocs = await this.placeWheelbarrow(this.layersToGrid([this.groundLayer, this.treesLayer, this.housesLayer]));
        this.validMushroomLocs = await this.placeMushroom(this.layersToGrid([this.groundLayer, this.treesLayer, this.housesLayer]));
        this.validSignLocs = await this.placeSign(this.layersToGrid([this.groundLayer, this.treesLayer, this.housesLayer]));

        console.log("Valid beehive locations:");
        console.log(this.validHiveLocs);
        console.log("Valid wheelbarrow locations:");
        console.log(this.validWheelLocs);
        console.log("Valid mushroom locations:");
        console.log(this.validMushroomLocs);
        console.log("Valid sign locations:");
        console.log(this.validSignLocs);
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

    async placeWheelbarrow() {
        solver.reset();

        const wheelbarrowX = Int.const('wheelbarrowX');
        const wheelbarrowY = Int.const('wheelbarrowY');
        const wheelbarrowTileIndex = 58;


        // Add constraints to keep the wheelbarrow inside one of the fenced areas
        solver.add(
            Or(
                // Top right fence
                And(wheelbarrowX.ge(35), wheelbarrowX.le(37), wheelbarrowY.ge(3), wheelbarrowY.le(5)),

                // Bottom left fence
                And(wheelbarrowY.ge(18), wheelbarrowY.le(19), wheelbarrowX.ge(22), wheelbarrowX.le(28))
            )
        );


        // If sat, add the solution to a list, then remove it from the solver and repeat
        let solutions = [];
        while (await solver.check() === "sat") {
            const model = solver.model();
            const x = parseInt(model.eval(wheelbarrowX).toString());
            const y = parseInt(model.eval(wheelbarrowY).toString());
            solutions.push({ x, y });
            solver.add(Or(wheelbarrowX.neq(x), wheelbarrowY.neq(y)));
        }

        //chose a random position and place the wheelbarrow there
        if (solutions.length > 0) {
            const randomIndex = Math.floor(Math.random() * solutions.length);
            const chosenPosition = solutions[randomIndex];
            const { x, y } = chosenPosition;

            this.treesLayer.putTileAt(wheelbarrowTileIndex, x, y);
        }else {
            console.log("No solution found");
        }

        return solutions;
    }

    async placeMushroom() {
        solver.reset();

        const mushroomX = Int.const('wheelbarrowX');
        const mushroomY = Int.const('wheelbarrowY');
        const mushroomIndex = 30;

        // Add constraints to keep the mushroom inside the forested area
        solver.add(
            And(
                mushroomX.ge(10), mushroomX.le(23),
                mushroomY.ge(1), mushroomY.le(12)
            )
        );

        //loop through the map and negate any tiles that have trees or mushrooms already on them
        for (let i = 0; i < this.map.height; i++) {
            for (let j = 0; j < this.map.width; j++) {
                if (this.treesLayer.getTileAt(j, i) !== null) {
                    solver.add(Or(mushroomX.neq(j), mushroomY.neq(i)));
                }
            }
        }

        // If sat, add the solution to a list, then remove it from the solver and repeat
        let solutions = [];
        while (await solver.check() === "sat") {
            const model = solver.model();
            const x = parseInt(model.eval(mushroomX).toString());
            const y = parseInt(model.eval(mushroomY).toString());
            solutions.push({ x, y });
            solver.add(Or(mushroomX.neq(x), mushroomY.neq(y)));
        }

        //chose a random position and place the mushroom there
        if (solutions.length > 0) {
            const randomIndex = Math.floor(Math.random() * solutions.length);
            const chosenPosition = solutions[randomIndex];
            const { x, y } = chosenPosition;

            this.treesLayer.putTileAt(mushroomIndex, x, y);
        }else {
            console.log("No solution found");
        }
        return solutions;
    }

    async placeSign(layerGrid) {
        solver.reset();

        const signTileIndex = 84;
        const pathTiles = [44, 40, 41, 42, 43];
        const validAdjacentValues = [1, 2, 3];

        // Collect valid adjacent positions to path tiles
        const candidatePositions = [];
        for (let y = 0; y < layerGrid.length; y++) {
            for (let x = 0; x < layerGrid[0].length; x++) {
                if (pathTiles.includes(layerGrid[y][x])) {
                    const adjacentTiles = [
                        { x: x - 1, y: y }, // left
                        { x: x + 1, y: y }, // right
                        { x: x, y: y - 1 }, // up
                        { x: x, y: y + 1 }  // down
                    ];

                    for (const tile of adjacentTiles) {
                        if (
                            tile.x >= 0 && tile.x < layerGrid[0].length &&
                            tile.y >= 0 && tile.y < layerGrid.length &&
                            validAdjacentValues.includes(layerGrid[tile.y][tile.x])
                        ) {
                            candidatePositions.push(tile);
                        }
                    }
                }
            }
        }

        if (candidatePositions.length === 0) {
            console.log("No valid adjacent positions found for placing a sign.");
            return null;
        }

        // Define Z3 variables for the sign's position
        const signX = Int.const('signX');
        const signY = Int.const('signY');

        // Add constraints to pick the sign position from candidatePositions
        const positionConstraints = candidatePositions.map(pos =>
            And(signX.eq(pos.x), signY.eq(pos.y))
        );
        solver.add(Or(...positionConstraints));

        let solutions = [];
        while (await solver.check() === "sat") {
            const model = solver.model();
            const x = parseInt(model.eval(signX).toString());
            const y = parseInt(model.eval(signY).toString());
            solutions.push({ x, y });
            solver.add(Or(signX.neq(x), signY.neq(y)));
        }


        //chose a random position and place the beehive there
        if (solutions.length >= 3) {
            let modifiedSolutions = solutions;
            for (let i = 0; i < 3; i++) {
                const randomIndex = Math.floor(Math.random() * modifiedSolutions.length);
                const chosenPosition = modifiedSolutions.splice(randomIndex, 1)[0];
                const { x, y } = chosenPosition;

                this.treesLayer.putTileAt(signTileIndex, x, y);
            }
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
