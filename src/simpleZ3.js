import {init} from "z3-solver";
const {Context} = await init();
const {Solver, Int, And, Or, Distinct} = new Context("main");
const solver = new Solver();


const fenceTopY = 15
const fenceBottomY = 25
const fenceLeftX = 5
const fenceRightX = 10

//Part 1, solving a simple logic puzzle
async function solveLogicPuzzle() {
    const animalMapping = {
        1: 'cat',
        2: 'dog',
        3: 'bird',
        4: 'fish'
    };

    solver.reset();

    const bob = Int.const('bob');
    const mary = Int.const('mary');
    const cathy = Int.const('cathy');
    const sue = Int.const('sue');

    //bob has a dog
    solver.add(bob.eq(2));
    solver.add(And(bob.le(4), bob.ge(1)));

    //Mary does not have a fish
    solver.add(mary.neq(4));
    solver.add(And(mary.le(4), mary.ge(1)));

    //Cathy just kinda exists
    solver.add(And(cathy.le(4), cathy.ge(1)));

    //Sue has a bird
    solver.add(sue.eq(3));
    solver.add(And(sue.le(4), sue.ge(1)));

    //No two people have the same pet
    solver.add(Distinct(bob, mary, cathy, sue));

    if(await solver.check() === "unsat") {
        return "No solution found";
    }

    const model = solver.model();
    const bobPet = animalMapping[parseInt(model.eval(bob).toString())];
    const maryPet = animalMapping[parseInt(model.eval(mary).toString())];
    const cathyPet = animalMapping[parseInt(model.eval(cathy).toString())];
    const suePet = animalMapping[parseInt(model.eval(sue).toString())];

    return `Solution found:<br>Bob has a ${bobPet}, Mary has a ${maryPet}, Cathy has a ${cathyPet}, Sue has a ${suePet}`;

}


//Part 2, finding a position inside the fence
async function solvePosInFence() {
    solver.reset();

    const x = Int.const('x');
    const y = Int.const('y');

    solver.add(And(x.le(fenceRightX - 1), x.ge(fenceLeftX + 1)));
    solver.add(And(y.le(fenceBottomY - 1), y.ge(fenceTopY + 1)));

    if(await solver.check() === "unsat"){
        return "No solution found";
    }else{
        return `Solution found:<br>X position: ${solver.model().eval(x)}, Y position: ${solver.model().eval(y)}`;
    }
}

//Part 3, putting a decoration on the top or left side of fence
async function solveDecoration() {
    solver.reset();

    const x = Int.const('x');
    const y = Int.const('y');

    solver.add(Or
    (
        And(x.eq(fenceLeftX), y.le(fenceBottomY), y.ge(fenceTopY)),
        And(y.eq(fenceTopY), x.le(fenceRightX), x.ge(fenceLeftX))
    ));

    if(await solver.check() === "unsat"){
        return "No solution found";
    }else{
        return `Solution found:<br>X position: ${solver.model().eval(x)}, Y position: ${solver.model().eval(y)}`;
    }

}

//Part 4, putting a tree outside the fence
async function solveTreeOutsideFence() {
    solver.reset();

    const x = Int.const('x');
    const y = Int.const('y');

    solver.add(
        x.ge(8),
        y.ge(20),
        Or(x.lt(fenceLeftX), x.gt(fenceRightX)),
        Or(y.lt(fenceTopY), y.gt(fenceBottomY))
    );

    if (await solver.check() === "unsat") {
        return "No solution found";
    } else {
        return `Solution found:<br>X position: ${solver.model().eval(x)}, Y position: ${solver.model().eval(y)}`;
    }
}

export {solveLogicPuzzle, solvePosInFence, solveDecoration, solveTreeOutsideFence};