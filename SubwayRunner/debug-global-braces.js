#!/usr/bin/env node

import fs from 'fs';

const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

let braceCount = 0;
let issues = [];

console.log('🔍 Global brace analysis...\n');

for (let i = 0; i < lines.length; i++) {
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

    // Report negative counts
    if (braceCount < 0) {
        console.log(`❌ Line ${i + 1}: NEGATIVE count (${braceCount}) | "${line.trim()}"`);
        issues.push(`Line ${i + 1}: ${braceCount} negative`);

        // Show context around this line
        console.log('   Context:');
        for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 2); j++) {
            const marker = j === i ? '>>>': '   ';
            console.log(`   ${marker} ${j + 1}: ${lines[j].trim()}`);
        }
        console.log('');
    }
}

console.log(`📊 Final global brace count: ${braceCount}`);
if (issues.length > 0) {
    console.log(`\n❌ ${issues.length} issues found`);
} else {
    console.log('✅ No negative brace counts found');
}