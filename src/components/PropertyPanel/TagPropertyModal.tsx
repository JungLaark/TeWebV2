import React from 'react';
import '../../components/Popup/CommonPopup/CommonPopup.css';
import { TLayout, ModelType, OrientationType, DirectionType } from '../../types/TLayout';
import { useDispatch, useSelector } from 'react-redux';
import { setTemplates } from '../../store/features/templateSlice';

interface TagPropertyModalProps {
  open: boolean;
  selectedTag: TLayout | null;
  onUpdateTag: (updated: TLayout) => void;
  onClose: () => void;
}

const TagPropertyModal: React.FC<TagPropertyModalProps> = ({ open, selectedTag, onUpdateTag, onClose }) => {
  const dispatch = useDispatch();
  const templates = useSelector((state: any) => state.template.templates);
  const [pendingTag, setPendingTag] = React.useState(selectedTag);

  React.useEffect(() => {
    setPendingTag(selectedTag);
  }, [selectedTag, open]);

  const handleSaveAndClose = () => {
    if (pendingTag) {
      dispatch(setTemplates(
        templates.map((t: any) => t.Guid === pendingTag.Guid ? pendingTag : t)
      ));
      onUpdateTag(pendingTag);
    }
    onClose();
  };

  // enum 옵션
  const modelOptions = Object.entries(ModelType)
    .filter(([k, v]) => typeof v === 'number')
    .map(([k, v]) => ({ label: k, value: v }));

  if (!open) return null;
  return (
    <div className="popup-overlay" style={{ zIndex: 10001 }}>
      <div className="popup-content" style={{  minWidth: 360, maxWidth: 480, width: '100%', background: '#23272f', position: 'relative' }}>
        <div className="tag-property-panel p-4 bg-gray-800 h-full flex flex-col gap-4 min-w-[320px] max-w-[400px] border-x border-gray-700">
          <h2 className="text-lg font-bold mb-2">태그 속성</h2>
          <div className="flex flex-col gap-3">
            {/* 1. 모델 */}
            <label className="flex flex-col text-sm">
              모델
              <select
                value={pendingTag?.Model ?? ''}
                onChange={e => setPendingTag(pendingTag && { ...pendingTag, Model: Number(e.target.value) })}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 mt-1"
              >
                {modelOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            {/* 2. 이름 */}
            <label className="flex flex-col text-sm">
              이름
              <input
                type="text"
                value={pendingTag?.Name ?? ''}
                onChange={e => setPendingTag(pendingTag && { ...pendingTag, Name: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 mt-1"
              />
            </label>
            {/* 3. TValue */}
            <label className="flex flex-col text-sm">
              TValue
              <input
                type="text"
                value={pendingTag?.TValue ?? ''}
                onChange={e => setPendingTag(pendingTag && { ...pendingTag, TValue: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 mt-1"
              />
            </label>
            {/* 4. 기본 템플릿 */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!pendingTag?.Default}
                onChange={e => setPendingTag(pendingTag && { ...pendingTag, Default: e.target.checked })}
              />
              기본 템플릿
            </label>
            {/* 5. 너비 */}
            <label className="flex flex-col text-sm">
              너비
              <input
                type="number"
                value={pendingTag?.Width ?? ''}
                onChange={e => setPendingTag(pendingTag && { ...pendingTag, Width: Number(e.target.value) })}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 mt-1"
              />
            </label>
            {/* 6. 높이 */}
            <label className="flex flex-col text-sm">
              높이
              <input
                type="number"
                value={pendingTag?.Height ?? ''}
                onChange={e => setPendingTag(pendingTag && { ...pendingTag, Height: Number(e.target.value) })}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 mt-1"
              />
            </label>
            {/* 7. 기본방향 */}
            <label className="flex flex-col text-sm">
              기본방향
              <select
                value={pendingTag?.Direction ?? ''}
                onChange={e => setPendingTag(pendingTag && { ...pendingTag, Direction: Number(e.target.value) })}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 mt-1"
              >
                <option value={DirectionType.Default}>기본</option>
                <option value={DirectionType.Rotation}>오른쪽으로 회전</option>
              </select>
            </label>
            {/* 8. 방향 */}
            <label className="flex flex-col text-sm">
              방향
              <select
                value={pendingTag?.Orientation ?? ''}
                onChange={e => setPendingTag(pendingTag && { ...pendingTag, Orientation: Number(e.target.value) })}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 mt-1"
              >
                <option value={OrientationType.Landscape}>가로모드</option>
                <option value={OrientationType.Portrait}>세로모드</option>
              </select>
            </label>
            {/* 9. 위아래 반대 */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!pendingTag?.Upsidedown}
                onChange={e => setPendingTag(pendingTag && { ...pendingTag, Upsidedown: e.target.checked })}
              />
              위아래 반대
            </label>
          </div>
        </div>
        {/* 하단에 닫기 버튼 - 고정 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, position: 'sticky', bottom: 0, background: '#23272f', zIndex: 2, paddingBottom: 8, paddingTop: 8 }}>
          <button onClick={handleSaveAndClose} className="close-button" style={{ minWidth: 80, fontSize: 16, padding: '8px 20px', borderRadius: 6, background: '#334155', color: '#fff', border: 'none', cursor: 'pointer', position: 'static', transition: 'none' }}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default TagPropertyModal;
