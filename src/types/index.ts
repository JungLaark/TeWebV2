export interface TagItem {
  Guid: string;
  Name: string;
  Model: number;
  DisplayName: string;
  Bookmark: boolean;
  ModelName: string;
  Width: number;
  Height: number;
  Orientation: number;
  Direction: number;
  Upsidedown: boolean;
  Column: number;
  Row: number;
  BGColor: string;
  TWidth: number;
  THeight: number;
  Default: boolean;
  TType: string;
  TValue: string;
  PValue: string;
}

export interface CanvasObjectProperties {
  id: string;  // 선택적(?)에서 필수로 변경
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
  Font: string;
  Text: string | null;
  Align: number;
  VAlign: number;
  DataName: string | null;
  ShowBarcodeLabel: boolean;
  ShowBoarder: boolean;
  ArcsWidth: number;
  Margin: number;
  Arrow: number;
  ArrowSize: number;
  BorderShape: number;
  Newline: string;
  Subject: string;
  CodeType: number;
  Reference: number;
  SizeMode: number;
  ProductID: number;
  MultiFacingMode: boolean;
  SingleLine: boolean;
  LineHeight: number;
  ImageBase64: string | null;
}

export interface CSVColumnMatch {
  Desc: string;
  Type: number;
  ViewLevel: string;
  Index: number;
  Key: boolean;
  Name: string;
}

export interface TemplateObject {
  tagName: string;
  objects: CanvasObjectProperties[];
}

export interface TemplateState {
  Matches: {
    Basic: CSVColumnMatch[];
  };
  Templates: {
    Objects: TemplateObject[];
  };
}