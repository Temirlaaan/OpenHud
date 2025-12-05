import { Router } from "express";
import { getWebcamSettingsHandler, updateWebcamSettingsHandler } from "./cameras.controller.js";

export const cameraRoutes = Router();

/* ================== GETs ===================== */
cameraRoutes.get("/settings", getWebcamSettingsHandler);

/* ================== POSTs ===================== */

/* ================== PUTs ===================== */
cameraRoutes.put("/settings", updateWebcamSettingsHandler);
