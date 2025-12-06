import { Router } from "express";
import {
  getWebcamSettingsHandler,
  updateWebcamSettingsHandler,
  getVdoNinjaSettingsHandler,
  updateVdoNinjaSettingsHandler
} from "./cameras.controller.js";

export const cameraRoutes = Router();

/* ================== GETs ===================== */
cameraRoutes.get("/settings", getWebcamSettingsHandler);
cameraRoutes.get("/vdoninja/settings", getVdoNinjaSettingsHandler);

/* ================== POSTs ===================== */

/* ================== PUTs ===================== */
cameraRoutes.put("/settings", updateWebcamSettingsHandler);
cameraRoutes.put("/vdoninja/settings", updateVdoNinjaSettingsHandler);
