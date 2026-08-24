const express = require("express");
const path = require("path");
const fs = require("fs");
const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = path.join(__dirname, "out");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

let bundleLocationPromise = null;
function getBundle() {
  if (!bundleLocationPromise) {
    bundleLocationPromise = bundle({
      entryPoint: path.join(__dirname, "src", "index.ts"),
    });
  }
  return bundleLocationPromise;
}

// Simple shared-secret auth so random people on the internet can't burn your Railway hours
function checkAuth(req, res, next) {
  const key = req.header("x-render-key");
  if (!process.env.RENDER_SECRET || key !== process.env.RENDER_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/health", (req, res) => res.json({ ok: true }));

/**
 * POST /render
 * body: {
 *   scenes: [{ imageUrl: string, text: string }, ...],
 *   audioUrl?: string
 * }
 * Returns the rendered MP4 as a binary response.
 */
app.post("/render", checkAuth, async (req, res) => {
  try {
    const { scenes, audioUrl } = req.body;
    if (!Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({ error: "scenes array is required" });
    }

    const serveUrl = await getBundle();

    const composition = await selectComposition({
      serveUrl,
      id: "ShortVideo",
      inputProps: { scenes, audioUrl: audioUrl || "" },
    });

    const outputPath = path.join(OUTPUT_DIR, `video-${Date.now()}.mp4`);

    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: { scenes, audioUrl: audioUrl || "" },
    });

    res.setHeader("Content-Type", "video/mp4");
    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);
    stream.on("close", () => {
      fs.unlink(outputPath, () => {});
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Render failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Render server listening on port ${PORT}`);
});
