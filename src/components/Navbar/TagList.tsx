import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TLayout, ModelType, OrientationType, DirectionType } from '../../types';
import { isPortrait } from '../../utils/orientationUtils';
import tagList from '../../types/tagList';
import { useContextMenu } from '../ContextMenu/ContextMenuProvider';
import './Navbar.css';

interface TagListProps {
  onSelectTag: (tag: TLayout) => void;
  selectedTag?: string;
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

  const handleTagClick = (tag: { name: string; width: number; height: number }) => {
    const model = ModelType.M21;
    const orientation = isPortrait(model) ? OrientationType.Portrait : OrientationType.Landscape;

    const tagItem: TLayout = {
      Guid: `tag_${Date.now()}`,
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

  const { showContextMenu } = useContextMenu();

  const handleContextMenu = useCallback((e: React.MouseEvent, tag: { name: string; width: number; height: number }) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, {
      onEdit: () => console.log('Edit tag:', tag.name),
      onCopy: () => console.log('Copy tag:', tag.name),
      onDelete: () => console.log('Delete tag:', tag.name),
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
                  <div
                    key={index}
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
