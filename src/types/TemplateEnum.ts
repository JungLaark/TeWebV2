export enum TemplateType {
  Normal = 'Normal',           // 기본 템플릿
  Reserved = 'Reserved',       // Page1, Page2, Page3용
  Promotion = 'Promotion',     // 프로모션
  MultiFacing = 'MultiFacing', // 2 Divisions
  TripleFacing = 'TripleFacing', // 3 Divisions
  QuadFacing = 'QuadFacing',  // 4 Divisions
  Stock = 'Stock',            // 재고
  Soldout = 'Soldout',        // 품절
  StorageBox = 'StorageBox',  // 보관함
  POP = 'POP'                 // POP 타입
}

// 각 템플릿 타입별 TValue 설정
export const getDefaultTValue = (type: TemplateType, pageNumber?: number): string => {
  switch (type) {
    case TemplateType.Reserved:
      return pageNumber?.toString() || '1';
    case TemplateType.MultiFacing:
      return '2';
    case TemplateType.TripleFacing:
      return '3';
    case TemplateType.QuadFacing:
      return '4';
    default:
      return '';
  }
};
