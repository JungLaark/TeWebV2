import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CommonPopup from '../CommonPopup';
import { selectBasicMatches } from '../../../store/selectors';
import { updateBasicMatches, updateColumnMatch } from '../../../store/csvMatchSlice';
import './ManageCSVPopup.css';

interface ManageCSVPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageCSVPopup: React.FC<ManageCSVPopupProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const matches = useSelector(selectBasicMatches);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const headers = text.split('\n')[0]
          .split(',')
          .map(header => header.trim().replace(/"/g, ''));

        const initialMatches = headers.map((header, index) => ({
          Name: header,
          Desc: header,
          Type: 0,
          Key: false,
          Priority: 'Low',
          Order: index + 1
        }));

        dispatch(updateBasicMatches({ matches: initialMatches }));
      };
      reader.readAsText(file);
    }
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
          {/* 왼쪽: CSV 컬럼 테이블 */}
          <div className="csv-table">
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
                          const updatedMatches = [...matches];
                          updatedMatches[index].Key = !updatedMatches[index].Key;
                          dispatch(updateColumnMatch({ matches: updatedMatches }));
                        }}
                        className="checkbox-center"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={match.Desc}
                        onChange={(e) => {
                          const updatedMatches = [...matches];
                          updatedMatches[index].Desc = e.target.value.replace(/"/g, '');
                          dispatch(updateColumnMatch({ matches: updatedMatches }));
                        }}
                      />
                    </td>
                    <td>
                      <select
                        value={match.Type}
                        onChange={(e) => {
                          const updatedMatches = [...matches];
                          updatedMatches[index].Type = parseInt(e.target.value, 10);
                          dispatch(updateColumnMatch({ matches: updatedMatches }));
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
                          const updatedMatches = [...matches];
                          updatedMatches[index].Priority = e.target.value;
                          dispatch(updateColumnMatch({ matches: updatedMatches }));
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
          </div>

          {/* 오른쪽: Special Column 설정 */}
          <div className="special-column-settings">
            <h3>Special Column 설정</h3>
            <select
              value={matches.find(match => match.Key)?.Desc || ''}
              onChange={(e) => {
                const updatedMatches = matches.map(match => ({
                  ...match,
                  Key: match.Desc === e.target.value
                }));
                dispatch(updateColumnMatch({ matches: updatedMatches }));
              }}
            >
              <option value="">Select Column</option>
              {matches.map((match, index) => (
                <option key={index} value={match.Desc}>
                  {match.Desc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </CommonPopup>
  );
};

export default ManageCSVPopup;
