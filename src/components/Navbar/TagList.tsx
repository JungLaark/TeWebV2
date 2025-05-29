import React, { useState } from "react";
import { useSelector } from "react-redux";
import { TLayout } from "../../types";
import { RootState } from "../../store";
import "./Navbar.css";
import { ModelTypeDescription } from "../../types/TLayout";
import { useContextMenu } from "../ContextMenu/ContextMenuProvider";
import { Tag } from "../../types/tagList";
import { isPortrait } from "../../utils/orientationUtils";

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

// WinForm 방식 트리 구조 생성 (Guid로만 그룹핑)
function buildWinformStyleTree(templates: TLayout[]): TreeNode[] {
  const colorCategories = ["4Color", "3Color", "2Color"];
  const getColorCategory = (name: string) => {
    if (name.includes("R") && name.includes("Y")) return "4Color";
    if (name.includes("R")) return "3Color";
    return "2Color";
  };

  // 색상 그룹 노드 생성
  const colorMap: Record<string, TreeNode> = {};
  colorCategories.forEach((color) => {
    colorMap[color] = { id: color, name: color, children: [] };
  });

  // 모델별로 그룹핑 (Model, Width, Height 기준)
  const modelKeys = Array.from(
    new Set(templates.map((t) => `${t.Model}_${t.Width}_${t.Height}`))
  );
  const models = modelKeys.map((key) => {
    const [model, width, height] = key.split("_");
    return {
      model: Number(model),
      width: Number(width),
      height: Number(height),
    };
  });

  models.forEach(({ model, width, height }) => {
    // 모델명에서 색상 그룹 결정
    const modelName = ModelTypeDescription[model] || `${width}x${height}`;
    const color = getColorCategory(modelName);

    // 모델 노드 생성
    const modelNode: TreeNode = {
      id: `${model}_${width}_${height}`,
      name: modelName,
      data: { Model: model, Width: width, Height: height } as any,
      children: [],
    };

    // 가로/세로 노드 생성 (항상 존재)
    ["landscape", "portrait"].forEach((dirKey) => {
      const orientation = dirKey === "landscape" ? 0 : 1;
      const directionNode: TreeNode = {
        id: `${model}_${width}_${height}_${dirKey}`,
        name: dirKey === "landscape" ? "가로" : "세로",
        children: [],
      };

      // 4단계: 부모 TLayout (Normal, 0)
      const parentLayouts = templates.filter(
        (t) =>
          t.Model === model &&
          t.Width === width &&
          t.Height === height &&
          t.Orientation === orientation &&
          t.TType === "Normal" &&
          t.TValue === "0"
      );

      // 부모가 없더라도 Direction 노드는 항상 존재
      if (parentLayouts.length === 0) {
        directionNode.children = [];
      } else {
        directionNode.children = parentLayouts.map((parentTpl) => {
          // 5단계: Promotion 등 특수 TLayout (같은 GUID, 같은 Orientation)
          const childLayouts = templates.filter(
            (t) =>
              t.Guid === parentTpl.Guid &&
              !(t.TType === "Normal" && t.TValue === "0") &&
              t.Orientation === orientation
          );
          return {
            id: `${parentTpl.Guid}_${parentTpl.TType}_${parentTpl.TValue}`,
            name: parentTpl.Name,
            data: parentTpl,
            children: childLayouts.map((childTpl) => ({
              id: `${childTpl.Guid}_${childTpl.TType}_${childTpl.TValue}`,
              name: childTpl.Name,
              data: childTpl,
              children: [],
            })),
          };
        });
      }
      modelNode.children!.push(directionNode);
    });
    colorMap[color].children!.push(modelNode);
  });

  // 최상위 색상 그룹만 반환
  return colorCategories
    .map((color) => colorMap[color])
    .filter((node) => node.children && node.children.length > 0);
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
  parentNode?: TreeNode, // 상위 노드 정보 추가
  selectedTags?: Tag[],
  tLayoutList?: TLayout[] // 전체 템플릿 배열 추가
) {
  return nodes.map((node) => {
    // selectedTags에 포함된 width/height만 표시
    if (
      node.data &&
      node.data.Width &&
      node.data.Height &&
      selectedTags &&
      !selectedTags.some(
        (tag) =>
          tag.width === node.data.Width && tag.height === node.data.Height
      )
    ) {
      return null;
    }
    console.log("[TagList] renderTree node:", node);
    const isParent = node.children && node.children.length > 0;
    const isOpen = openMap[node.id] !== false;
    const isDirectionNode = node.name === "가로" || node.name === "세로";
    return (
      <div key={node.id} style={{ paddingLeft: depth === 0 ? 0 : 10 }}>
        <div
          className={`template-item ${
            depth === 0
              ? "taglist-color-node"
              : depth === 1
              ? "taglist-model-node"
              : depth === 2
              ? "taglist-orientation-node"
              : "taglist-template-node"
          } ${isParent ? "parent" : "child"} ${
            selectedTag === node.data?.Name
              ? "template-selected"
              : "template-normal"
          }`}
          onClick={() => {
            if (node.data) onSelectTag(node.data);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            // 1. 컬러 노드(최상위) 우클릭 무시
            if (depth === 0) return;
            // 2. 모델 노드(2단계) 우클릭 무시
            if (depth === 1) return;
            // 3. 가로/세로 노드(3단계)
            if (
              depth === 2 &&
              isDirectionNode &&
              showContextMenu &&
              parentNode
            ) {
              const width = parentNode.data?.Width;
              const height = parentNode.data?.Height;
              const orientation = node.name === "가로" ? 0 : 1;
              showContextMenu(e.clientX, e.clientY, {
                direction: node.name,
                tagName: parentNode.name,
                tagWidth: width,
                tagHeight: height,
                modelType: parentNode.data?.Model,
                orientation,
                onAddSubTag: handleAddSubTag,
              });
              return;
            }
            // 4. 템플릿 노드(부모, Normal/0)
            if (
              node.data &&
              node.data.TType === "Normal" &&
              node.data.TValue === "0" &&
              showContextMenu
            ) {
              showContextMenu(e.clientX, e.clientY, {
                tagName: node.data.Name,
                tagGuid: node.data.Guid,
                tType: node.data.TType,
                parentLayout: node.data, // 추가
                allTemplates: tLayoutList, // 추가
                onAddPop: handleAddSubTag,
                onAddSubTag: handleAddSubTag,
              });
              return;
            }
            // 5. Promotion 노드
            if (
              node.data &&
              node.data.TType === "Promotion" &&
              showContextMenu
            ) {
              showContextMenu(e.clientX, e.clientY, {
                tagName: node.data.Name,
                tagGuid: node.data.Guid,
                tType: node.data.TType,
                onAddPop: handleAddSubTag,
              });
              return;
            }
          }}
        >
          {isParent && (
            <span
              className={`toggle-icon${isOpen ? " open" : ""}`}
              style={{
                cursor: "pointer",
                marginRight: 10,
                display: "inline-flex",
                alignItems: "center",
                fontWeight: 700, // bold
                fontSize: 22,    // 크게
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (toggleNode) toggleNode(node.id);
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                style={{
                  transition: "transform 0.2s",
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                <polyline
                  points="6 8 10 12 14 8"
                  fill="none"
                  stroke="#b7c3dc"         // 더 진한 파랑
                  strokeWidth="5"        // 더 두껍게
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
          <span className="font-bold" title={node.name}>
            {depth === 0 && <span style={{ marginRight: 4 }}>🎨</span>}
            {depth === 1 && <span style={{ marginRight: 4 }}>📱</span>}
            {depth >= 3 && <span style={{ marginRight: 4 }}>🏷️</span>}
            {node.name.length > 18 ? node.name.slice(0, 16) + "…" : node.name}
            {depth === 2 && (
              <span style={{ marginRight: 4 }}>
                {node.name === "가로" ? "  ↔" : "   ↕"}
              </span>
            )}
          </span>
          {node.data && (
            <span className="text-xs text-gray-400 ml-2">
              {node.data.Width > node.data.Height
                ? "가로"
                : node.data.Width < node.data.Height
                ? "세로"
                : "정방형"}{" "}
              {node.data.Width}x{node.data.Height}
            </span>
          )}
        </div>
        {isParent &&
          isOpen &&
          node.children &&
          node.children.length > 0 &&
          renderTree(
            node.children,
            onSelectTag,
            selectedTag,
            depth + 1,
            openMap,
            toggleNode,
            showContextMenu,
            handleAddSubTag,
            node.name === "가로" || node.name === "세로" ? parentNode : node,
            selectedTags,
            tLayoutList
          )}
      </div>
    );
  });
}

const TagList: React.FC<TagListProps> = ({
  onSelectTag,
  selectedTag,
  handleAddSubTag,
}) => {
  // TagList에서 selectedTags는 템플릿 필터링에만 사용, 트리 생성은 TLayout만 사용
  const selectedTags = useSelector(
    (state: RootState) => state.selectedTags.selectedTags
  );
  const tLayoutList = useSelector(
    (state: RootState) => state.template.templates
  );
  // selectedTags의 width/height와 일치하는 템플릿만 필터링
  const filteredTemplates = tLayoutList.filter((tpl) =>
    selectedTags.some(
      (tag) => tpl.Width === tag.width && tpl.Height === tag.height
    )
  );
  console.log("[filteredTemplates]:", filteredTemplates);
  // 전체 템플릿으로 트리 생성
  const tree = buildWinformStyleTree(filteredTemplates);


  // 아코디언 상태 관리
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [allOpen, setAllOpen] = useState(true);

  // ContextMenu Hook을 컴포넌트 최상위에서 호출
  const { showContextMenu } = useContextMenu();

  // 부모 노드 토글
  const toggleNode = (id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 전체 토글
  const handleToggleAll = () => {
    const nextOpen = !allOpen;
    // 모든 부모 노드 id를 찾아 일괄 적용
    const allParentIds: string[] = [];
    const collectParentIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          allParentIds.push(node.id);
          collectParentIds(node.children);
        }
      });
    };
    collectParentIds(tree);
    const newMap: Record<string, boolean> = {};
    allParentIds.forEach((id) => {
      newMap[id] = nextOpen;
    });
    setOpenMap(newMap);
    setAllOpen(nextOpen);
  };

  // renderTree에 showContextMenu를 전달
  return (
    <div className="taglist-wrapper">
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "4px 0 8px 0",
        }}
      >
        <button
          className="manage-tags-button"
          onClick={handleToggleAll}
          style={{ fontSize: 12 }}
        >
          {allOpen ? "전체 접기" : "전체 펼치기"}
        </button>
      </div>
      {tree.length === 0 ? (
        <div className="text-gray-400 text-sm p-4">템플릿이 없습니다.</div>
      ) : (
        renderTree(
          tree,
          onSelectTag,
          selectedTag,
          0,
          openMap,
          toggleNode,
          showContextMenu,
          handleAddSubTag,
          undefined,
          selectedTags,
          tLayoutList
        )
      )}
    </div>
  );
};

export default TagList;
