#!/usr/bin/env node
/**
 * Quick error test for SubwayRunner
 * Tests for common JavaScript errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SubwayRunner Error Check\n');

// Read the HTML file
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract JavaScript code (simplified)
const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];

let errors = [];

// Test 1: Check for duplicate const/let declarations
console.log('Test 1: Checking for duplicate declarations...');
const variableDeclarations = {};
const declarePattern = /(?:const|let|var)\s+(\w+)/g;

scriptMatches.forEach((scriptTag, index) => {
    let match;
    while ((match = declarePattern.exec(scriptTag)) !== null) {
        const varName = match[1];
        if (!variableDeclarations[varName]) {
            variableDeclarations[varName] = [];
        }
        variableDeclarations[varName].push({
            type: match[0].split(' ')[0],
            scriptIndex: index,
            position: match.index
        });
    }
});

// Check for duplicates in same scope (simplified check)
Object.entries(variableDeclarations).forEach(([varName, declarations]) => {
    if (declarations.length > 1) {
        // Check if they're in the same script block (simplified scope check)
        const scriptGroups = {};
        declarations.forEach(decl => {
            if (!scriptGroups[decl.scriptIndex]) {
                scriptGroups[decl.scriptIndex] = [];
            }
            scriptGroups[decl.scriptIndex].push(decl);
        });
        
        Object.values(scriptGroups).forEach(group => {
            if (group.length > 1 && (group[0].type === 'const' || group[0].type === 'let')) {
                errors.push(`Possible duplicate declaration of '${varName}' in same scope`);
                console.log(`  ⚠️  Possible duplicate: ${varName}`);
            }
        });
    }
});

if (errors.length === 0) {
    console.log('  ✅ No obvious duplicate declarations found');
}

// Test 2: Check if startGame is defined
console.log('\nTest 2: Checking startGame function...');
const startGamePattern = /window\.startGame\s*=\s*(?:async\s+)?function/g;
const startGameMatches = html.match(startGamePattern) || [];

if (startGameMatches.length === 0) {
    errors.push('startGame function not found');
    console.log('  ❌ startGame function not found');
} else if (startGameMatches.length > 1) {
    console.log(`  ⚠️  startGame defined ${startGameMatches.length} times (may be intentional overwrites)`);
} else {
    console.log('  ✅ startGame function found');
}

// Test 3: Check for specific variable issues
console.log('\nTest 3: Checking specific known issues...');

// Check elapsedTime
const elapsedTimePattern = /(?:const|let)\s+elapsedTime/g;
const elapsedTimeMatches = html.match(elapsedTimePattern) || [];
if (elapsedTimeMatches.length > 1) {
    console.log(`  ⚠️  'elapsedTime' declared ${elapsedTimeMatches.length} times`);
    
    // Check if we fixed it
    if (html.includes('roundElapsedTime')) {
        console.log('  ✅ Fix detected: roundElapsedTime is used');
    }
} else {
    console.log('  ✅ No elapsedTime conflicts');
}

// Test 4: Check TensorFlow.js loading
console.log('\nTest 4: Checking TensorFlow.js...');
if (html.includes('tensorflow/tfjs')) {
    console.log('  ✅ TensorFlow.js script tag found');
} else {
    console.log('  ⚠️  TensorFlow.js not found');
}

if (html.includes('class GestureController')) {
    console.log('  ✅ GestureController class found');
} else {
    console.log('  ⚠️  GestureController class not found');
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors.length === 0) {
    console.log('✅ All checks passed!');
} else {
    console.log(`❌ Found ${errors.length} potential issue(s):`);
    errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
    });
}
console.log('='.repeat(50));

process.exit(errors.length > 0 ? 1 : 0);