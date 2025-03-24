import React from 'react';
import { TagItem } from '../types';
import { Bookmark, Tag } from 'lucide-react';
import TagList from '../Objects/TagList';

interface NavbarProps {
  tags: TagItem[];
  onSelectTag: (tag: TagItem) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ tags, onSelectTag }) => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Tags
        </h2>
        <TagList onSelectTag={onSelectTag} />
        <div className="mt-4 space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.Guid}
              className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => {
                onSelectTag(tag);
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{tag.Name}</span>
                {tag.Bookmark && <Bookmark className="w-4 h-4" />}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {tag.Width}x{tag.Height} - {tag.TType}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
