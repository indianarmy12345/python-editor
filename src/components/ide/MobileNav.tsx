import { Menu, Play, Square, RotateCcw, Lightbulb } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeToggle from "@/components/ThemeToggle";
import FileMenu from "./FileMenu";
import TipsPanel from "./TipsPanel";
import pythonLogo from "@/assets/python-logo.png";

interface MobileNavProps {
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  isRunning: boolean;
  code: string;
  onCodeChange: (code: string) => void;
}

const MobileNav = ({
  onRun,
  onStop,
  onClear,
  isRunning,
  code,
  onCodeChange,
}: MobileNavProps) => {
  return (
    <header className="ide-header px-3 py-2 flex items-center justify-between lg:hidden">
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 hover:bg-secondary rounded-md transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <img src={pythonLogo} alt="Python" className="w-6 h-6" />
                <span>Python Editor</span>
              </SheetTitle>
            </SheetHeader>
            <div className="p-4 space-y-4">
              <div className="flex flex-col gap-2">
                <FileMenu code={code} onCodeChange={onCodeChange} />
                <ThemeToggle />
              </div>
            </div>
            <div className="border-t border-border">
              <TipsPanel />
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-2">
          <img src={pythonLogo} alt="Python" className="w-7 h-7" />
          <span className="font-bold text-sm">
            <span className="python-logo-gradient">PY</span>
            <span className="text-foreground">EDITOR</span>
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onClear}
          className="p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          title="Clear Console"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        {isRunning ? (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold transition-all"
          >
            <Square className="w-4 h-4" />
            <span className="text-sm">Stop</span>
          </button>
        ) : (
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all shadow-lg shadow-primary/20"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm">Run</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default MobileNav;
