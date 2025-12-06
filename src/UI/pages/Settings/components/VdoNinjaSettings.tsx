import { useState, useEffect } from "react";
import { TextInput, ButtonContained } from "../../../components";

interface VdoNinjaSettings {
  id: number;
  enabled: boolean;
  width: number;
  height: number;
  borderRadius: number;
  opacity: number;
  borderColor: string;
  borderWidth: number;
  transitionDuration: number;
  showAvatarFallback: boolean;
  cleanOutput: boolean;
  autoplay: boolean;
  muted: boolean;
}

export const VdoNinjaSettingsComponent = () => {
  const [settings, setSettings] = useState<VdoNinjaSettings>({
    id: 1,
    enabled: false,
    width: 320,
    height: 240,
    borderRadius: 50,
    opacity: 1.0,
    borderColor: "#ffffff",
    borderWidth: 2,
    transitionDuration: 300,
    showAvatarFallback: true,
    cleanOutput: true,
    autoplay: true,
    muted: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("http://localhost:1349/api/camera/vdoninja/settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching VDO.Ninja settings:", error);
      showMessage("error", "Failed to load VDO.Ninja settings");
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:1349/api/camera/vdoninja/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const updated = await response.json();
        setSettings(updated);
        showMessage("success", "VDO.Ninja settings saved successfully");
      } else {
        showMessage("error", "Failed to save VDO.Ninja settings");
      }
    } catch (error) {
      console.error("Error saving VDO.Ninja settings:", error);
      showMessage("error", "Failed to save VDO.Ninja settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof VdoNinjaSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="rounded-lg bg-background-secondary p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">VDO.Ninja Camera Settings</h2>
      <p className="mb-4 text-sm text-gray-500">
        Configure player camera overlay using VDO.Ninja streams. Each player needs a VDO.Ninja Stream ID set in their profile.
      </p>

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
            id="vdoninja-enabled"
            checked={settings.enabled}
            onChange={(e) => handleChange("enabled", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="vdoninja-enabled" className="ml-2 block text-sm font-medium text-text">
            Enable VDO.Ninja Camera Overlay
          </label>
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
            label="Border Radius (%)"
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
            <label htmlFor="vdoninja-borderColor" className="mb-2 block font-medium text-text">
              Border Color
            </label>
            <input
              type="color"
              id="vdoninja-borderColor"
              value={settings.borderColor}
              onChange={(e) => handleChange("borderColor", e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="vdoninja-opacity" className="mb-2 block font-medium text-text">
              Opacity ({settings.opacity.toFixed(2)})
            </label>
            <input
              type="range"
              id="vdoninja-opacity"
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
          label="Transition Duration (ms)"
          type="number"
          value={settings.transitionDuration}
          onChange={(e) => handleChange("transitionDuration", parseInt(e.target.value))}
        />

        <div className="space-y-2 rounded-lg bg-background p-4">
          <h3 className="font-medium text-text">Stream Options</h3>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showAvatarFallback"
              checked={settings.showAvatarFallback}
              onChange={(e) => handleChange("showAvatarFallback", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showAvatarFallback" className="ml-2 block text-sm text-text">
              Show player avatar when camera is unavailable
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="cleanOutput"
              checked={settings.cleanOutput}
              onChange={(e) => handleChange("cleanOutput", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="cleanOutput" className="ml-2 block text-sm text-text">
              Clean output (hide VDO.Ninja UI elements)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoplay"
              checked={settings.autoplay}
              onChange={(e) => handleChange("autoplay", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoplay" className="ml-2 block text-sm text-text">
              Autoplay video streams
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="muted"
              checked={settings.muted}
              onChange={(e) => handleChange("muted", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="muted" className="ml-2 block text-sm text-text">
              Mute audio from streams
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="font-medium text-blue-800">How to use VDO.Ninja</h4>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-blue-700">
            <li>Go to Players section and add VDO.Ninja Stream ID for each player</li>
            <li>Share the generated link with each player (they should open it in their browser)</li>
            <li>Players allow camera access and their stream will be available</li>
            <li>Enable VDO.Ninja overlay here and start your match</li>
            <li>Camera will automatically switch when observer changes</li>
          </ol>
        </div>

        <div className="flex justify-end gap-4">
          <ButtonContained onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </ButtonContained>
        </div>
      </div>
    </div>
  );
};
