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

/**
 * Controller for getting VDO.Ninja settings.
 * @returns The VDO.Ninja settings object
 */
export const getVdoNinjaSettingsHandler = async (req: Request, res: Response) => {
  try {
    const settings = await CameraService.getVdoNinjaSettings();
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
 * Controller for updating VDO.Ninja settings.
 * @returns The updated VDO.Ninja settings object
 */
export const updateVdoNinjaSettingsHandler = async (req: Request, res: Response) => {
  try {
    const settings = await CameraService.updateVdoNinjaSettings(req.body);

    // Emit socket event to notify HUD of VDO.Ninja settings update
    io.emit("vdoNinjaSettingsUpdated", settings);

    res.status(200).json(settings);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};
