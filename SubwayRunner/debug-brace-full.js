#!/usr/bin/env node

import fs from 'fs';

const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

// Find the createObstacle function properly
let functionStart = -1;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('function createObstacle(type, lane, z)')) {
        functionStart = i;
        break;
    }
}

if (functionStart === -1) {
    console.log('❌ createObstacle function not found');
    process.exit(1);
}

console.log(`🔍 createObstacle function starts at line ${functionStart + 1}`);

// Count braces from function start, looking for the matching closing brace
let braceCount = 0;
let functionDepth = 0;
let functionEnd = -1;

for (let i = functionStart; i < lines.length; i++) {
    const line = lines[i];

    for (let char of line) {
        if (char === '{') {
            braceCount++;
            if (i === functionStart) functionDepth = 1; // Mark function start
        }
        if (char === '}') {
            braceCount--;
            if (functionDepth > 0 && braceCount === 0) {
                functionEnd = i;
                break;
            }
        }
    }

    if (functionEnd !== -1) break;
}

console.log(`🔍 createObstacle function ends at line ${functionEnd + 1}`);

// Now check the whole function for issues
braceCount = 0;
let issues = [];

console.log(`\n📊 Brace analysis from line ${functionStart + 1} to ${functionEnd + 1}:`);

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

    // Show problematic lines
    if (braceCount < 0) {
        console.log(`❌ Line ${i + 1}: NEGATIVE count (${braceCount}) | "${line.trim()}"`);
        issues.push(`Line ${i + 1}: ${braceCount} negative`);
    } else if (lineOpen > 0 || lineClose > 0) {
        const total = lineOpen + lineClose;
        if (total > 1) {
            console.log(`⚠️ Line ${i + 1}: Multiple braces (${braceCount}) | Opens: ${lineOpen}, Closes: ${lineClose} | "${line.trim()}"`);
        }
    }
}

console.log(`\n📊 Final function brace balance: ${braceCount}`);
if (issues.length > 0) {
    console.log('\n❌ Issues found:');
    issues.forEach(issue => console.log(`  ${issue}`));
} else if (braceCount === 0) {
    console.log('✅ Function braces are balanced');
} else {
    console.log(`❌ Function has unbalanced braces: ${braceCount}`);
}