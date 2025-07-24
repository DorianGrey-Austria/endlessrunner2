#!/usr/bin/env node

// Script to fetch errors from Supabase
// Usage: node fetch-errors.js [--limit=50] [--type=javascript] [--today]

const https = require('https');

// Supabase configuration
const SUPABASE_URL = 'https://cquahsbgcycdmslcmmdz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxdWFoc2JnY3ljZG1zbGNtbWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzOTE3MDgsImV4cCI6MjA2ODk2NzcwOH0.1iBIMxzrvQpksIT2LNYr99DopyUVUl7XnasJ8aO3-Vw';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    limit: 50,
    type: null,
    today: false
};

args.forEach(arg => {
    if (arg.startsWith('--limit=')) {
        options.limit = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--type=')) {
        options.type = arg.split('=')[1];
    } else if (arg === '--today') {
        options.today = true;
    }
});

// Build query parameters
let query = `?order=created_at.desc&limit=${options.limit}`;
if (options.type) {
    query += `&error_type=eq.${options.type}`;
}
if (options.today) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query += `&created_at=gte.${today.toISOString()}`;
}

// Make request
const requestOptions = {
    hostname: 'cquahsbgcycdmslcmmdz.supabase.co',
    path: `/rest/v1/subway_runner_errors${query}`,
    method: 'GET',
    headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    }
};

console.log('🔍 Fetching errors from Supabase...\n');

const req = https.request(requestOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const errors = JSON.parse(data);
            
            if (Array.isArray(errors)) {
                console.log(`📊 Found ${errors.length} errors\n`);
                
                // Group by type
                const errorsByType = {};
                errors.forEach(error => {
                    if (!errorsByType[error.error_type]) {
                        errorsByType[error.error_type] = [];
                    }
                    errorsByType[error.error_type].push(error);
                });
                
                // Display summary
                console.log('📈 Error Summary:');
                Object.keys(errorsByType).forEach(type => {
                    console.log(`  - ${type}: ${errorsByType[type].length} errors`);
                });
                console.log('');
                
                // Display recent errors
                console.log('🚨 Recent Errors:');
                errors.slice(0, 5).forEach((error, index) => {
                    console.log(`\n${index + 1}. [${error.error_type}] ${error.message}`);
                    console.log(`   Version: ${error.game_version}`);
                    console.log(`   Time: ${new Date(error.created_at).toLocaleString()}`);
                    if (error.source_url) {
                        console.log(`   Source: ${error.source_url}:${error.line_number}:${error.column_number}`);
                    }
                    if (error.browser_info) {
                        console.log(`   Browser: ${error.browser_info.platform} - ${error.browser_info.viewport}`);
                    }
                });
                
            } else {
                console.log('❌ Unexpected response format:', data);
            }
        } catch (error) {
            console.error('❌ Error parsing response:', error);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error);
});

req.end();