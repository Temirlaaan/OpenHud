export interface WebcamSettings {
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
  createdAt?: string;
  updatedAt?: string;
}

export interface WebcamDevice {
  deviceId: string;
  label: string;
  kind: string;
}

export interface UpdateWebcamSettingsRequest {
  enabled?: boolean;
  deviceId?: string | null;
  vdoNinjaUrl?: string | null;
  width?: number;
  height?: number;
  positionX?: number;
  positionY?: number;
  borderRadius?: number;
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  zIndex?: number;
}
