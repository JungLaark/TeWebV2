import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TLayout, ModelType, OrientationType, DirectionType, TemplateType } from '../../types';
import { isPortrait } from '../../utils/orientationUtils';
import tagList from '../../types/tagList';
import { useContextMenu } from '../ContextMenu/ContextMenuProvider';
import { uniqueCode } from '../../utils/commonUtils';
import './Navbar.css';

interface TagListProps {
  onSelectTag: (tag: TLayout) => void;
  selectedTag?: string;
}

interface SubTag extends TLayout {
  parentName: string;
}

// Categorize tags into groups
const categorizeTag = (name: string) => {
  if (name.includes('R') && name.includes('Y')) {
    return '4Color';
  } else if (name.includes('R') && !name.includes('Y')) {
    return '3Color';
  } else if (!name.includes('R') && !name.includes('Y')) {
    return '2Color';
  }
  return 'Other';
};

const TagList: React.FC<TagListProps> = ({ onSelectTag, selectedTag }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    '2Color': true,
    '3Color': true,
    '4Color': true,
  });
  
  const [subTags, setSubTags] = useState<SubTag[]>([]);

  const extractNumber = (str: string) => {
    const match = str.match(/\d+\.?\d*/);
    return match ? parseFloat(match[0]) : 0;
  };

  const categorizedTags = tagList.reduce((acc, tag) => {
    const category = categorizeTag(tag.name);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {} as Record<string, typeof tagList>);

  Object.keys(categorizedTags).forEach(category => {
    categorizedTags[category].sort((a, b) => extractNumber(a.name) - extractNumber(b.name));
  });

  const categoryOrder = ['2Color', '3Color', '4Color'];

  const getModelTypeFromTagName = (tagName: string): ModelType => {
    // tagList의 tagName과 TLayout의 ModelType 매핑
    switch(tagName) {
      case '1.3IB(R)': return ModelType.M13R_IB;
      case '1.3IC(RY)': return ModelType.M13RY_IC;
      case '1.5': return ModelType.M15;
      case '2.1': return ModelType.M21;
      case '2.7': return ModelType.M27;
      case '2.9': return ModelType.M29;
      case '3.7': return ModelType.M37;
      case '4.2': return ModelType.M42;
      case '5.8': return ModelType.M58;
      case '5.8A': return ModelType.M58A;
      case '5.8GC(RY)': return ModelType.M58GC_RY;
      case '7.4': return ModelType.M74;
      case '12.5': return ModelType.M125;
      case '7.5A': return ModelType.M75;
      case '7.5B': return ModelType.M75B;
      case '2.1R': return ModelType.M21R;
      case '2.1A': return ModelType.M21A;
      case '2.1RA': return ModelType.M21RA;
      case '2.1RY': return ModelType.M21RY;
      // ... 나머지 모델들도 동일하게 매핑
      default: return ModelType.M21;
    }
  };

  const handleTagClick = (tag: { name: string; width: number; height: number }) => {
    const model = getModelTypeFromTagName(tag.name);
    const orientation = isPortrait(model) ? OrientationType.Portrait : OrientationType.Landscape;

    const tagItem: TLayout = {
      Guid: uniqueCode(), // 임의의 GUID 대신 uniqueCode 사용
      Name: tag.name,
      Model: model,
      DisplayName: tag.name,
      Bookmark: false,
      Width: tag.width,
      Height: tag.height,
      Orientation: orientation,
      Direction: DirectionType.Default,
      Upsidedown: false,
      Column: 1,
      Row: 1,
      BGColor: 'White',
      TWidth: tag.width,
      THeight: tag.height,
      Default: false,
      TType: 'Normal',
      TValue: '',
      Objects: [],
    };

    onSelectTag(tagItem);
  };

  const addSubTag = useCallback((parentTag: string, newTag: TLayout) => {
    setSubTags(prev => {
      // 중복 체크
      const exists = prev.some(tag => 
        tag.parentName === parentTag && 
        tag.TType === TemplateType.Reserved &&
        tag.TValue === '1'
      );

      if (exists) {
        alert('Page1 already exists for this tag!');
        return prev;
      }

      return [...prev, { ...newTag, parentName: parentTag }];
    });
  }, []);

  const getSubTags = (tagName: string) => {
    return subTags.filter(tag => tag.parentName === tagName);
  };

  const { showContextMenu } = useContextMenu();

  const handleContextMenu = useCallback((e: React.MouseEvent, tag: { name: string; width: number; height: number }) => {
    e.preventDefault();
    const modelType = getModelTypeFromTagName(tag.name);
    
    showContextMenu(e.clientX, e.clientY, {
      tagName: tag.name,
      tagWidth: tag.width,
      tagHeight: tag.height,
      tagGuid: uniqueCode(),
      modelType: modelType,
      onAddSubTag: (parentTagName: string, newLayout: TLayout) => {
        setSubTags(prev => [...prev, { ...newLayout, parentName: parentTagName }]);
      }
    });
  }, [showContextMenu]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {categoryOrder.map(category => (
        categorizedTags[category] && (
          <div key={category} className="min-h-0"> {/* flex-1 제거, min-h-0 유지 */}
            <button
              onClick={() => setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }))}
              className="w-full flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 transition-colors sticky top-0 z-10"
            >
              <span className="text-sm font-medium">{category}</span>
              {openCategories[category] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {openCategories[category] && (
              <div className="flex flex-col gap-0.5 overflow-y-auto category-section scrollbar-thin">
                {categorizedTags[category].map((tag, index) => (
                  <div key={index}>
                    <div
                      className={`w-full p-1.5 rounded-lg cursor-pointer transition-colors ${
                        selectedTag === tag.name
                          ? 'bg-blue-600 hover:bg-blue-500'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => handleTagClick(tag)}
                      onContextMenu={(e) => handleContextMenu(e, tag)}
                    >
                      <div className="text-sm flex items-center justify-between">
                        <span className="font-medium">{tag.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">
                            {isPortrait(ModelType.M21) ? 'Portrait' : 'Landscape'}
                          </span>
                          <span className="text-xs text-gray-300">
                            ({tag.width}x{tag.height})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {getSubTags(tag.name).map((subTag, subIndex) => (
                        <div
                          key={subIndex}
                          data-parent={tag.name}
                          data-type={subTag.TType === TemplateType.Reserved ? 'Page1' : subTag.TType}
                          className="w-full p-1.5 mt-0.5 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors"
                          onClick={() => handleTagClick(subTag)}
                        >
                          <div className="text-sm flex items-center justify-between">
                            <span className="font-medium">{subTag.Name}</span>
                            <span className="text-xs text-gray-400">{subTag.TType}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ))}
    </div>
  );
};

export default TagList;
