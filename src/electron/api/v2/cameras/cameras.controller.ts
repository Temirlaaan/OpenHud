import { Request, Response } from "express";
import * as CameraService from "./cameras.service.js";
import { io } from "../sockets/sockets.js";

/**
 * Controller for getting webcam settings.
 * @returns The webcam settings object
 */
export const getWebcamSettingsHandler = async (req: Request, res: Response) => {
  try {
    const settings = await CameraService.getWebcamSettings();
    res.status(200).json(settings);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

/**
 * Controller for updating webcam settings.
 * @returns The updated webcam settings object
 */
export const updateWebcamSettingsHandler = async (req: Request, res: Response) => {
  try {
    const settings = await CameraService.updateWebcamSettings(req.body);

    // Emit socket event to notify HUD of webcam settings update
    io.emit("webcamSettingsUpdated", settings);

    res.status(200).json(settings);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};
