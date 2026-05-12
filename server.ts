import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { Octokit } from "@octokit/rest";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const OWNER = process.env.GITHUB_REPO_OWNER;
  const REPO = process.env.GITHUB_REPO_NAME;

  const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

  // API Route for Collaboration
  app.post("/api/contribute", express.json(), async (req, res) => {
    const { type, data } = req.body;
    console.log(`New ${type} Contribution Received:`, data);

    if (!octokit || !OWNER || !REPO) {
      console.warn("GitHub integration not configured. Check GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME.");
      return res.json({ 
        success: true, 
        message: "(Mode Démo) Merci ! Votre proposition a été enregistrée localement (GitHub non configuré).",
      });
    }

    try {
      const filePath = type === 'brewery' ? 'src/data/breweries.json' : 'src/data/beers.json';
      
      // Automatic Geocoding for breweries if lat/lng are missing
      if (type === 'brewery' && data.address && (!data.lat || !data.lng)) {
        try {
          console.log(`Geocoding address: ${data.address}`);
          const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(data.address as string)}&format=json&limit=1`, {
            headers: { 'User-Agent': 'BrewBound-App (contact@brewbound.example)' }
          });
          const geoData = await geoResponse.json() as any[];
          if (geoData && geoData.length > 0) {
            data.lat = parseFloat(geoData[0].lat);
            data.lng = parseFloat(geoData[0].lon);
            console.log(`Found coordinates: ${data.lat}, ${data.lng}`);
          }
        } catch (geoErr) {
          console.error("Geocoding failed, proceeding with original data:", geoErr);
        }
      }

      const branchName = `contribution-${type}-${Date.now()}`;

      // 1. Get the main branch SHA
      const { data: mainRef } = await octokit.git.getRef({
        owner: OWNER,
        repo: REPO,
        ref: 'heads/main',
      });

      // 2. Create a new branch
      await octokit.git.createRef({
        owner: OWNER,
        repo: REPO,
        ref: `refs/heads/${branchName}`,
        sha: mainRef.object.sha,
      });

      // 3. Get the existing file content
      const { data: fileData } = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: filePath,
        ref: 'main',
      });

      if (Array.isArray(fileData) || !('content' in fileData)) {
        throw new Error("Invalid file content structure from GitHub");
      }

      const currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
      
      const itemId = data.id || `${type}-${Date.now()}`;
      const isUpdate = currentContent.some((item: any) => item.id === itemId);

      let updatedContent;
      if (isUpdate) {
        updatedContent = currentContent.map((item: any) => 
          item.id === itemId ? { ...item, ...data } : item
        );
      } else {
        const newItem = {
          id: itemId,
          ...data
        };
        updatedContent = [...currentContent, newItem];
      }

      const actionLabel = isUpdate ? 'Mise à jour' : 'Ajout';
      const prTitle = `[Collaboration] ${actionLabel} ${type === 'brewery' ? 'brasserie' : 'bière'} : ${data.name}`;

      // 4. Update the file in the new branch
      await octokit.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path: filePath,
        message: `${isUpdate ? 'Update' : 'Add'} ${type}: ${data.name}`,
        content: Buffer.from(JSON.stringify(updatedContent, null, 2)).toString('base64'),
        branch: branchName,
        sha: fileData.sha,
      });

      // 5. Create the Pull Request
      const { data: pr } = await octokit.pulls.create({
        owner: OWNER,
        repo: REPO,
        title: prTitle,
        head: branchName,
        base: 'main',
        body: `Cette PR a été générée automatiquement depuis l'application BrewBound.\n\n**Action:** ${actionLabel}\n**Type:** ${type}\n**Nom:** ${data.name}\n**Utilisateur:** ${req.headers['x-user-email'] || 'Anonyme'}`,
      });

      res.json({ 
        success: true, 
        message: "Succès ! Votre proposition a généré une Pull Request sur GitHub.",
        prUrl: pr.html_url 
      });
    } catch (err: any) {
      console.error("Error creating PR:", err);
      res.status(500).json({ 
        success: false, 
        error: "Erreur lors de la création de la Pull Request sur GitHub. Vérifiez vos configurations." 
      });
    }
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
