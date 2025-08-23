#!/usr/bin/env node

/**
 * Check which version is actually deployed on ki-revolution.at
 */

const https = require('https');

function checkLiveVersion() {
    console.log('🔍 Checking live version on ki-revolution.at...\n');
    
    https.get('https://ki-revolution.at/', (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            // Search for version in title tag
            const titleMatch = data.match(/<title>([^<]+)<\/title>/);
            if (titleMatch) {
                console.log('📋 Title tag:', titleMatch[1]);
            }
            
            // Search for all version strings
            const versionMatches = data.match(/V\d+\.\d+(\.\d+)?(-[A-Z\-]+)?/g);
            if (versionMatches) {
                console.log('\n🔢 All version strings found:');
                const uniqueVersions = [...new Set(versionMatches)];
                uniqueVersions.forEach(v => console.log('  •', v));
            }
            
            // Check Three.js version
            const threeMatch = data.match(/three@(\d+\.\d+\.\d+)/);
            if (threeMatch) {
                console.log('\n📦 Three.js version:', threeMatch[1]);
            }
            
            // Check for specific strings
            console.log('\n🔍 Specific checks:');
            console.log('  • Contains "MEDIAPIPE":', data.includes('MEDIAPIPE'));
            console.log('  • Contains "THREE-FIX":', data.includes('THREE-FIX'));
            console.log('  • Contains "GAMECORE-REMOVED":', data.includes('GAMECORE-REMOVED'));
            console.log('  • Contains "DEBUG":', data.includes('DEBUG'));
            
            // Check file size
            console.log('\n📊 File stats:');
            console.log('  • Size:', (data.length / 1024).toFixed(2), 'KB');
            console.log('  • Lines:', data.split('\n').length);
            
            // Check last modification indicators
            const hasGestureDebug = data.includes('gestureDebug');
            const hasMediaPipe = data.includes('MediaPipe');
            const hasStartGameDebug = data.includes('START BUTTON CLICKED');
            
            console.log('\n✅ Feature checks:');
            console.log('  • Gesture Debug:', hasGestureDebug ? '✅' : '❌');
            console.log('  • MediaPipe:', hasMediaPipe ? '✅' : '❌');
            console.log('  • Start Button Debug:', hasStartGameDebug ? '✅' : '❌');
            
            // Final verdict
            console.log('\n🎯 VERDICT:');
            if (data.includes('V5.3.16')) {
                console.log('  ✅ Latest version V5.3.16 is deployed!');
            } else if (data.includes('V5.3.15')) {
                console.log('  ⚠️ Version V5.3.15 is deployed (one behind)');
            } else if (data.includes('V5.3.3')) {
                console.log('  ❌ OLD version V5.3.3 is deployed!');
            } else {
                console.log('  ❓ Unknown version deployed');
            }
        });
    }).on('error', (err) => {
        console.error('❌ Error checking live version:', err.message);
    });
}

// Also check with curl for comparison
const { exec } = require('child_process');

function checkWithCurl() {
    console.log('\n📡 Double-checking with curl...\n');
    
    exec('curl -s https://ki-revolution.at/ | head -20', (error, stdout, stderr) => {
        if (error) {
            console.error('curl error:', error);
            return;
        }
        
        console.log('First 20 lines of live site:');
        console.log('-----------------------------------');
        console.log(stdout);
        console.log('-----------------------------------');
    });
}

// Run checks
checkLiveVersion();
setTimeout(checkWithCurl, 2000);