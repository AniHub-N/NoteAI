# Quick Debug Steps

## Check what's failing:

1. **Open Browser Console** (F12 or Right-click → Inspect → Console)

2. **Try uploading again** and look for error messages

3. **Check for these specific errors:**
   - "Upload API error" - File upload failed
   - "Process API error" - Processing pipeline failed
   - Network errors - API routes not responding

## Common Issues:

### If you see "404 Not Found":
- The API route doesn't exist
- Dev server needs restart: `npm run dev`

### If you see "500 Internal Server Error":
- Check terminal running `npm run dev` for errors
- API key might be invalid

### If you see "CORS" or "Network" errors:
- Dev server might have crashed
- Restart: `npm run dev`

## Manual API Test:

Test the upload endpoint directly:
```bash
# In PowerShell
$file = Get-Item "path\to\your\audio.mp3"
$form = @{file = $file}
Invoke-WebRequest -Uri "http://localhost:3000/api/upload" -Method POST -Form $form
```

## What to share with me:

1. The exact error message from browser console
2. Any errors from the terminal running `npm run dev`
3. The file type you're trying to upload
