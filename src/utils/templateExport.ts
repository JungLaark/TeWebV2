import { TemplateState } from '../types';

export const exportTemplate = (templateData: TemplateState) => {
  // 객체가 비어있는지 확인
  if (!templateData.Matches?.Basic?.length && !templateData.Templates?.Objects?.length) {
    console.error('Template data is empty');
    return;
  }

  try {
    const blob = new Blob([JSON.stringify(templateData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('Template saved:', templateData);
  } catch (error) {
    console.error('Error saving template:', error);
  }
};
