export interface TObject {
  id?: string; // 선택적 필드로 변경
  Type: string;
  ZOrder: number;
  PenWidth: number;
  PenColor: string;
  FillColor: string;
  IsFilled: boolean;
  PosX: number;
  PosY: number;
  PosX1: number;
  PosY1: number;
  Height: number;
  Width: number;
  Rotation: number;
  Font: Font;
  Text: string | null;
  Align: AlignTypeH;
  VAlign: AlignTypeV;
  DataName: string | null;
  ShowBarcodeLabel: boolean;
  ShowBoarder: boolean;
  ArcsWidth: number;
  Margin: number;
  Arrow: number;
  ArrowSize: number;
  BorderShape: BorderType;
  Newline: string;
  Subject: string;
  CodeType: BarcodeType;
  Reference: ReferenceType;
  SizeMode: SizeModeType;
  ProductID: number;
  MultiFacingMode: boolean;
  SingleLine: boolean;
  LineHeight: number;
  ImageBase64: string | null;
}

export interface TLayout {
  Guid: string;
  Name: string;
  Model: ModelType;
  DisplayName: string;
  Bookmark: boolean;
  Width: number;
  Height: number;
  Orientation: OrientationType;
  Direction: DirectionType;
  Upsidedown: boolean;
  Column: number;
  Row: number;
  BGColor: string;
  TWidth: number;
  THeight: number;
  Default: boolean;
  TType: string;
  TValue: string;
  PValue: string;      // PValue 추가
  popTValue?: string; // 읽기 전용 속성 추가
  Desc?: string;  // 읽기 전용 속성 추가
  previewImage?: string;  // 이미지는 base64 string으로 저장
  thumnailImage?: string; // 이미지는 base64 string으로 저장
  Objects: TObject[];
}

// ModelType enum에 모든 모델 16진수 값 추가
export enum ModelType {
    M13R_IB = 0x050902, // 1.3IB(R)
    M13RY_IC = 0x050903, // 1.3IC(RY)
    M15 = 0x09, // 1.5
    M21 = 0x01, // 2.1
    M27 = 0x0C, // 2.7
    M29 = 0x02, // 2.9
    M37 = 0x0D, // 3.7
    M42 = 0x04, // 4.2
    M58 = 0x07, // 5.8
    M58A = 0xA7, // 5.8A
    M58GC_RY = 0x090703, // 5.8GC(RY)
    M74 = 0x0B, // 7.4
    M125 = 0x0F, // 12.5
    M75 = 0x08, // 7.5A
    M75B = 0xA8, // 7.5B
    M21R = 0x11, // 2.1R
    M21A = 0xA1, // 2.1A
    M21RA = 0xB1, // 2.1RA
    M21RY = 0xE1, // 2.1RY
    M26_DA = 0x030401, // 2.6DA
    M26R = 0x16, // 2.6R
    M26RY = 0x46, // 2.6RY
    M26DE_RY = 0x0304A3, // 2.6DE(RY)
    M27R = 0x1C, // 2.7R
    M29R = 0x12, // 2.9R
    M29RY = 0x42, // 2.9RY
    M29AE_RY = 0x0401A3, // 2.9AE(RY)
    M37R = 0x1D, // 3.7R
    M37RY = 0x4D, // 3.7RY
    M15R = 0x19, // 1.5R
    M15RA = 0xB3, // 1.5RA
    M15RY_BC = 0x010203, // 1.5BC(RY)
    M42R = 0x14, // 4.2R
    M42RY_FC = 0x080603, // 4.2FC(RY)
    M58R = 0x17, // 5.8R
    M58RA = 0xB7, // 5.8AR
    M74R = 0x1B, // 7.4R
    M75R = 0x18, // 7.5RA
    M75RB = 0xB8, // 7.5RB
    M75RY_HC = 0x0A0803, // 7.5HC(RY)
    M108R_KB = 0x0B0B02, // 10.8KB(R)
    M125R = 0x1F, // 12.5R
    M125RY_JC = 0x0D0A03, // 12.5JC(RY)
    M133R = 0x1E, // 13.3R
}

// ModelType → Description(인치) 매핑 (C# Description 특성과 동일하게)
export const ModelTypeDescription: Record<number, string> = {
  0x050902: '1.3IB(R)',
  0x050903: '1.3IC(RY)',
  0x09: '1.5',
  0x01: '2.1',
  0x0C: '2.7',
  0x02: '2.9',
  0x0D: '3.7',
  0x04: '4.2',
  0x07: '5.8',
  0xA7: '5.8A',
  0x090703: '5.8GC(RY)',
  0x0B: '7.4',
  0x0F: '12.5',
  0x08: '7.5A',
  0xA8: '7.5B',
  0x11: '2.1R',
  0xA1: '2.1A',
  0xB1: '2.1RA',
  0xE1: '2.1RY',
  0x030401: '2.6DA',
  0x16: '2.6R',
  0x46: '2.6RY',
  0x0304A3: '2.6DE(RY)',
  0x1C: '2.7R',
  0x12: '2.9R',
  0x42: '2.9RY',
  0x0401A3: '2.9AE(RY)',
  0x1D: '3.7R',
  0x4D: '3.7RY',
  0x19: '1.5R',
  0xB3: '1.5RA',
  0x010203: '1.5BC(RY)',
  0x14: '4.2R',
  0x080603: '4.2FC(RY)',
  0x17: '5.8R',
  0xB7: '5.8AR',
  0x1B: '7.4R',
  0x18: '7.5RA',
  0xB8: '7.5RB',
  0x0A0803: '7.5HC(RY)',
  0x0B0B02: '10.8KB(R)',
  0x1F: '12.5R',
  0x0D0A03: '12.5JC(RY)',
  0x1E: '13.3R',
};

// TemplateEnum 추가
export enum TemplateEnum {
  Normal = 'Normal',
  Promotion = 'Promotion',
  MultiFacing = 'MultiFacing',
  TripleFacing = 'TripleFacing',
  QuadFacing = 'QuadFacing',
  Reserved = 'Reserved',
  Soldout = 'Soldout',
  Stock = 'Stock',
  StorageBox = 'StorageBox'
}

// OrientationType enum 추가
export enum OrientationType {
  Portrait,
  Landscape
}

// DirectionType enum 추가
export enum DirectionType {
  Default,
  Rotation
}

// 필요한 추가 enum들 정의
export enum AlignTypeH {
  Left,
  Center,
  Right
}

export enum AlignTypeV {
  Top,
  Middle,
  Bottom
}

export enum BorderType {
  Rectangle,
  RoundRect,
  Ellipse
}

export enum BarcodeType {
  Default,
  Code128,
  QRCode
}

export enum ReferenceType {
  None,
  Barcode,
  Text
}

export enum SizeModeType {
  Normal,
  StretchImage,
  Stretch
}

// Font 인터페이스 추가
export interface Font {
  family: string;
  size: number;
  style?: string;
}

// GlobalBooleanConverter 처리를 위한 타입 추가
export type BooleanLike = boolean | 'true' | 'false' | 0 | 1;

// StringEnum 처리를 위한 유틸리티 타입 추가
export interface StringEnum {
  [key: string]: string | number;
}
