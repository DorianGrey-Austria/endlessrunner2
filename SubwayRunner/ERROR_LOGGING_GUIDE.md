# 📊 Error Logging System Documentation

## Overview

The SubwayRunner game now includes a comprehensive error logging system that captures JavaScript errors, CSP violations, resource loading failures, and unhandled promise rejections. All data is stored in Supabase and can be retrieved via API.

## Features

### 1. Automatic Error Capture
- **JavaScript Errors**: Runtime errors with stack traces
- **Promise Rejections**: Unhandled promise errors
- **CSP Violations**: Content Security Policy violations
- **Resource Failures**: Failed image/script/font loads

### 2. GDPR Compliance
- No personal data collected
- Session IDs are temporary (sessionStorage)
- 30-day automatic data retention
- Only technical error data stored

### 3. Context Information
Each error includes:
- Error type and message
- Stack trace (when available)
- Browser information
- Game state (score, level, etc.)
- Performance metrics
- Session ID (temporary)

## Setup Instructions

### 1. Create Supabase Table

Run the SQL script in `sql/create_errors_table.sql` in your Supabase SQL editor.

### 2. Deploy Edge Function

```bash
# From SubwayRunner directory
supabase functions deploy get-errors
```

### 3. Test Error Logging

Open the game and run these commands in the console:

```javascript
// Test JavaScript error
throw new Error("Test error logging");

// Test promise rejection
Promise.reject("Test promise rejection");

// Test resource error (will log 404)
const img = new Image();
img.src = "https://example.com/nonexistent.jpg";
document.body.appendChild(img);
```

## Retrieving Errors

### Via Supabase Dashboard
1. Go to your Supabase project
2. Navigate to Table Editor
3. Select `subway_runner_errors` table
4. View and filter errors

### Via API (for Claude)

Make a POST request to:
```
https://[YOUR_PROJECT_ID].supabase.co/functions/v1/get-errors
```

Example request body:
```json
{
  "limit": 50,
  "errorType": "javascript",
  "startDate": "2025-07-10T00:00:00Z",
  "gameVersion": "V3.7.1-HOTFIX"
}
```

Example using curl:
```bash
curl -X POST https://[YOUR_PROJECT_ID].supabase.co/functions/v1/get-errors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR_ANON_KEY]" \
  -d '{
    "limit": 50,
    "errorType": "javascript"
  }'
```

### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "created_at": "2025-07-10T12:00:00Z",
      "error_type": "javascript",
      "message": "Cannot read property 'x' of undefined",
      "stack": "Error: Cannot read property...",
      "source_url": "https://ki-revolution.at/",
      "line_number": 1234,
      "column_number": 56,
      "game_version": "V3.7.1-HOTFIX",
      "browser_info": {...},
      "game_state": {...},
      "performance_metrics": {...}
    }
  ],
  "stats": {
    "total": 15,
    "byType": {
      "javascript": 10,
      "csp": 3,
      "resource": 2
    },
    "byVersion": {
      "V3.7.1-HOTFIX": 15
    },
    "recentErrors": [...]
  }
}
```

## Error Types

### 1. JavaScript (`javascript`)
Runtime errors in the game code.
- Includes stack trace
- Line and column numbers
- Source file URL

### 2. CSP Violations (`csp`)
Content Security Policy violations.
- Blocked resource URL
- Violated directive
- Document URI

### 3. Resource Loading (`resource`)
Failed to load assets.
- Resource URL
- Resource type (image, script, etc.)

### 4. Promise Rejections (`promise`)
Unhandled promise rejections.
- Rejection reason
- Stack trace (if available)

## Monitoring Best Practices

1. **Check errors after each deployment**
   - Look for new error patterns
   - Verify fixes resolved issues

2. **Monitor error rates**
   - Track errors by version
   - Identify regression issues

3. **Common patterns to watch**
   - Initialization errors
   - Asset loading failures
   - Browser compatibility issues

## Privacy & Data Retention

- **No IP addresses** stored
- **No user identifiers** collected
- **Session IDs** are temporary (cleared on tab close)
- **Automatic deletion** after 30 days
- **Browser data** limited to technical specs

## Troubleshooting

### Errors not logging?
1. Check Supabase connection in console
2. Verify table exists and has proper permissions
3. Check browser console for logging errors

### Too many errors?
1. Implement rate limiting in the logError function
2. Filter out known/acceptable errors
3. Adjust error sampling rate

## Future Enhancements

1. **Error grouping** - Group similar errors together
2. **Alert system** - Email/webhook for critical errors
3. **Performance impact** tracking
4. **User feedback** correlation
5. **A/B testing** error rates