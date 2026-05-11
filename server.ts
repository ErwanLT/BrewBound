import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route for Collaboration
  app.post("/api/contribute", express.json(), (req, res) => {
    const contribution = req.body;
    console.log("New Contribution Received:", contribution);
    
    // In a real production app, this could trigger a GitHub Action or use octokit to create a PR.
    // For now, we simulate the logic.
    res.json({ 
      success: true, 
      message: "Merci ! Votre proposition a été enregistrée. Une Pull Request va être générée sur GitHub.",
      prUrl: "https://github.com/user/brewbound/pulls" 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
