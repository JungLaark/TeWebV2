import React from 'react';
import { TagItem } from '../types';

interface TagListProps {
  onSelectTag: (tag: { name: string; width: number; height: number }) => void;
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

const TagList: React.FC<TagListProps> = ({ onSelectTag, selectedTag, onStateChange }) => {
  
  const handleTagClick = (tag: TagItem) => {
    onSelectTag(tag);
    // 태그 변경 시 상태 저장
    if (onStateChange) {
      onStateChange(tag.name, null);
    }
  };

  return (
    <div className="w-64 p-4 h-full flex flex-col">
      <h1 className="text-xl font-bold mb-4">Tag List</h1>
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {tagList.map((tag, index) => (
            <li
              key={index}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedTag === tag.name 
                ? 'bg-blue-600 hover:bg-blue-500' 
                : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => handleTagClick(tag)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{tag.name}</span>
              </div>
              <div className="text-sm text-gray-200 mt-1">
                {tag.width}x{tag.height}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TagList;
