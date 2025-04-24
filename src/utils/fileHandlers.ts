import { TLayout } from '../types/TLayout';
import { store } from '../store';
import { setTemplates } from '../store/features/templateSlice';

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
    
    // 템플릿 데이터 구조 로깅
    console.log('Loaded template data structure:', templateData);
    
    // Templates 배열이 있는 경우 처리
    if (templateData.Templates && Array.isArray(templateData.Templates)) {
      // TLayout 객체만 필터링 (Name, Guid, Objects 필드가 있는 것만)
      const tLayouts = templateData.Templates.filter(
        t => t.Name && t.Guid && Array.isArray(t.Objects)
      ).map(t => ({
        ...t,
        Objects: t.Objects ? [...t.Objects] : [] // 깊은 복사(1차원)
      }));
      console.log('Filtered TLayout templates:', tLayouts);
      store.dispatch(setTemplates(tLayouts));
    }
    // 단일 템플릿인 경우 처리
    else if (templateData.Name && templateData.Model) {
      console.log('Found single template:', templateData);
      store.dispatch(setTemplates([{ ...templateData, Objects: templateData.Objects ? [...templateData.Objects] : [] }]));
    }
    // 기타 구조인 경우 더 자세한 로깅
    else {
      console.log('Unknown template structure:', templateData);
      console.log('Available keys:', Object.keys(templateData));
      store.dispatch(setTemplates([]));
    }

    // 기본 유효성 검사
    if (!templateData.Matches || !templateData.Templates) {
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
