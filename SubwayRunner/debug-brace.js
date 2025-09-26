#!/usr/bin/env node

import fs from 'fs';

const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

// Find the createObstacle function
let functionStart = -1;
let functionEnd = -1;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('function createObstacle(type, lane, z)')) {
        functionStart = i;
    }
    if (functionStart !== -1 && line === '}' && i > functionStart + 10) {
        functionEnd = i;
        break;
    }
}

console.log(`🔍 createObstacle function: lines ${functionStart + 1} to ${functionEnd + 1}`);

// Count braces within this function
let braceCount = 0;
let issues = [];

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

    // Track significant lines
    if (lineOpen > 0 || lineClose > 0) {
        const status = braceCount >= 0 ? '✅' : '❌';
        console.log(`${status} Line ${i + 1}: ${braceCount} | Opens: ${lineOpen}, Closes: ${lineClose} | "${line.trim()}"`);
    }

    if (braceCount < 0) {
        issues.push(`Line ${i + 1}: ${braceCount} negative`);
    }
}

console.log(`\nFunction brace balance: ${braceCount}`);
if (issues.length > 0) {
    console.log('\n❌ Issues found:');
    issues.forEach(issue => console.log(`  ${issue}`));
}