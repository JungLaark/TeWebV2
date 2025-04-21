import { TLayout } from './TLayout';
import { CSVColumnMatch } from './CSVColumnMatch';

export interface TemplateState {
  currentTemplate: TLayout | null;
  templates: TLayout[];  // 모든 템플릿 목록
  isLoading: boolean;
  error: string | null;
  Matches: {
    Basic: CSVColumnMatch[];
  };
}
