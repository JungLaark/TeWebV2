import { TLayout } from '../types/TLayout';

export const handleTemplateFileLoad = async (): Promise<TLayout | null> => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.template';

    const file = await new Promise<File | null>((resolve) => {
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        resolve(files ? files[0] : null);
      };
      input.click();
    });

    if (!file || !file.name.toLowerCase().endsWith('.template')) {
      throw new Error('Invalid file type. Please select a .template file.');
    }

    const text = await file.text();
    const templateData = JSON.parse(text);
    
    // 기본 유효성 검사
    if (!templateData.Guid || !templateData.Name || !templateData.Model) {
      throw new Error('Invalid template format');
    }

    const layout: TLayout = {
      ...templateData,
      Objects: templateData.Objects || []
    };

    return layout;

  } catch (error) {
    console.error('Template load error:', error);
    alert(error instanceof Error ? error.message : 'Failed to load template');
    return null;
  }
};
