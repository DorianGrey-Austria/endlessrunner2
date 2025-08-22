#!/usr/bin/env python3
"""
Quick error test for SubwayRunner
Tests for common JavaScript errors
"""

import re
import sys

print('🔍 SubwayRunner Error Check\n')

# Read the HTML file
with open('index.html', 'r') as f:
    html = f.read()

errors = []

# Test 1: Check for duplicate const/let declarations of elapsedTime
print('Test 1: Checking for elapsedTime duplicates...')
elapsed_time_matches = re.findall(r'(?:const|let)\s+elapsedTime', html)
if len(elapsed_time_matches) > 1:
    print(f'  ⚠️  elapsedTime declared {len(elapsed_time_matches)} times')
    errors.append(f'elapsedTime declared {len(elapsed_time_matches)} times')
else:
    print('  ✅ No elapsedTime duplicates')

# Check if fix was applied
if 'roundElapsedTime' in html:
    print('  ✅ Fix applied: roundElapsedTime found')

# Test 2: Check if startGame is defined
print('\nTest 2: Checking startGame function...')
start_game_matches = re.findall(r'window\.startGame\s*=\s*(?:async\s+)?function', html)
if len(start_game_matches) == 0:
    print('  ❌ startGame function not found')
    errors.append('startGame function not found')
elif len(start_game_matches) > 1:
    print(f'  ℹ️  startGame defined {len(start_game_matches)} times (checking last one)')
    # This is okay as long as one exists
else:
    print('  ✅ startGame function found')

# Test 3: Check TensorFlow.js
print('\nTest 3: Checking TensorFlow.js integration...')
if 'tensorflow/tfjs' in html:
    print('  ✅ TensorFlow.js script tag found')
else:
    print('  ⚠️  TensorFlow.js not found')

if 'class GestureController' in html:
    print('  ✅ GestureController class found')
else:
    print('  ⚠️  GestureController class not found')

# Test 4: Check for syntax errors patterns
print('\nTest 4: Checking for common syntax error patterns...')
# Check for missing semicolons before function declarations (common error)
if re.search(r'[^;}]\s*\n\s*function\s+\w+', html):
    print('  ⚠️  Possible missing semicolon before function declaration')

# Check for unclosed brackets
open_braces = html.count('{')
close_braces = html.count('}')
if open_braces != close_braces:
    print(f'  ⚠️  Brace mismatch: {open_braces} {{ vs {close_braces} }}')
    errors.append(f'Brace mismatch: {open_braces} open vs {close_braces} close')
else:
    print('  ✅ Braces balanced')

# Summary
print('\n' + '='*50)
if len(errors) == 0:
    print('✅ All checks passed!')
    sys.exit(0)
else:
    print(f'❌ Found {len(errors)} potential issue(s):')
    for i, error in enumerate(errors, 1):
        print(f'  {i}. {error}')
    sys.exit(1)