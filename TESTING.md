# Testing NotesAI Backend

## ✅ Setup Complete

Your backend is configured with:
- ✅ Groq API (Whisper transcription)
- ✅ Google Gemini API (AI summarization & quizzes)
- ✅ Local file storage
- ✅ Streaming progress updates

## How to Test

### 1. Prepare a Test Audio File

**Option A: Use a sample file**
- Download a short lecture clip (1-3 minutes)
- Supported formats: MP3, WAV, M4A, WebM, MP4
- Max size: 25MB

**Option B: Record yourself**
- Use your phone's voice recorder
- Talk about any topic for 1-2 minutes
- Transfer to your computer

### 2. Upload and Process

1. Go to: http://localhost:3000/dashboard/upload
2. Fill in (optional):
   - Course name: e.g., "CS 101"
   - Professor: e.g., "Dr. Smith"
3. Upload your audio file
4. Watch the real-time progress:
   - 📤 Uploading...
   - 🎙️ Transcribing with Groq Whisper...
   - 🤖 Generating summary with Gemini...
   - 📝 Creating quiz questions...
   - ✅ Complete!

### 3. View Results

You'll be redirected to the lecture view with:
- **Transcript**: Word-by-word transcription with timestamps
- **Summary**: AI-generated key topics, definitions, takeaways
- **Quiz**: 5 multiple-choice questions with explanations

### 4. Test Export & Share

- Click **Export** → Download PDF or copy as Markdown
- Click **Share** → Get shareable link with QR code

## Expected Processing Times

| Audio Length | Processing Time |
|--------------|-----------------|
| 1 minute     | ~10-15 seconds  |
| 5 minutes    | ~30-45 seconds  |
| 15 minutes   | ~1-2 minutes    |

## Troubleshooting

### "Upload failed"
- Check file size (max 25MB)
- Verify file format (audio/video only)

### "Transcription failed"
- Verify GROQ_API_KEY in .env.local
- Check Groq console for rate limits

### "Summarization failed"
- Verify GOOGLE_AI_API_KEY in .env.local
- Check Gemini quota (1,500 requests/day free)

### "Processing stuck"
- Check browser console for errors
- Restart dev server: `npm run dev`

## What Happens Behind the Scenes

1. **Upload** → File saved to `/public/uploads`
2. **Transcribe** → Groq Whisper API processes audio
3. **Summarize** → Gemini analyzes transcript
4. **Quiz** → Gemini generates questions
5. **Save** → (Optional) Store in Supabase database

## Next Steps

Once you verify it works:
- [ ] Set up Supabase database for persistence
- [ ] Deploy to Vercel
- [ ] Add usage analytics
- [ ] Implement user quotas

## Free Tier Limits

- **Groq**: Unlimited transcription ✅
- **Gemini**: 1,500 requests/day (≈500 lectures/day) ✅
- **Storage**: Unlimited local (for dev) ✅

**You can process hundreds of lectures per day for FREE!** 🎉
