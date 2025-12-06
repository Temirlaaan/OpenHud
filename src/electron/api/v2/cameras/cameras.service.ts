import { database } from "../../../configs/database.js";
import { WebcamSettings, UpdateWebcamSettingsRequest, VdoNinjaSettings, UpdateVdoNinjaSettingsRequest } from "./cameras.models.js";
import { run_transaction } from "../helpers/utilities.js";

/**
 * Get webcam settings from the database.
 * @returns The webcam settings object
 */
export const getWebcamSettings = (): Promise<WebcamSettings> => {
  return new Promise((resolve, reject) => {
    const statement = "SELECT * FROM webcam_settings WHERE id = 1";
    database.get(statement, [], (error: Error, settings: any) => {
      if (error) {
        console.error("Error getting webcam settings:", error);
        reject(error);
      } else {
        // Convert SQLite integer to boolean
        const webcamSettings: WebcamSettings = {
          ...settings,
          enabled: Boolean(settings.enabled),
        };
        resolve(webcamSettings);
      }
    });
  });
};

/**
 * Update webcam settings in the database.
 * @param settings - Partial settings object to update
 * @returns The updated webcam settings
 */
export const updateWebcamSettings = (
  settings: UpdateWebcamSettingsRequest
): Promise<WebcamSettings> => {
  return run_transaction(async () => {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const values: any[] = [];

      if (settings.enabled !== undefined) {
        fields.push("enabled = ?");
        values.push(settings.enabled ? 1 : 0);
      }
      if (settings.deviceId !== undefined) {
        fields.push("deviceId = ?");
        values.push(settings.deviceId);
      }
      if (settings.width !== undefined) {
        fields.push("width = ?");
        values.push(settings.width);
      }
      if (settings.height !== undefined) {
        fields.push("height = ?");
        values.push(settings.height);
      }
      if (settings.positionX !== undefined) {
        fields.push("positionX = ?");
        values.push(settings.positionX);
      }
      if (settings.positionY !== undefined) {
        fields.push("positionY = ?");
        values.push(settings.positionY);
      }
      if (settings.borderRadius !== undefined) {
        fields.push("borderRadius = ?");
        values.push(settings.borderRadius);
      }
      if (settings.opacity !== undefined) {
        fields.push("opacity = ?");
        values.push(settings.opacity);
      }
      if (settings.borderColor !== undefined) {
        fields.push("borderColor = ?");
        values.push(settings.borderColor);
      }
      if (settings.borderWidth !== undefined) {
        fields.push("borderWidth = ?");
        values.push(settings.borderWidth);
      }
      if (settings.zIndex !== undefined) {
        fields.push("zIndex = ?");
        values.push(settings.zIndex);
      }

      if (fields.length === 0) {
        return getWebcamSettings().then(resolve).catch(reject);
      }

      values.push(1); // id = 1

      const statement = `UPDATE webcam_settings SET ${fields.join(", ")} WHERE id = ?`;
      database.run(statement, values, (error: Error) => {
        if (error) {
          console.error("Error updating webcam settings:", error);
          reject(error);
        } else {
          getWebcamSettings().then(resolve).catch(reject);
        }
      });
    });
  });
};

/**
 * Get VDO.Ninja settings from the database.
 * @returns The VDO.Ninja settings object
 */
export const getVdoNinjaSettings = (): Promise<VdoNinjaSettings> => {
  return new Promise((resolve, reject) => {
    const statement = "SELECT * FROM vdoninja_settings WHERE id = 1";
    database.get(statement, [], (error: Error, settings: any) => {
      if (error) {
        console.error("Error getting VDO.Ninja settings:", error);
        reject(error);
      } else {
        // Convert SQLite integers to booleans
        const vdoNinjaSettings: VdoNinjaSettings = {
          ...settings,
          enabled: Boolean(settings.enabled),
          showAvatarFallback: Boolean(settings.showAvatarFallback),
          cleanOutput: Boolean(settings.cleanOutput),
          autoplay: Boolean(settings.autoplay),
          muted: Boolean(settings.muted),
        };
        resolve(vdoNinjaSettings);
      }
    });
  });
};

/**
 * Update VDO.Ninja settings in the database.
 * @param settings - Partial settings object to update
 * @returns The updated VDO.Ninja settings
 */
export const updateVdoNinjaSettings = (
  settings: UpdateVdoNinjaSettingsRequest
): Promise<VdoNinjaSettings> => {
  return run_transaction(async () => {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const values: any[] = [];

      if (settings.enabled !== undefined) {
        fields.push("enabled = ?");
        values.push(settings.enabled ? 1 : 0);
      }
      if (settings.width !== undefined) {
        fields.push("width = ?");
        values.push(settings.width);
      }
      if (settings.height !== undefined) {
        fields.push("height = ?");
        values.push(settings.height);
      }
      if (settings.borderRadius !== undefined) {
        fields.push("borderRadius = ?");
        values.push(settings.borderRadius);
      }
      if (settings.opacity !== undefined) {
        fields.push("opacity = ?");
        values.push(settings.opacity);
      }
      if (settings.borderColor !== undefined) {
        fields.push("borderColor = ?");
        values.push(settings.borderColor);
      }
      if (settings.borderWidth !== undefined) {
        fields.push("borderWidth = ?");
        values.push(settings.borderWidth);
      }
      if (settings.transitionDuration !== undefined) {
        fields.push("transitionDuration = ?");
        values.push(settings.transitionDuration);
      }
      if (settings.showAvatarFallback !== undefined) {
        fields.push("showAvatarFallback = ?");
        values.push(settings.showAvatarFallback ? 1 : 0);
      }
      if (settings.cleanOutput !== undefined) {
        fields.push("cleanOutput = ?");
        values.push(settings.cleanOutput ? 1 : 0);
      }
      if (settings.autoplay !== undefined) {
        fields.push("autoplay = ?");
        values.push(settings.autoplay ? 1 : 0);
      }
      if (settings.muted !== undefined) {
        fields.push("muted = ?");
        values.push(settings.muted ? 1 : 0);
      }

      if (fields.length === 0) {
        return getVdoNinjaSettings().then(resolve).catch(reject);
      }

      values.push(1); // id = 1

      const statement = `UPDATE vdoninja_settings SET ${fields.join(", ")} WHERE id = ?`;
      database.run(statement, values, (error: Error) => {
        if (error) {
          console.error("Error updating VDO.Ninja settings:", error);
          reject(error);
        } else {
          getVdoNinjaSettings().then(resolve).catch(reject);
        }
      });
    });
  });
};
