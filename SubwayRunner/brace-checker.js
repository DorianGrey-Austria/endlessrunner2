#!/usr/bin/env node

import fs from 'fs';

const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

let braceCount = 0;
let issueFound = false;

console.log('🔍 Checking for brace imbalances...');

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

    // Warn about lines that become negative
    if (braceCount < 0) {
        console.log(`❌ Line ${i + 1}: NEGATIVE brace count (${braceCount})`);
        console.log(`   Line: "${line.trim()}"`);
        console.log(`   Opens: ${lineOpen}, Closes: ${lineClose}`);
        issueFound = true;
        // Reset to 0 to continue checking
        braceCount = 0;
    }
}

console.log(`\n📊 Final brace count: ${braceCount}`);
if (braceCount !== 0) {
    console.log(`❌ Unbalanced braces: ${braceCount > 0 ? 'missing closing' : 'extra closing'}`);
    issueFound = true;
}

if (!issueFound) {
    console.log('✅ No obvious brace issues found');
}