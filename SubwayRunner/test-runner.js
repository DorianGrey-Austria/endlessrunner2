#!/usr/bin/env node
/**
 * SubwayRunner Test Runner
 * Automated testing before deployment
 */

const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

class TestRunner {
    constructor() {
        this.testResults = [];
        this.indexPath = path.join(__dirname, 'index.html');
    }

    async runAllTests() {
        console.log('🧪 Starting SubwayRunner Test Suite...\n');
        
        try {
            await this.syntaxTest();
            await this.structureTest();
            await this.performanceTest();
            await this.gameLogicTest();
            
            this.printResults();
            return this.testResults.every(result => result.passed);
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            return false;
        }
    }

    async syntaxTest() {
        console.log('🔍 Running Syntax Tests...');
        
        try {
            const content = fs.readFileSync(this.indexPath, 'utf8');
            
            // Test 1: Check for basic syntax errors
            const hasUnclosedTags = content.includes('<script>') && !content.includes('</script>');
            const hasUnclosedBraces = this.countBraces(content);
            
            if (hasUnclosedTags || hasUnclosedBraces !== 0) {
                throw new Error('Syntax errors detected');
            }
            
            // Test 2: Check for Three.js loading
            const hasThreeJs = content.includes('three@0.158.0');
            if (!hasThreeJs) {
                throw new Error('Three.js not loaded correctly');
            }
            
            // Test 3: Check for GameCore initialization
            const hasGameCore = content.includes('GameCore') && content.includes('LevelManager');
            if (!hasGameCore) {
                throw new Error('GameCore system not found');
            }
            
            this.addResult('Syntax Test', true, 'All syntax checks passed');
            
        } catch (error) {
            this.addResult('Syntax Test', false, error.message);
        }
    }

    async structureTest() {
        console.log('📐 Running Structure Tests...');
        
        try {
            const content = fs.readFileSync(this.indexPath, 'utf8');
            
            // Test 1: Check for Level System
            const hasLevel1 = content.includes('Level 1') || content.includes('Classic Subway');
            const hasLevel2 = content.includes('Level 2') || content.includes('Neon Night Run');
            const hasLevelTransition = content.includes('checkLevelTransition');
            
            if (!hasLevel1 || !hasLevel2 || !hasLevelTransition) {
                throw new Error('Level system incomplete');
            }
            
            // Test 2: Check for essential game functions
            const essentialFunctions = [
                'startGame',
                'gameLoop',
                'updateUI',
                'checkCollisions'
            ];
            
            for (const func of essentialFunctions) {
                if (!content.includes(func)) {
                    throw new Error(`Missing essential function: ${func}`);
                }
            }
            
            this.addResult('Structure Test', true, 'All structure checks passed');
            
        } catch (error) {
            this.addResult('Structure Test', false, error.message);
        }
    }

    async performanceTest() {
        console.log('⚡ Running Performance Tests...');
        
        try {
            const stats = fs.statSync(this.indexPath);
            const fileSizeKB = stats.size / 1024;
            
            // Test 1: File size check
            if (fileSizeKB > 1000) { // 1MB limit
                console.warn(`⚠️  File size: ${fileSizeKB.toFixed(2)}KB (consider optimization)`);
            }
            
            // Test 2: Content analysis
            const content = fs.readFileSync(this.indexPath, 'utf8');
            const lineCount = content.split('\n').length;
            
            if (lineCount > 20000) {
                console.warn(`⚠️  File has ${lineCount} lines (consider modularization)`);
            }
            
            this.addResult('Performance Test', true, `File size: ${fileSizeKB.toFixed(2)}KB, Lines: ${lineCount}`);
            
        } catch (error) {
            this.addResult('Performance Test', false, error.message);
        }
    }

    async gameLogicTest() {
        console.log('🎮 Running Game Logic Tests...');
        
        try {
            const content = fs.readFileSync(this.indexPath, 'utf8');
            
            // Test 1: Score system
            const hasScoreSystem = content.includes('gameState.score') && content.includes('addScore');
            if (!hasScoreSystem) {
                throw new Error('Score system not found');
            }
            
            // Test 2: Level progression
            const hasLevelProgression = content.includes('currentLevel * 1000') && content.includes('nextLevelScore');
            if (!hasLevelProgression) {
                throw new Error('Level progression logic not found');
            }
            
            // Test 3: Collision detection
            const hasCollisionDetection = content.includes('checkCollisions') || content.includes('collision');
            if (!hasCollisionDetection) {
                throw new Error('Collision detection not found');
            }
            
            this.addResult('Game Logic Test', true, 'All game logic checks passed');
            
        } catch (error) {
            this.addResult('Game Logic Test', false, error.message);
        }
    }

    countBraces(content) {
        let count = 0;
        for (let char of content) {
            if (char === '{') count++;
            if (char === '}') count--;
        }
        return count;
    }

    addResult(testName, passed, message) {
        this.testResults.push({ testName, passed, message });
        const icon = passed ? '✅' : '❌';
        console.log(`${icon} ${testName}: ${message}`);
    }

    printResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('=' .repeat(50));
        
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        console.log(`Tests passed: ${passed}/${total}`);
        
        if (passed === total) {
            console.log('🎉 All tests passed! Ready for deployment.');
        } else {
            console.log('❌ Some tests failed. Please fix before deployment.');
        }
        
        console.log('=' .repeat(50));
    }
}

// Run tests if called directly
if (require.main === module) {
    const runner = new TestRunner();
    runner.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = TestRunner;