import '../style.css'
import { solveDecoration, solveLogicPuzzle, solvePosInFence, solveTreeOutsideFence } from './simpleZ3.js';

const app = document.querySelector('#app');

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
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
        if (content.style.display === 'block'){
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
        'Place a tree outside the fence': solveTreeOutsideFence
    };

    const solutionFunc = solutionMap[labelText] || (() => 'No solver found for this section');
    const result = await solutionFunc();
    content.innerHTML = `<p>${result}</p>`;
}

const sections = [
    'A simple Logic Puzzle',
    'Finding a position inside of a fence',
    'Placing a decoration on the fence',
    'Place a tree outside the fence'
];

sections.forEach(labelText => {
    const dropdown = createDropdown(labelText, onSectionExpand);
    app.appendChild(dropdown);
});
