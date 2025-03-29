import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CommonPopup from '../CommonPopup';
import { selectBasicMatches } from '../../../store/selectors';
import { setBasicMatches, updateColumnMatch } from '../../../store/templateSlice'; // csvMatchSlice -> templateSlice로 변경
import './ManageCSVPopup.css';

interface ManageCSVPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageCSVPopup: React.FC<ManageCSVPopupProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const matches = useSelector(selectBasicMatches) || [];

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        if (lines.length === 0) {
          console.error('CSV file is empty');
          return;
        }

        // 헤더 행 처리
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        console.log('CSV Headers:', headers); // 디버깅용

        // 초기 매칭 데이터 생성
        const initialMatches = headers.map((header, index) => ({
          Name: header,
          Desc: header,
          Type: 0,
          Key: false,
          Priority: 'Low',
          Order: index + 1,
          ViewLevel: 'Normal',
          Index: index
        }));

        console.log('Created matches:', initialMatches); // 디버깅용
        
        // Redux 상태 업데이트
        dispatch(setBasicMatches(initialMatches));
      } catch (error) {
        console.error('Error processing CSV:', error);
      }
    };

    reader.readAsText(file);
  }, [dispatch]);

  return (
    <CommonPopup
      isOpen={isOpen}
      onClose={onClose}
      title="CSV 관리"
      width={1200}
      height={800}
    >
      <div className="csv-popup-content">
        <div className="csv-tools">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            id="csvFileInput"
            className="hidden"
          />
          <label htmlFor="csvFileInput" className="tool-button">
            CSV 파일 불러오기
          </label>
        </div>

        <div className="csv-main-content">
          {/* Left: CSV Column Table */}
          <div className="csv-table">
            {matches.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Name</th>
                    <th>Key(Barcode)</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match, index) => (
                    <tr key={index}>
                      <td className="text-center">{match.Order}</td>
                      <td className="read-only">{match.Name}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={match.Key}
                          onChange={() => {
                            dispatch(updateColumnMatch({ 
                              index, 
                              match: { ...match, Key: !match.Key }
                            }));
                          }}
                          className="checkbox-center"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={match.Desc}
                          onChange={(e) => {
                            dispatch(updateColumnMatch({
                              index,
                              match: { ...match, Desc: e.target.value }
                            }));
                          }}
                        />
                      </td>
                      <td>
                        <select
                          value={match.Type}
                          onChange={(e) => {
                            dispatch(updateColumnMatch({
                              index,
                              match: { ...match, Type: parseInt(e.target.value) }
                            }));
                          }}
                        >
                          <option value={0}>Text</option>
                          <option value={1}>Image</option>
                          <option value={2}>ImageCode</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={match.Priority}
                          onChange={(e) => {
                            dispatch(updateColumnMatch({
                              index,
                              match: { ...match, Priority: e.target.value }
                            }));
                          }}
                        >
                          <option value="High">High</option>
                          <option value="Low">Low</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data-message">
                CSV 파일을 불러와주세요.
              </div>
            )}
          </div>

          {/* Right: Special Column Settings */}
          <div className="special-column-settings">
            <h3>Special Column 설정</h3>
            {matches.length > 0 ? (
              <select
                value={matches.find(match => match.Key)?.Name || ''}
                onChange={(e) => {
                  const updatedMatches = matches.map(match => ({
                    ...match,
                    Key: match.Name === e.target.value
                  }));
                  dispatch(setBasicMatches(updatedMatches));
                }}
              >
                <option value="">Select Column</option>
                {matches.map((match, index) => (
                  <option key={index} value={match.Name}>
                    {match.Name}
                  </option>
                ))}
              </select>
            ) : (
              <p>CSV 파일을 먼저 불러와주세요.</p>
            )}
          </div>
        </div>
      </div>
    </CommonPopup>
  );
};

export default ManageCSVPopup;
