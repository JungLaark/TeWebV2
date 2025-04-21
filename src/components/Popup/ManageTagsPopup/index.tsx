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

  useEffect(() => {
    if (isOpen) {
      setTagOrientations({});
    }
  }, [isOpen, orientation]);

  const isSelected = (tagName: string) => selectedTags.some(tag => tag.name === tagName);

  const handleToggleTag = (tagName: string) => {
    dispatch(toggleSelectedTag(tagName));
  };

  const handleOrientationChange = (tagName: string, orientation: 'horizontal' | 'vertical') => {
    setTagOrientations(prev => ({ ...prev, [tagName]: orientation }));
  };

  // 태그 분류 함수
  const categorizeTag = (name: string) => {
    if (name.includes('R') && name.includes('Y')) return '4Color';
    if (name.includes('R')) return '3Color';
    return '2Color';
  };

  // 검색된 태그만 필터링
  const filteredAvailableTags = searchText.trim() === ''
    ? availableTags
    : availableTags.filter(tag => tag.name.toLowerCase().includes(searchText.toLowerCase()));

  // 카테고리별로 태그 그룹화 (검색 결과 기준)
  const categorizedTags: Record<string, typeof availableTags> = {
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

  // 전체 선택/해제 핸들러
  const handleSelectAll = () => {
    availableTags.forEach(tag => {
      if (!isSelected(tag.name)) dispatch(toggleSelectedTag(tag.name));
    });
  };
  const handleDeselectAll = () => {
    availableTags.forEach(tag => {
      if (isSelected(tag.name)) dispatch(toggleSelectedTag(tag.name));
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
        <div className="popup-content">
          {/* 전체 선택/해제 + 검색 + 탭 */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleSelectAll} style={{ padding: '4px 12px' }}>전체 선택</button>
            <button onClick={handleDeselectAll} style={{ padding: '4px 12px' }}>전체 해제</button>
            <input
              type="text"
              placeholder="태그 검색"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: '4px 8px', borderRadius: 4, border: '1px solid #aaa', background: '#23272f', color: 'white' }}
            />
            <button onClick={() => setSearchText(searchText)} style={{ padding: '4px 12px' }}>검색</button>
          </div>
          {/* 탭 UI */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            {tabCategories.map(category => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                style={{
                  padding: '6px 18px',
                  borderRadius: 6,
                  border: 'none',
                  background: activeTab === category ? '#4299e1' : '#23272f',
                  color: activeTab === category ? 'white' : '#b5b5b5',
                  fontWeight: activeTab === category ? 700 : 400,
                  fontSize: '1em',
                  cursor: 'pointer',
                  boxShadow: activeTab === category ? '0 2px 8px #3182ce33' : 'none',
                  transition: 'all 0.15s',
                  minWidth: 90
                }}
              >
                {category} <span style={{ color: '#90cdf4', fontWeight: 400 }}>({categorizedTags[category].length}개)</span>
              </button>
            ))}
          </div>
          {/* 선택된 탭의 태그만 렌더링 */}
          {categorizedTags[activeTab].length === 0 ? (
            <div style={{ color: '#b5b5b5', padding: '2rem 0', textAlign: 'center' }}>
              해당 카테고리에 태그가 없습니다.
            </div>
          ) : (
            categorizedTags[activeTab].map(tag => (
              <div key={tag.name} className="tag-item" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="checkbox"
                    checked={isSelected(tag.name)}
                    onChange={() => handleToggleTag(tag.name)}
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ minWidth: 160, fontWeight: 500, wordBreak: 'break-all' }}>{tag.name}</span>
                </label>
                <span style={{ minWidth: 80, textAlign: 'right', color: '#b5b5b5', fontSize: '0.98em' }}>{tag.width} x {tag.height}</span>
                <div className="orientation-select" style={{ marginLeft: 16, display: 'inline-block' }}>
                  <label style={{ marginRight: 8 }}>
                    <input
                      type="radio"
                      name={`orientation-${tag.name}`}
                      value="horizontal"
                      checked={
                        tagOrientations[tag.name] !== undefined
                          ? tagOrientations[tag.name] === 'horizontal'
                          : orientation === 'horizontal'
                      }
                      onChange={() => handleOrientationChange(tag.name, 'horizontal')}
                    />
                    가로
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`orientation-${tag.name}`}
                      value="vertical"
                      checked={
                        tagOrientations[tag.name] !== undefined
                          ? tagOrientations[tag.name] === 'vertical'
                          : orientation === 'vertical'
                      }
                      onChange={() => handleOrientationChange(tag.name, 'vertical')}
                    />
                    세로
                  </label>
                </div>
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