#!/usr/bin/env node

import fs from 'fs';

const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

// Find createObstacle function
let functionStart = -1;
let functionEnd = -1;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('function createObstacle(type, lane, z)')) {
        functionStart = i;
    }
    if (functionStart !== -1 && line === '}' && i === 4424) { // Line 4425 in 0-based indexing
        functionEnd = i;
        break;
    }
}

console.log(`🔍 createObstacle function: lines ${functionStart + 1} to ${functionEnd + 1}`);

// Count braces within this function
let braceCount = 0;

console.log(`\n📊 Brace-by-brace analysis:`);

for (let i = functionStart; i <= functionEnd; i++) {
    const line = lines[i];
    let lineOpen = 0;
    let lineClose = 0;

    for (let char of line) {
        if (char === '{') {
            lineOpen++;
            braceCount++;
        }
        if (char === '}') {
            lineClose++;
            braceCount--;
        }
    }

    const status = braceCount >= 0 ? '✅' : '❌';
    console.log(`${status} Line ${i + 1}: Balance=${braceCount} | Open=${lineOpen}, Close=${lineClose} | "${line.trim()}"`);
}

console.log(`\n📊 Final createObstacle function balance: ${braceCount}`);

// Check if the function should be balanced
if (braceCount !== 0) {
    console.log(`❌ Function is unbalanced! Missing ${braceCount > 0 ? 'closing' : 'opening'} braces: ${Math.abs(braceCount)}`);
} else {
    console.log('✅ Function braces are balanced internally');
}