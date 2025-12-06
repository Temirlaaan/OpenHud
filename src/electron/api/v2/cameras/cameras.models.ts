export interface WebcamSettings {
  id: number;
  enabled: boolean;
  deviceId: string | null;
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

export interface VdoNinjaSettings {
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
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateVdoNinjaSettingsRequest {
  enabled?: boolean;
  width?: number;
  height?: number;
  borderRadius?: number;
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  transitionDuration?: number;
  showAvatarFallback?: boolean;
  cleanOutput?: boolean;
  autoplay?: boolean;
  muted?: boolean;
}
