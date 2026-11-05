export type EvaUnitId = 'unit-01' | 'unit-02' | 'unit-00' | 'berserk' | 'space-01';

export type DisplayMode = 'car' | 'mecha';

export type EvaPose = 
  | 'stand' 
  | 'combat' 
  | 'sprint' 
  | 'berserk' 
  | 'atField' 
  | 'sniper' 
  | 'knife';

export type EvaWeapon = 'none' | 'knife' | 'rifle' | 'spear';

export type EnvironmentType = 'spaceOrbit' | 'hangar' | 'tokyo3' | 'redOcean' | 'darkVoid';

export interface EvaConfig {
  unitId: EvaUnitId;
  name: string;
  pilot: string;
  pilotKr: string;
  colors: {
    primary: number;       // Main armor (e.g. EVA-01 purple)
    secondary: number;     // Secondary armor (e.g. black/dark green)
    accent: number;        // Glow/highlights (e.g. toxic green)
    core: number;          // Core jewel color
    visor: number;         // Eye glow color
    frame: number;         // Biomechanical inner frame
  };
}

export interface TelemetryState {
  syncRate: number;        // e.g. 74.8% -> up to 400% in berserk
  batterySeconds: number;  // 300s (5:00) down to 0
  isCableConnected: boolean;
  atFieldActive: boolean;
  atFieldStrength: number; // 0 to 100%
  berserkActive: boolean;
  magiStatus: {
    melchior: boolean;
    balthasar: boolean;
    casper: boolean;
  };
}
