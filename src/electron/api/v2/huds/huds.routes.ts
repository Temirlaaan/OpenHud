/* eslint-disable react-hooks/rules-of-hooks */
import { Router, static as static_ } from "express";
import path from "path";
import { getHudPath } from "../../../helpers/pathResolver.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const HudRoutes = Router();

/* ================== GETs ===================== */
HudRoutes.use(static_(getHudPath()));

// Serve webcam script
HudRoutes.get("/webcam.js", (__req, res) => {
  const webcamScriptPath = path.join(__dirname, "../../../public/webcam/webcam.js");
  res.status(200).sendFile(webcamScriptPath);
});

HudRoutes.get("/", (__req, res) => {
  const htmlPath = path.join(getHudPath(), "index.html");

  // Read the HTML file
  fs.readFile(htmlPath, "utf8", (err, html) => {
    if (err) {
      console.error("Error reading HUD HTML:", err);
      res.status(500).send("Error loading HUD");
      return;
    }

    // Inject transparent background styles and scripts
    const injectedHtml = html
      .replace(
        "</head>",
        `
        <style>
          html, body, #root {
            background: transparent !important;
            background-color: transparent !important;
          }
        </style>
        </head>
        `
      )
      .replace(
        "</body>",
        `
        <script src="/socket.io/socket.io.js"></script>
        <script src="/api/hud/webcam.js"></script>
        </body>
        `
      );

    res.status(200).send(injectedHtml);
  });
});

/* ================== POSTs ===================== */

/* ================== PUTs ===================== */
