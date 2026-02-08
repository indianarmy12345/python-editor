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
}

const FileTabs = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
}: FileTabsProps) => {
  return (
    <div className="flex items-center bg-secondary/30 border-b border-border overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r border-border transition-colors min-w-[100px] max-w-[180px]",
                activeTabId === tab.id
                  ? "bg-background text-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <span className="truncate flex-1 text-left">
                {tab.isModified && <span className="text-primary mr-1">●</span>}
                {tab.name}
              </span>
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
        className="p-2 hover:bg-secondary/80 transition-colors flex-shrink-0 border-l border-border"
        title="New file"
      >
        <Plus className="w-4 h-4 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  );
};

export default FileTabs;
