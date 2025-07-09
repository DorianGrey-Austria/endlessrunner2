const fs = require('fs');

// Read the file
const content = fs.readFileSync('index.html', 'utf8');

// Split into lines
const lines = content.split('\n');

// Track bracket counts
let roundBrackets = 0;  // ()
let curlyBrackets = 0;  // {}
let squareBrackets = 0; // []

// Check each line
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Count brackets in this line
    for (let char of line) {
        if (char === '(') roundBrackets++;
        if (char === ')') roundBrackets--;
        if (char === '{') curlyBrackets++;
        if (char === '}') curlyBrackets--;
        if (char === '[') squareBrackets++;
        if (char === ']') squareBrackets--;
        
        // Check for negative counts (closing before opening)
        if (roundBrackets < 0) {
            console.log(`ERROR Line ${lineNum}: Extra closing ) parenthesis`);
            console.log(`Line content: ${line.trim()}`);
            process.exit(1);
        }
        if (curlyBrackets < 0) {
            console.log(`ERROR Line ${lineNum}: Extra closing } brace`);
            console.log(`Line content: ${line.trim()}`);
            process.exit(1);
        }
        if (squareBrackets < 0) {
            console.log(`ERROR Line ${lineNum}: Extra closing ] bracket`);
            console.log(`Line content: ${line.trim()}`);
            process.exit(1);
        }
    }
    
    // Report status every 1000 lines
    if (lineNum % 1000 === 0) {
        console.log(`Checked ${lineNum} lines... () = ${roundBrackets}, {} = ${curlyBrackets}, [] = ${squareBrackets}`);
    }
    
    // Check around line 8620
    if (lineNum >= 8615 && lineNum <= 8625) {
        console.log(`Line ${lineNum}: ${line.trim()}`);
    }
}

// Final report
console.log('\nFinal bracket counts:');
console.log(`() = ${roundBrackets}`);
console.log(`{} = ${curlyBrackets}`);
console.log(`[] = ${squareBrackets}`);

if (roundBrackets !== 0 || curlyBrackets !== 0 || squareBrackets !== 0) {
    console.log('\nERROR: Unmatched brackets detected!');
}