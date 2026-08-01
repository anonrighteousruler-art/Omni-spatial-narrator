export interface Asset {
  id: string;
  type: 'image' | 'video' | 'audio' | 'doc' | '3d';
  url: string;
  name: string;
  timestamp: number;
  prompt?: string;
}

export interface SystemSettings {
  theme: 'dark' | 'light' | 'spatial';
  processingPower: number; // 0-100
  immersionLevel: number; // 0-100
  assistantVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  autoApplyChanges: boolean;
}

export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  id: string;
  isAction?: boolean;
}
