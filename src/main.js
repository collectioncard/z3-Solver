import '../style.css'
import { solveDecoration, solveLogicPuzzle, solvePosInFence, solveTreeOutsideFence } from './simpleZ3.js';
import { generatePhaserScene } from './phaserSolver.js';

const app = document.querySelector('#app');
let phaserGame = null;

function createElement(type, cssClassName, text = '') {
    const element = document.createElement(type);
    if (cssClassName){
        element.classList.add(cssClassName);
    }
    element.innerText = text;
    return element;
}

app.append(
    createElement('h1', null, 'Z3 Solver Demo'),
    createElement('p', null, 'By Thomas Wessel & Jarod Spangler \n\nClick on a section to expand and see the solution.')
);

function createDropdown(labelText, onExpand) {
    const section = document.createElement('div');
    const label = createElement('div', 'dropdown-label', labelText);
    const content = createElement('div', 'dropdown-content');
    content.style.display = 'none';

    label.addEventListener('click', () => {
        const isExpanded = content.style.display === 'block';
        content.style.display = isExpanded ? 'none' : 'block';
        if (isExpanded) {
            if (labelText === 'Generate a Phaser Scene' && phaserGame) {
                phaserGame.destroy(true);
                phaserGame = null;
            }
        } else {
            onExpand(labelText, content);
        }
    });

    section.append(label, content);
    return section;
}

async function onSectionExpand(labelText, content) {
    const solutionMap = {
        'A simple Logic Puzzle': solveLogicPuzzle,
        'Finding a position inside of a fence': solvePosInFence,
        'Placing a decoration on the fence': solveDecoration,
        'Place a tree outside the fence': solveTreeOutsideFence,
        'Generate a Phaser Scene': () => {
            phaserGame = generatePhaserScene(content);
            const note = document.createElement('p');
            note.innerText = 'Check the console for all possible tile placements';
            content.appendChild(note);
        }
    };

    const solutionFunc = solutionMap[labelText] || (() => 'No solver found for this section');
    const result = await solutionFunc();
    if (labelText !== 'Generate a Phaser Scene') {
        content.innerHTML = `<p>${result}</p>`;
    }
}

const sections = [
    'A simple Logic Puzzle',
    'Finding a position inside of a fence',
    'Placing a decoration on the fence',
    'Place a tree outside the fence',
    'Generate a Phaser Scene'
];

sections.forEach(labelText => {
    const dropdown = createDropdown(labelText, onSectionExpand);
    app.appendChild(dropdown);
});