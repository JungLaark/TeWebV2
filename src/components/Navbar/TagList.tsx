import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TLayout } from '../../types';
import { RootState } from '../../store';
import './Navbar.css';
import { ModelTypeDescription } from '../../types/TLayout';
import { useContextMenu } from '../ContextMenu/ContextMenuProvider';
import { Tag } from '../../types/tagList';
import { isPortrait } from '../../utils/orientationUtils';

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
  const guidMap: Record<string, { parents: TLayout[], children: { [parentKey: string]: TLayout[] } }> = {};
  templates.forEach(tpl => {
    if (!guidMap[tpl.Guid]) {
      guidMap[tpl.Guid] = { parents: [], children: {} };
    }
    // 부모노드 조건: TType이 Normal/MultiFacing/TripleFacing/QuadFacing 등
    if (
      (tpl.TType === 'Normal' && tpl.TValue === '0') ||
      tpl.TType === 'MultiFacing' ||
      tpl.TType === 'TripleFacing' ||
      tpl.TType === 'QuadFacing'
    ) {
      guidMap[tpl.Guid].parents.push(tpl);
      // 부모 key는 Winform 방식과 동일하게 Guid_TType_TValue
      const parentKey = `${tpl.Guid}_${tpl.TType}_${tpl.TValue}`;
      guidMap[tpl.Guid].children[parentKey] = [];
    }
  });
  // 자식노드(Promotion, Reserved) 분배
  templates.forEach(tpl => {
    if (
      tpl.TType === 'Promotion' ||
      (tpl.TType === 'Reserved' && tpl.TValue === '1')
    ) {
      if (guidMap[tpl.Guid]) {
        // Promotion/Reserved는 같은 Guid의 모든 부모에 children으로 추가
        guidMap[tpl.Guid].parents.forEach(parent => {
          const parentKey = `${parent.Guid}_${parent.TType}_${parent.TValue}`;
          guidMap[tpl.Guid].children[parentKey].push(tpl);
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
        // 트리 렌더링 시 key를 반드시 고유하게!
        const parentNode: TreeNode = {
          id: `${parentTpl.Guid}_${parentTpl.TType}_${parentTpl.TValue}`,
          name: `${parentTpl.TType} (${parentTpl.Name})`,
          data: parentTpl,
          children: (group.children[`${parentTpl.Guid}_${parentTpl.TType}_${parentTpl.TValue}`] || []).map(childTpl => ({
            id: `${childTpl.Guid}_${childTpl.TType}_${childTpl.TValue}`,
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

// WinForm 방식 트리 구조 생성 (Guid로만 그룹핑)
function buildWinformStyleTree(templates: TLayout[]): TreeNode[] {
  const colorCategories = ['4Color', '3Color', '2Color'];
  const getColorCategory = (name: string) => {
    if (name.includes('R') && name.includes('Y')) return '4Color';
    if (name.includes('R')) return '3Color';
    return '2Color';
  };

  // Orientation 값을 숫자로 강제 변환
  const getOrientationValue = (val: any) => {
    if (val === 0 || val === 'Landscape') return 0;
    if (val === 1 || val === 'Portrait') return 1;
    return -1;
  };

  // 색상 그룹 노드 생성
  const colorMap: Record<string, TreeNode> = {};
  colorCategories.forEach(color => {
    colorMap[color] = { id: color, name: color, children: [] };
  });

  // 모델별 그룹핑 (Width/Height/Model 기준)
  const modelMap: Record<string, { color: string, width: number, height: number, model: number, templates: TLayout[] }> = {};
  templates.forEach(tpl => {
    const color = getColorCategory(tpl.Name || tpl.DisplayName || '');
    const key = `${tpl.Width}_${tpl.Height}_${tpl.Model}`;
    if (!modelMap[key]) {
      modelMap[key] = { color, width: tpl.Width, height: tpl.Height, model: tpl.Model, templates: [] };
    }
    modelMap[key].templates.push(tpl);
  });

  // 모델 노드 생성
  Object.values(modelMap).forEach(({ color, width, height, model, templates }) => {
    const modelNodeId = `${width}_${height}_${model}`;
    const modelNode: TreeNode = {
      id: modelNodeId,
      name: `${width}x${height}`,
      data: { Width: width, Height: height, Model: model } as any,
      children: []
    };
    // 방향별(가로/세로) 노드
    const directions = [
      { key: 'landscape', name: '가로', value: 0 },
      { key: 'portrait', name: '세로', value: 1 }
    ];

    console.log('[트리] 모델노드 생성:', modelNodeId, templates);

    directions.forEach(dir => {
      // 해당 방향 템플릿만 추출 (Orientation 값을 숫자로 변환해서 비교)
      const directionTemplates = templates.filter(tpl => getOrientationValue(tpl.Orientation) === dir.value);
      if (directionTemplates.length === 0) return;
      // 부모 템플릿(최상위)만 추출: TType이 Normal/MultiFacing/TripleFacing/QuadFacing 등
      const parentTemplates = directionTemplates.filter(tpl =>
        (tpl.TType === 'Normal' && tpl.TValue === '0') ||
        tpl.TType === 'MultiFacing' ||
        tpl.TType === 'TripleFacing' ||
        tpl.TType === 'QuadFacing'
      );
      // 자식 템플릿: Promotion, Reserved 등
      const childTemplates = directionTemplates.filter(tpl =>
        tpl.TType === 'Promotion' || (tpl.TType === 'Reserved' && tpl.TValue === '1')
      );
      // 부모별로 자식 매핑
      const directionChildren: TreeNode[] = parentTemplates.map(parentTpl => {
        // 해당 부모와 Guid가 같은 자식만 children으로
        const children = childTemplates.filter(childTpl => childTpl.Guid === parentTpl.Guid).map(childTpl => ({
          id: `${childTpl.Guid}_${childTpl.TType}_${childTpl.TValue}`,
          name: childTpl.Name,
          data: childTpl,
          children: []
        }));
        return {
          id: `${parentTpl.Guid}_${parentTpl.TType}_${parentTpl.TValue}`,
          name: parentTpl.Name,
          data: parentTpl,
          children
        };
      });
      // 방향 노드 생성 및 추가
      const directionNode = {
        id: `${modelNodeId}_${dir.key}`,
        name: dir.name,
        children: directionChildren
      };
      modelNode.children!.push(directionNode);
    });
    // 색상 그룹에 모델 노드 추가
    colorMap[color].children!.push(modelNode);
  });

  return colorCategories.map(color => colorMap[color]).filter(node => node.children && node.children.length > 0);
}

// 트리 렌더링 함수 (들여쓰기 기반, 아코디언 지원)
function renderTree(
  nodes: TreeNode[],
  onSelectTag: (tag: TLayout) => void,
  selectedTag?: string,
  depth = 0,
  openMap: Record<string, boolean> = {},
  toggleNode?: (id: string) => void,
  showContextMenu?: (x: number, y: number, actions: any) => void,
  handleAddSubTag?: (parentTagName: string, newLayout: TLayout) => void,
  parentNode?: TreeNode // 상위 노드 정보 추가
) {
  return nodes.map(node => {
    console.log('[TagList] renderTree node:', node);
    const isParent = node.children && node.children.length > 0;
    const isOpen = openMap[node.id] !== false;
    const isDirectionNode = node.name === '가로' || node.name === '세로';
    return (
      <div key={node.id} style={{ paddingLeft: depth === 0 ? 0 : 10 }}>
        <div
          className={`template-item ${isParent ? 'parent' : 'child'} ${selectedTag === node.data?.Name ? 'template-selected' : 'template-normal'}`}
          onClick={() => { if (node.data) onSelectTag(node.data); }}
          onContextMenu={e => {
            e.preventDefault();

            // 방향 정보 명확히 전달 (가로: 0, 세로: 1)
            const orientation = node.name === '가로' ? 0 : node.name === '세로' ? 1 : undefined;

            if (isDirectionNode && showContextMenu && parentNode) {
              // 상위(모델) 노드 정보에서 tagName, width, height, modelType 추출 (width/height 보완)
              const width = parentNode.data?.Width;
              const height = parentNode.data?.Height;

              showContextMenu(e.clientX, e.clientY, {
                direction: node.name,
                tagName: parentNode.name,
                tagWidth: width,
                tagHeight: height,
                modelType: parentNode.data?.Model,
                orientation, // 명확히 전달
                handleAddSubTag
              });
            } else if (node.data && showContextMenu) {
              showContextMenu(e.clientX, e.clientY, {
                tagName: node.data.Name,
                tagWidth: node.data.Width ?? parentNode?.data?.Width ?? 0,
                tagHeight: node.data.Height ?? parentNode?.data?.Height ?? 0,
                tagGuid: node.data.Guid,
                modelType: node.data.Model ?? parentNode?.data?.Model ?? 0,
                tType: node.data.TType, // Promotion 여부 전달
                orientation: node.data.Orientation ?? undefined,
                onAddPop: handleAddSubTag, // POP 추가 핸들러 (실제 구현에 맞게 연결)
                onAddSubTag: handleAddSubTag
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
          renderTree(node.children, onSelectTag, selectedTag, depth + 1, openMap, toggleNode, showContextMenu, handleAddSubTag, (node.name === '가로' || node.name === '세로') ? parentNode : node)
        }
      </div>
    );
  });
}

const TagList: React.FC<TagListProps> = ({ onSelectTag, selectedTag, handleAddSubTag }) => {
  // TagList에서 selectedTags는 템플릿 필터링에만 사용, 트리 생성은 TLayout만 사용
  const selectedTags = useSelector((state: RootState) => state.selectedTags.selectedTags);
  const tLayoutList = useSelector((state: RootState) => state.template.templates);

  // selectedTags의 width/height와 일치하는 템플릿만 필터링
  const filteredTemplates = tLayoutList.filter(tpl =>
    selectedTags.some(tag => tpl.Width === tag.width && tpl.Height === tag.height)
  );
  
  


  console.log('[TagList] buildWinformStyleTree input:', filteredTemplates);
  // WinForm 스타일 트리 생성 (이제 filteredTemplates만 사용)
  const tree = buildWinformStyleTree(filteredTemplates);

  console.log('[TagList] tree:', tree);

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
        };
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
