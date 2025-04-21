import React from 'react';
import { Tag } from 'lucide-react';
import TagList from './TagList';
import './Navbar.css';
import { TLayout } from '../../types';

interface NavbarProps {
  onSelectTag: (tag: TLayout) => void;
  selectedTag?: string;
  onManageTags: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectTag, selectedTag, onManageTags }) => {
  return (
    <aside className="navbar-container">
      {/* 고정된 헤더 영역 */}
      <header className="navbar-header">
        <div className="flex items-center gap-2">
          <Tag size={18} />
          <h2 className="whitespace-nowrap">Tag List</h2>
        </div>
        <button
          className="manage-tags-button"
          onClick={onManageTags}
        >
          Manage Tags
        </button>
      </header>
      
      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="navbar-scrollable-content">
        <TagList 
          onSelectTag={onSelectTag}
          selectedTag={selectedTag}
        />
      </div>
    </aside>
  );
};
