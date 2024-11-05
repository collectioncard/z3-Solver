import { init } from 'z3-solver';

const { Context } = await init();
const { Solver, Int, And, Or, Distinct } = new Context("main");
const solver = new Solver();

const bob = Int.const('bob');
const mary = Int.const('mary');
const cathy = Int.const('cathy');
const sue = Int.const('sue');

// 1: has cat
// 2: has dog
// 3: has bird
// 4: has fish

//bob has a dog
solver.add(bob.eq(2));
solver.add(And(bob.le(4), bob.ge(1)));

//mary does not have a fish
solver.add(mary.neq(4));
solver.add(And(mary.le(4), mary.ge(1)));

//cathy
solver.add(And(cathy.le(4), cathy.ge(1)));

//sue has a bird
solver.add(sue.eq(3));
solver.add(And(sue.le(4), sue.ge(1)));


//every child has at most one pet
solver.add(Distinct(bob, mary, cathy, sue));


// Run Z3 solver, find solution and sat/unsat
console.log(await solver.check());

// Extract and print each child's pet
const model = solver.model();
const bobVal = model.eval(bob);
const maryVal = model.eval(mary);
const cathyVal = model.eval(cathy);
const sueVal = model.eval(sue);
console.log(`Bob: ${bobVal}`);
console.log(`Mary: ${maryVal}`);
console.log(`Cathy: ${cathyVal}`);
console.log(`Sue: ${sueVal}`);
