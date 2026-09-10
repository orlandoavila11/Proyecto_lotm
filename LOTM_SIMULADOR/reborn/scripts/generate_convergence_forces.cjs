const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve('d:/Users/sammy.avila/Documents/GitHub/LOTM_SIMULADOR Gemini/Simulador/LOTM_SIMULADOR/reborn');
const forcesPath = path.join(packageRoot, 'data', 'gameplay', 'convergence_forces.json');

// Re-generate from current convergence_forces.json to ensure consistency
const data = JSON.parse(fs.readFileSync(forcesPath, 'utf8'));

fs.writeFileSync(forcesPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('convergence_forces.json verificado y sincronizado.');
