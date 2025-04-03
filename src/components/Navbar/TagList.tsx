import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TLayout, ModelType, OrientationType, DirectionType } from '../../types';
import { isPortrait } from '../../utils/orientationUtils';
import tagList from '../../types/tagList'; // Import tagList

interface TagListProps {
  onSelectTag: (tag: TLayout) => void;
  selectedTag?: string;
}

// 태그 분류 함수
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
        '3Color': false,
        '4Color': false
    });

    // 숫자를 추출하는 헬퍼 함수 추가
    const extractNumber = (str: string) => {
      const match = str.match(/\d+\.?\d*/);
      return match ? parseFloat(match[0]) : 0;
    };

    // 태그 목록을 카테고리별로 분류하고 정렬
    const categorizedTags = tagList.reduce((acc, tag) => {
        const category = categorizeTag(tag.name);
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(tag);
        return acc;
      }, {} as Record<string, typeof tagList>);

    // 각 카테고리 내부의 태그들을 숫자 기준으로 정렬
    Object.keys(categorizedTags).forEach(category => {
      categorizedTags[category].sort((a, b) => extractNumber(a.name) - extractNumber(b.name));
    });

    // 카테고리 순서 정의
    const categoryOrder = ['2Color', '3Color', '4Color'];

  const handleTagClick = (tag: { name: string, width: number, height: number }) => {
    const model = ModelType.M21; // 기본값 설정
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
      BGColor: "White",
      TWidth: tag.width,
      THeight: tag.height,
      Default: false,
      TType: "Normal",
      TValue: "",
      Objects: []
    };

    onSelectTag(tagItem);
  };

  // 스크롤 이벤트 핸들러 추가
  const handleWheel = (e: React.WheelEvent) => {
    const element = e.currentTarget;
    if (
      (element.scrollTop === 0 && e.deltaY < 0) ||
      (element.scrollHeight - element.scrollTop === element.clientHeight && e.deltaY > 0)
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="h-full overflow-y-auto" onWheel={handleWheel}>
      <div className="p-4">
        {/* categoryOrder로 순서 보장하도록 수정 */}
        {categoryOrder.map(category => (
          categorizedTags[category] && (
            <div key={category} className="mb-2">
              <button
                onClick={() => setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                className="w-full flex items-center justify-between p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors mb-1"
              >
                <span className="text-sm font-medium">{category}</span>
                {openCategories[category] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openCategories[category] && (
                <div className="flex flex-col gap-0.5 pl-1">
                  {categorizedTags[category].map((tag, index) => (
                    <div
                      key={index}
                      className={`w-full p-1.5 rounded-lg cursor-pointer transition-colors ${
                        selectedTag === tag.name
                          ? 'bg-blue-600 hover:bg-blue-500'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => handleTagClick(tag)}
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
    </div>
  );
};

export default TagList;
