import { CSVColumnMatch } from './CSVColumnMatch';
import { TemplateObject } from './TemplateObject';

export interface TemplateState {
  Matches: {
    Basic: CSVColumnMatch[];
  };
  Templates: {
    Objects: TemplateObject[];
  };
}
