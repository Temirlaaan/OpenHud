import { useState, useEffect } from "react";
import { TextInput, ButtonContained } from "../../../components";

interface WebcamSettings {
  id: number;
  enabled: boolean;
  deviceId: string | null;
  vdoNinjaUrl: string | null;
  width: number;
  height: number;
  positionX: number;
  positionY: number;
  borderRadius: number;
  opacity: number;
  borderColor: string;
  borderWidth: number;
  zIndex: number;
}

export const WebcamSettingsComponent = () => {
  const [settings, setSettings] = useState<WebcamSettings>({
    id: 1,
    enabled: false,
    deviceId: null,
    vdoNinjaUrl: null,
    width: 320,
    height: 240,
    positionX: 20,
    positionY: 20,
    borderRadius: 8,
    opacity: 1.0,
    borderColor: "#ffffff",
    borderWidth: 2,
    zIndex: 1000,
  });

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchDevices();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("http://localhost:1349/api/camera/settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching webcam settings:", error);
      showMessage("error", "Failed to load webcam settings");
    }
  };

  const fetchDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setDevices(videoDevices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      showMessage("error", "Failed to load camera devices");
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:1349/api/camera/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const updated = await response.json();
        setSettings(updated);
        showMessage("success", "Webcam settings saved successfully");
      } else {
        showMessage("error", "Failed to save webcam settings");
      }
    } catch (error) {
      console.error("Error saving webcam settings:", error);
      showMessage("error", "Failed to save webcam settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof WebcamSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="rounded-lg bg-background-secondary p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Webcam Settings</h2>

      {message && (
        <div
          className={`mb-4 rounded p-3 ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enabled"
            checked={settings.enabled}
            onChange={(e) => handleChange("enabled", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="enabled" className="ml-2 block text-sm font-medium text-text">
            Enable Webcam Overlay
          </label>
        </div>

        <div>
          <label htmlFor="vdoNinjaUrl" className="mb-2 block font-medium text-text">
            VDO.ninja URL (optional - overrides local camera)
          </label>
          <input
            type="text"
            id="vdoNinjaUrl"
            value={settings.vdoNinjaUrl || ""}
            onChange={(e) => handleChange("vdoNinjaUrl", e.target.value || null)}
            placeholder="https://vdo.ninja/?view=..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={!settings.enabled}
          />
          <p className="mt-1 text-xs text-gray-500">
            If set, this URL will be used instead of local camera. Get the URL from VDO.ninja.
          </p>
        </div>

        <div>
          <label htmlFor="deviceId" className="mb-2 block font-medium text-text">
            Local Camera Device (used if VDO.ninja URL is empty)
          </label>
          <select
            id="deviceId"
            value={settings.deviceId || ""}
            onChange={(e) => handleChange("deviceId", e.target.value || null)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={!settings.enabled || !!settings.vdoNinjaUrl}
          >
            <option value="">Default Camera</option>
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Width (px)"
            type="number"
            value={settings.width}
            onChange={(e) => handleChange("width", parseInt(e.target.value))}
          />
          <TextInput
            label="Height (px)"
            type="number"
            value={settings.height}
            onChange={(e) => handleChange("height", parseInt(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Position X (px)"
            type="number"
            value={settings.positionX}
            onChange={(e) => handleChange("positionX", parseInt(e.target.value))}
          />
          <TextInput
            label="Position Y (px)"
            type="number"
            value={settings.positionY}
            onChange={(e) => handleChange("positionY", parseInt(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Border Radius (px)"
            type="number"
            value={settings.borderRadius}
            onChange={(e) => handleChange("borderRadius", parseInt(e.target.value))}
          />
          <TextInput
            label="Border Width (px)"
            type="number"
            value={settings.borderWidth}
            onChange={(e) => handleChange("borderWidth", parseInt(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="borderColor" className="mb-2 block font-medium text-text">
              Border Color
            </label>
            <input
              type="color"
              id="borderColor"
              value={settings.borderColor}
              onChange={(e) => handleChange("borderColor", e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="opacity" className="mb-2 block font-medium text-text">
              Opacity ({settings.opacity.toFixed(2)})
            </label>
            <input
              type="range"
              id="opacity"
              min="0"
              max="1"
              step="0.01"
              value={settings.opacity}
              onChange={(e) => handleChange("opacity", parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <TextInput
          label="Z-Index"
          type="number"
          value={settings.zIndex}
          onChange={(e) => handleChange("zIndex", parseInt(e.target.value))}
        />

        <div className="flex justify-end gap-4">
          <ButtonContained onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </ButtonContained>
        </div>
      </div>
    </div>
  );
};
