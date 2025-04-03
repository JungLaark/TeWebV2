import React from 'react';
import { Tag } from 'lucide-react';
import TagList from './TagList';
import './Navbar.css';

interface NavbarProps {
  onSelectTag: (tag: { name: string; width: number; height: number }) => void;
  selectedTag?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectTag, selectedTag }) => {
  return (
    <div className="navbar">
      <div className="navbar-header">
        <h2 className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5" />
          <span>Tag List</span>
        </h2>
      </div>
      <TagList 
        onSelectTag={onSelectTag}
        selectedTag={selectedTag}
      />
    </div>
  );
};
