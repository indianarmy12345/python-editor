import { useState, useCallback } from "react";

export interface FileTab {
  id: string;
  name: string;
  content: string;
  isModified: boolean;
}

const defaultCode = `# Welcome to Python Editor! 🐍
# Write your Python code here and click "Run" to execute it.

# Example: Hello World
print("Hello, World!")

# Example: Simple calculation
x = 10
y = 20
print(f"The sum of {x} and {y} is {x + y}")

# Example: Loop
for i in range(5):
    print(f"Count: {i}")

# Try modifying this code and run it!
`;

const generateId = () => Math.random().toString(36).substring(2, 9);

export function useFileTabs() {
  const [tabs, setTabs] = useState<FileTab[]>([
    { id: generateId(), name: "main.py", content: defaultCode, isModified: false },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  const createNewTab = useCallback((name?: string, content?: string) => {
    const newTab: FileTab = {
      id: generateId(),
      name: name || `untitled_${tabs.length + 1}.py`,
      content: content || "# New Python file\n\n",
      isModified: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    return newTab;
  }, [tabs.length]);

  const closeTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      if (prev.length === 1) {
        // Don't close the last tab, just reset it
        return [{ id: generateId(), name: "main.py", content: defaultCode, isModified: false }];
      }
      const newTabs = prev.filter((tab) => tab.id !== tabId);
      // If closing the active tab, switch to another
      if (tabId === activeTabId) {
        const closedIndex = prev.findIndex((tab) => tab.id === tabId);
        const newActiveIndex = Math.min(closedIndex, newTabs.length - 1);
        setActiveTabId(newTabs[newActiveIndex].id);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, content, isModified: true } : tab
      )
    );
  }, []);

  const renameTab = useCallback((tabId: string, newName: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, name: newName } : tab
      )
    );
  }, []);

  const markTabSaved = useCallback((tabId: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, isModified: false } : tab
      )
    );
  }, []);

  const loadFileToTab = useCallback((name: string, content: string) => {
    // Check if a tab with this name already exists
    const existingTab = tabs.find((tab) => tab.name === name);
    if (existingTab) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === existingTab.id ? { ...tab, content, isModified: false } : tab
        )
      );
      setActiveTabId(existingTab.id);
    } else {
      createNewTab(name, content);
    }
  }, [tabs, createNewTab]);

  return {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    createNewTab,
    closeTab,
    updateTabContent,
    renameTab,
    markTabSaved,
    loadFileToTab,
  };
}
