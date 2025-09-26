#!/usr/bin/env node

import fs from 'fs';

const content = fs.readFileSync('index.html', 'utf8');

// Extract JavaScript content from HTML
const scriptMatches = content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);

if (!scriptMatches) {
    console.log('No script tags found');
    process.exit(1);
}

// Combine all JavaScript code
let jsCode = '';
let lineOffset = 0;

for (const match of scriptMatches) {
    const scriptContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/i, '');

    // Find line offset for this script block
    const beforeScript = content.substring(0, content.indexOf(match));
    lineOffset = beforeScript.split('\n').length;

    jsCode += scriptContent + '\n';
}

console.log('🔍 JavaScript Syntax Validation');
console.log('===============================');

// Simple brace counter
let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;
let lines = jsCode.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (let char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
    }

    // Report negative counts (more closing than opening)
    if (braceCount < 0) {
        console.log(`❌ EXTRA CLOSING BRACE at line ${i + 1}: "${line.trim()}"`);
    }
    if (parenCount < 0) {
        console.log(`❌ EXTRA CLOSING PARENTHESIS at line ${i + 1}: "${line.trim()}"`);
    }
    if (bracketCount < 0) {
        console.log(`❌ EXTRA CLOSING BRACKET at line ${i + 1}: "${line.trim()}"`);
    }
}

console.log(`\n📊 Final Counts:`);
console.log(`Braces: ${braceCount} (should be 0)`);
console.log(`Parentheses: ${parenCount} (should be 0)`);
console.log(`Brackets: ${bracketCount} (should be 0)`);

if (braceCount === 0 && parenCount === 0 && bracketCount === 0) {
    console.log('✅ Syntax appears balanced');
} else {
    console.log('❌ Syntax errors detected');
    process.exit(1);
}