import express from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import os from 'os';

const app = express();
app.use(express.json());

const storage = new Storage();
const BUCKET_NAME = process.env.GCS_BUCKET || 'lofi-video-factory-2026.firebasestorage.app';

interface RenderRequest {
  jobId: string;
  title: string;
  mood: 'chill' | 'melancholic' | 'dreamy';
  audioUrl?: string;
  durationSeconds?: number;
}

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'remotion-render-server' });
});

// Render endpoint
app.post('/render', async (req, res) => {
  const { jobId, title, mood, audioUrl, durationSeconds = 10 }: RenderRequest = req.body;

  console.log(`🎬 Starting render for job: ${jobId}`);
  console.log(`   Title: ${title}, Mood: ${mood}`);

  const outputPath = path.join(os.tmpdir(), `${jobId}.mp4`);

  try {
    // Bundle the Remotion project
    console.log('📦 Bundling Remotion project...');
    const bundleLocation = await bundle({
      entryPoint: path.resolve(__dirname, './remotion-entry.ts'),
      // If you have a webpack override:
      // webpackOverride: (config) => config,
    });

    // Select the composition
    console.log('🎯 Selecting LofiVisualizer composition...');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'LofiVisualizer',
      inputProps: {
        title,
        mood,
        audioUrl,
      },
    });

    // Override duration if specified
    const fps = 30;
    const durationInFrames = durationSeconds * fps;

    // Render the video
    console.log(`🎨 Rendering ${durationSeconds}s video...`);
    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        title,
        mood,
        audioUrl,
      },
    });

    console.log('✅ Render complete!');

    // Upload to Cloud Storage
    console.log('☁️ Uploading to Cloud Storage...');
    const destination = `video/${jobId}.mp4`;
    await storage.bucket(BUCKET_NAME).upload(outputPath, {
      destination,
      metadata: {
        contentType: 'video/mp4',
      },
    });

    const videoUrl = `gs://${BUCKET_NAME}/${destination}`;
    console.log(`📍 Video uploaded: ${videoUrl}`);

    // Cleanup
    fs.unlinkSync(outputPath);

    res.json({
      success: true,
      videoUrl,
      duration: durationSeconds,
    });
  } catch (error: any) {
    console.error('❌ Render error:', error);
    
    // Cleanup on error
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Remotion Render Server listening on port ${PORT}`);
});
