import React from 'react';
import { useSelector } from 'react-redux';
import { TLayout } from '../../types';
import { RootState } from '../../store';
import './Navbar.css';

interface TagListProps {
  onSelectTag: (tag: TLayout) => void;
  selectedTag?: string;
}

const TagList: React.FC<TagListProps> = ({ onSelectTag, selectedTag }) => {
  // 선택된 태그만 가져옴
  const selectedTags = useSelector((state: RootState) => state.selectedTags.selectedTags);
  // 전체 TLayout 목록 가져오기 (templateSlice의 templates)
  const tLayoutList = useSelector((state: RootState) => state.template.templates);
  console.log('tLayoutList:', tLayoutList);

  return (
    <div className="taglist-wrapper">
      {selectedTags.length === 0 ? (
        <div className="text-gray-400 text-sm p-4">선택된 태그가 없습니다.</div>
      ) : (
        selectedTags.map((tag) => {
          // tag.name과 일치하는 TLayout 찾기
          const layout = tLayoutList.find(
            (l: TLayout) =>
              l.Name?.toLowerCase().includes(tag.name.trim().toLowerCase())
          );
          if (!layout) {
            console.log('layout undefined! tag:', tag, 'tLayoutList:', tLayoutList);
          }
          return (
            <div
              key={tag.name}
              className={`template-item ${selectedTag === tag.name ? 'template-selected' : 'template-normal'}`}
              onClick={() => {
                console.log('Tag 클릭:', tag, 'layout:', layout);
                if (layout) onSelectTag(layout);
              }}
            >
              <div className="text-sm flex items-center justify-between gap-2">
                <span className="font-bold truncate">{tag.name}</span>
                <span className="text-xs text-gray-400">
                  {(tag.width > tag.height ? '가로' : tag.width < tag.height ? '세로' : '정방형')} {tag.width > 0 ? tag.width : '?'}x{tag.height > 0 ? tag.height : '?'}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TagList;
