import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TLayout } from '../../types';
import { RootState } from '../../store';
import './Navbar.css';
import { ModelTypeDescription } from '../../types/TLayout';
import { useContextMenu } from '../ContextMenu/ContextMenuProvider';

interface TagListProps {
  onSelectTag: (tag: TLayout) => void;
  selectedTag?: string;
  handleAddSubTag?: (parentTagName: string, newLayout: TLayout) => void;
}

// 트리 노드 타입 정의
interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  data?: TLayout;
}

// 트리 변환 함수
function buildTemplateTree(templates: TLayout[]): TreeNode[] {
  // 1. Model별 그룹핑
  const modelMap: Record<string, TreeNode> = {};
  templates.forEach(tpl => {
    const modelKey = `${tpl.Model}`;
    if (!modelMap[modelKey]) {
      modelMap[modelKey] = {
        id: modelKey,
        name: ModelTypeDescription[tpl.Model] ? `${ModelTypeDescription[tpl.Model]}인치` : (tpl.ModelName || `${tpl.Width}x${tpl.Height}`),
        children: []
      };
    }
  });

  // 2. GUID별 부모/자식 트리 구성
  const guidMap: Record<string, { parents: TLayout[], children: { [parentName: string]: TLayout[] } }> = {};
  templates.forEach(tpl => {
    if (!guidMap[tpl.Guid]) {
      guidMap[tpl.Guid] = { parents: [], children: {} };
    }
    // 부모노드 조건
    if (
      (tpl.TType === 'Normal' && tpl.TValue === '0') ||
      tpl.TType === 'MultiFacing' ||
      tpl.TType === 'TripleFacing' ||
      tpl.TType === 'QuadFacing'
    ) {
      guidMap[tpl.Guid].parents.push(tpl);
      guidMap[tpl.Guid].children[tpl.Name] = [];
    }
  });
  // 자식노드(Promotion, Reserved) 분배
  templates.forEach(tpl => {
    if (
      tpl.TType === 'Promotion' ||
      (tpl.TType === 'Reserved' && tpl.TValue === '1')
    ) {
      if (guidMap[tpl.Guid]) {
        guidMap[tpl.Guid].parents.forEach(parent => {
          guidMap[tpl.Guid].children[parent.Name].push(tpl);
        });
      }
    }
  });

  // 3. Direction별 그룹핑 및 트리 구성
  Object.values(modelMap).forEach(modelNode => {
    // const modelTemplates = templates.filter(tpl => `${tpl.Model}` === modelNode.id); // 사용하지 않으므로 삭제
    // Direction별 guidMap 기반 트리
    const directionGroups: Record<number, TreeNode> = {
      0: { id: modelNode.id + '_landscape', name: '가로모드', children: [] },
      1: { id: modelNode.id + '_portrait', name: '세로모드', children: [] }
    };
    // guidMap의 부모노드 중에서 Direction이 일치하는 것만 분류
    Object.values(guidMap).forEach(group => {
      group.parents.forEach(parentTpl => {
        if (`${parentTpl.Model}` !== modelNode.id) return;
        const dir = parentTpl.Direction === 1 ? 1 : 0; // DirectionType이 number라면 문제 없음
        const parentNode: TreeNode = {
          id: parentTpl.Guid + '_' + parentTpl.Name,
          name: `${parentTpl.TType} (${parentTpl.Name})`,
          data: parentTpl,
          children: (group.children[parentTpl.Name] || []).map(childTpl => ({
            id: childTpl.Guid + '_' + childTpl.Name,
            name: childTpl.Name,
            data: childTpl
          }))
        };
        directionGroups[dir].children!.push(parentNode);
      });
    });
    // 세로/가로모드에 트리가 있을 때만 추가
    modelNode.children = [
      ...(directionGroups[0].children!.length ? [directionGroups[0]] : []),
      ...(directionGroups[1].children!.length ? [directionGroups[1]] : [])
    ];
  });

  return Object.values(modelMap);
}

// 트리 렌더링 함수 (들여쓰기 기반, 아코디언 지원)
function renderTree(
  nodes: TreeNode[],
  onSelectTag: (tag: TLayout) => void,
  selectedTag?: string,
  depth = 0,
  openMap: Record<string, boolean> = {},
  toggleNode?: (id: string) => void,
  showContextMenu?: (x: number, y: number, actions: import('../ContextMenu/ContextMenuProvider').ContextMenuState['actions']) => void,
  handleAddSubTag?: (parentTagName: string, newLayout: TLayout) => void
) {
  return nodes.map(node => {
    const isDirectionGroup = node.name === '세로모드' || node.name === '가로모드';
    if (isDirectionGroup) {
      return (
        <div key={node.id} className="direction-group">
          <div className="direction-group-title">{node.name}</div>
          {node.children && renderTree(node.children, onSelectTag, selectedTag, depth + 1, openMap, toggleNode, showContextMenu, handleAddSubTag)}
        </div>
      );
    }
    const isParent = node.children && node.children.length > 0;
    const isOpen = openMap[node.id] !== false; // 기본은 열림
    return (
      <div key={node.id} style={{ paddingLeft: depth === 0 ? 0 : 10 }}>
        <div
          className={`template-item ${isParent ? 'parent' : 'child'} ${selectedTag === node.data?.Name ? 'template-selected' : 'template-normal'}`}
          onClick={() => { if (node.data) onSelectTag(node.data); }}
          onContextMenu={e => {
            e.preventDefault();
            if (node.data && showContextMenu) {
              showContextMenu(e.clientX, e.clientY, {
                tagName: node.data.Name,
                tagWidth: node.data.Width,
                tagHeight: node.data.Height,
                tagGuid: node.data.Guid,
                modelType: node.data.Model,
                onAddSubTag: handleAddSubTag // 전달
              });
            }
          }}
        >
          {isParent && (
            <span
              style={{ cursor: 'pointer', marginRight: 4 }}
              onClick={e => { e.stopPropagation(); if (toggleNode) toggleNode(node.id); }}
            >
              {isOpen ? '▼' : '▶'}
            </span>
          )}
          <span className="font-bold" title={node.name}>{node.name}</span>
          {node.data && (
            <span className="text-xs text-gray-400 ml-2">
              {node.data.Width > node.data.Height ? '가로' : node.data.Width < node.data.Height ? '세로' : '정방형'} {node.data.Width}x{node.data.Height}
            </span>
          )}
        </div>
        {isParent && isOpen && node.children && node.children.length > 0 &&
          renderTree(node.children, onSelectTag, selectedTag, depth + 1, openMap, toggleNode, showContextMenu, handleAddSubTag)
        }
      </div>
    );
  });
}

const TagList: React.FC<TagListProps> = ({ onSelectTag, selectedTag, handleAddSubTag }) => {
  // 선택된 태그만 가져옴
  const selectedTags = useSelector((state: RootState) => state.selectedTags.selectedTags);
  // 전체 TLayout 목록 가져오기 (templateSlice의 templates)
  const tLayoutList = useSelector((state: RootState) => state.template.templates);
  
  
  console.log('[TagList] tLayoutList:', tLayoutList);
  console.log('[TagList] selectedTags:', selectedTags);

  // 선택된 태그만 필터링 (ModelTypeDescription[tpl.Model]과 tag.name 비교)
  const filteredList = tLayoutList.filter(tpl =>
    selectedTags.some(tag => tag.name === ModelTypeDescription[tpl.Model])
  );

  console.log('[TagList] filteredList:', filteredList);

  // 트리 구조로 변환
  const tree = buildTemplateTree(filteredList);

  // 아코디언 상태 관리
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [allOpen, setAllOpen] = useState(true);

  // ContextMenu Hook을 컴포넌트 최상위에서 호출
  const { showContextMenu } = useContextMenu();

  // 부모 노드 토글
  const toggleNode = (id: string) => {
    setOpenMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 전체 토글
  const handleToggleAll = () => {
    const nextOpen = !allOpen;
    // 모든 부모 노드 id를 찾아 일괄 적용
    const allParentIds: string[] = [];
    const collectParentIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          allParentIds.push(node.id);
          collectParentIds(node.children);
        }
      });
    };
    collectParentIds(tree);
    const newMap: Record<string, boolean> = {};
    allParentIds.forEach(id => { newMap[id] = nextOpen; });
    setOpenMap(newMap);
    setAllOpen(nextOpen);
  };

  // renderTree에 showContextMenu를 전달
  return (
    <div className="taglist-wrapper">
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '4px 0 8px 0' }}>
        <button className="manage-tags-button" onClick={handleToggleAll} style={{ fontSize: 12 }}>
          {allOpen ? '전체 접기' : '전체 펼치기'}
        </button>
      </div>
      {tree.length === 0 ? (
        <div className="text-gray-400 text-sm p-4">템플릿이 없습니다.</div>
      ) : (
        renderTree(tree, onSelectTag, selectedTag, 0, openMap, toggleNode, showContextMenu, handleAddSubTag)
      )}
    </div>
  );
};

export default TagList;
