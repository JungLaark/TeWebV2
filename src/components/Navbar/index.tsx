import React from 'react';
import { TagItem } from '../../types';
import { Bookmark, Tag } from 'lucide-react';
import TagList from '../../Objects/TagList';
import './Navbar.css';

export const Navbar: React.FC = () => {
  return (
    <div className="navbar">
      <div className="navbar-header">
        <h2>
          <Tag className="tag-icon" />
          Tags
        </h2>
        <TagList 
          onSelectTag={handleTagSelect} 
          selectedTag={selectedTag?.name}
        />
      </div>
    </div>
  );
};
