import { TLayout } from '../types/TLayout';

export function normalizeTemplate(t: any): TLayout {
  return {
    ...t,
    Orientation:
      t.Orientation === 'Landscape' ? 0 :
      t.Orientation === 'Portrait' ? 1 :
      typeof t.Orientation === 'string' ? parseInt(t.Orientation) || 0 :
      typeof t.Orientation === 'number' ? t.Orientation : 0,
    Direction:
      t.Direction === 'Landscape' ? 0 :
      t.Direction === 'Portrait' ? 1 :
      typeof t.Direction === 'string' ? parseInt(t.Direction) || 0 :
      typeof t.Direction === 'number' ? t.Direction : 0,
    Model: typeof t.Model === 'string' ? parseInt(t.Model) || 0 : t.Model ?? 0,
    Width: typeof t.Width === 'string' ? parseInt(t.Width) || 0 : t.Width ?? 0,
    Height: typeof t.Height === 'string' ? parseInt(t.Height) || 0 : t.Height ?? 0,
    // TValue는 원본 그대로 유지 (트리 구조/부모-자식 관계 보장)
  };
}
