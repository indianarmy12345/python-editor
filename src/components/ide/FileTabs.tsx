import { useState, useRef, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { FileTab } from "@/hooks/useFileTabs";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface FileTabsProps {
  tabs: FileTab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onTabRename?: (tabId: string, newName: string) => void;
}

const FileTabs = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
  onTabRename,
}: FileTabsProps) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startEditing = useCallback((tab: FileTab) => {
    setEditingTabId(tab.id);
    setEditValue(tab.name);
    setTimeout(() => inputRef.current?.select(), 0);
  }, []);

  const commitRename = useCallback(() => {
    if (editingTabId && editValue.trim() && onTabRename) {
      const name = editValue.trim().endsWith(".py") ? editValue.trim() : editValue.trim() + ".py";
      onTabRename(editingTabId, name);
    }
    setEditingTabId(null);
  }, [editingTabId, editValue, onTabRename]);

  const handleTouchStart = useCallback((tab: FileTab) => {
    longPressTimer.current = setTimeout(() => {
      startEditing(tab);
    }, 600);
  }, [startEditing]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <div className="flex items-center bg-secondary/30 border-b border-border overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => { if (editingTabId !== tab.id) onTabSelect(tab.id); }}
              onDoubleClick={() => startEditing(tab)}
              onTouchStart={() => handleTouchStart(tab)}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r border-border transition-colors min-w-[100px] max-w-[180px]",
                activeTabId === tab.id
                  ? "bg-background text-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              {editingTabId === tab.id ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setEditingTabId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border border-primary/50 rounded px-1 text-sm w-full outline-none text-foreground"
                  autoFocus
                />
              ) : (
                <span className="truncate flex-1 text-left select-none">
                  {tab.isModified && <span className="text-primary mr-1">●</span>}
                  {tab.name}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className={cn(
                  "p-0.5 rounded hover:bg-muted transition-colors flex-shrink-0",
                  activeTabId === tab.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                title="Close tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      <button
        onClick={onNewTab}
        className="p-2 mx-1 hover:bg-primary/20 rounded transition-colors flex-shrink-0"
        title="New file (Ctrl+N)"
      >
        <Plus className="w-5 h-5 text-primary hover:text-primary/80" />
      </button>
    </div>
  );
};

export default FileTabs;
