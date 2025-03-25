import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TagItem } from '../types';

interface TagListProps {
  onSelectTag: (tag: TagItem) => void;
  selectedTag?: string;
  onStateChange?: (tagName: string, state: any) => void; // 상태 변경 콜백 추가
}

const tagList = [
  { name: "1.3IB(R)", width: 144, height: 200 },
  { name: "1.3IC(RY)", width: 144, height: 200 },
  { name: "1.5", width: 152, height: 152 },
  { name: "2.1", width: 212, height: 104 },
  { name: "2.7", width: 264, height: 176 },
  { name: "2.9", width: 296, height: 128 },
  { name: "3.7", width: 416, height: 240 },
  { name: "4.2", width: 400, height: 300 },
  { name: "5.8", width: 600, height: 448 },
  { name: "5.8A", width: 648, height: 480 },
  { name: "5.8GC(RY)", width: 648, height: 480 },
  { name: "7.4", width: 480, height: 800 },
  { name: "12.5", width: 1304, height: 984 },
  { name: "7.5A", width: 384, height: 640 },
  { name: "7.5B", width: 480, height: 800 },
  { name: "2.1R", width: 212, height: 104 },
  { name: "2.1A", width: 250, height: 122 },
  { name: "2.1RA", width: 250, height: 122 },
  { name: "2.1RY", width: 250, height: 122 },
  { name: "2.6DA", width: 296, height: 152 },
  { name: "2.6R", width: 296, height: 152 },
  { name: "2.6RY", width: 296, height: 152 },
  { name: "2.6DE(RY)", width: 296, height: 152 },
  { name: "2.7R", width: 264, height: 176 },
  { name: "2.9R", width: 296, height: 128 },
  { name: "2.9RY", width: 296, height: 128 },
  { name: "2.9AE(RY)", width: 296, height: 128 },
  { name: "3.7R", width: 416, height: 240 },
  { name: "3.7RY", width: 416, height: 240 },
  { name: "1.5R", width: 152, height: 152 },
  { name: "1.5RA", width: 200, height: 200 },
  { name: "1.5BC(RY)", width: 200, height: 200 },
  { name: "4.2R", width: 400, height: 300 },
  { name: "4.2FC(RY)", width: 400, height: 300 },
  { name: "5.8R", width: 600, height: 448 },
  { name: "5.8AR", width: 648, height: 480 },
  { name: "7.4R", width: 480, height: 800 },
  { name: "7.5RA", width: 384, height: 640 },
  { name: "7.5RB", width: 480, height: 800 },
  { name: "7.5HC(RY)", width: 480, height: 800 },
  { name: "10.8KB(R)", width: 1360, height: 480 },
  { name: "12.5R", width: 1304, height: 984 },
  { name: "12.5JC(RY)", width: 1304, height: 984 },
  { name: "13.3R", width: 1200, height: 1600 },
];

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

const TagList: React.FC<TagListProps> = ({ onSelectTag, selectedTag, onStateChange }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    '2Color': true,
    '3Color': false,
    '4Color': false
  });

  // 숫자를 추출하는 헬퍼 함수
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

  // 카테고리 토글 핸들러
  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleTagClick = (tag: TagItem) => {
    onSelectTag(tag);
    // 태그 변경 시 상태 저장
    if (onStateChange) {
      onStateChange(tag.name, null);
    }
  };

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
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        {categoryOrder.map(category => (
          categorizedTags[category] && (
            <div key={category} className="mb-2">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors mb-1"
              >
                <span className="text-sm font-medium">
                  {category} ({categorizedTags[category].length})
                </span>
                {openCategories[category] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openCategories[category] && (
                <div className="flex flex-col gap-0.5 pl-1"> {/* gap과 padding 줄임 */}
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
                        <span className="text-xs text-gray-300">
                          ({tag.width}x{tag.height})
                        </span>
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
