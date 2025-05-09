import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { toggleSelectedTag } from '../../../store/features/selectedTagsSlice';
import './ManageTagsPopup.css';

interface ManageTagsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  orientation: 'horizontal' | 'vertical';
}

const ManageTagsPopup: React.FC<ManageTagsPopupProps> = ({ isOpen, onClose, orientation }) => {
  const dispatch = useDispatch();
  const availableTags = useSelector((state: RootState) => state.selectedTags.availableTags);
  const selectedTags = useSelector((state: RootState) => state.selectedTags.selectedTags);

  const [tagOrientations, setTagOrientations] = useState<{ [tagName: string]: 'horizontal' | 'vertical' }>({});
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'2Color' | '3Color' | '4Color'>('4Color');

  console.log('[ManageTagsPopup] availableTags:', availableTags);
  console.log('[ManageTagsPopup] selectedTags:', selectedTags);


  useEffect(() => {
    if (isOpen) {
      setTagOrientations({});
    }
  }, [isOpen, orientation]);

// 1. 모델 단위로 중복 제거
const uniqueAvailableTags = Array.from(
  new Map(
    availableTags.map(tag => [`${tag.name}_${tag.width}_${tag.height}`, tag])
  ).values()
);

// 2. 선택 여부 체크 (모델 단위)
const isSelected = (name: string, width: number, height: number) =>
  selectedTags.some(tag => tag.name === name && tag.width === width && tag.height === height);

// 3. 선택/해제 핸들러 (모델 단위)
const handleToggleTag = (name: string, width: number, height: number) => {
  dispatch(toggleSelectedTag({ name, width, height }));
};

// 태그 분류 함수
const categorizeTag = (name: string) => {
  if (name.includes('R') && name.includes('Y')) return '4Color';
  if (name.includes('R')) return '3Color';
  return '2Color';
};

// 4. 검색된 태그만 필터링 (uniqueAvailableTags 사용)
const filteredAvailableTags = searchText.trim() === ''
  ? uniqueAvailableTags
  : uniqueAvailableTags.filter(tag => tag.name.toLowerCase().includes(searchText.toLowerCase()));

// 5. 카테고리별로 태그 그룹화 (검색 결과 기준)
const categorizedTags: Record<string, typeof uniqueAvailableTags> = {
  '2Color': [],
  '3Color': [],
  '4Color': [],
};
filteredAvailableTags.forEach(tag => {
  const category = categorizeTag(tag.name);
  categorizedTags[category].push(tag);
});

// 탭 카테고리 배열
const tabCategories: Array<'4Color' | '3Color' | '2Color'> = ['4Color', '3Color', '2Color'];

// 6. 전체 선택/해제 핸들러 (uniqueAvailableTags 기준)
const handleSelectAll = () => {
  uniqueAvailableTags.forEach(tag => {
    if (!isSelected(tag.name, tag.width, tag.height)) dispatch(toggleSelectedTag({ name: tag.name, width: tag.width, height: tag.height }));
  });
};
const handleDeselectAll = () => {
  uniqueAvailableTags.forEach(tag => {
    if (isSelected(tag.name, tag.width, tag.height)) dispatch(toggleSelectedTag({ name: tag.name, width: tag.width, height: tag.height }));
  });
};

  if (!isOpen) return null;

  return (
    <div className="manage-tags-popup-overlay">
      <div className="manage-tags-popup">
        <header className="popup-header">
          <h2>Manage Tags</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </header>
        <div className="manage-tags-popup-content">
          {/* 전체 선택/해제 + 검색 + 탭 */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleSelectAll} className="manage-tags-action-btn">전체 선택</button>
            <button onClick={handleDeselectAll} className="manage-tags-action-btn">전체 해제</button>
            <input
              type="text"
              placeholder="태그 검색"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="manage-tags-search"
            />
            <button onClick={() => setSearchText(searchText)} className="manage-tags-action-btn">검색</button>
          </div>
          {/* 탭 UI */}
          <div className="manage-tags-tab-row">
            {tabCategories.map(category => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`manage-tags-tab${activeTab === category ? ' active' : ''}`}
              >
                {category} <span className="manage-tags-tab-count">({categorizedTags[category].length}개)</span>
              </button>
            ))}
          </div>
          {/* 선택된 탭의 태그만 렌더링 */}
          {categorizedTags[activeTab].length === 0 ? (
            <div className="manage-tags-empty">해당 카테고리에 태그가 없습니다.</div>
          ) : (
            categorizedTags[activeTab].map(tag => (
              <div key={`${tag.name}_${tag.width}_${tag.height}`} className="manage-tags-tag-item">
                <label className="manage-tags-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isSelected(tag.name, tag.width, tag.height)}
                    onChange={() => handleToggleTag(tag.name, tag.width, tag.height)}
                  />
                  <span className="manage-tags-tag-name">{tag.name}</span>
                </label>
                <span className="manage-tags-tag-size">{tag.width} x {tag.height}</span>
              </div>
            ))
          )}
        </div>
        <footer className="popup-footer">
          <button className="save-button" onClick={onClose}>
            Save
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ManageTagsPopup;