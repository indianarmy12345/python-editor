import { useState, useEffect, useCallback, useRef } from "react";
import type { ConsoleOutput } from "@/components/ide/Console";

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<any>;
  }
}

export const usePyodide = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    const loadPyodideScript = async () => {
      // Check if script already loaded
      if (window.loadPyodide) {
        try {
          const py = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
          });
          pyodideRef.current = py;
          setPyodide(py);
          setOutputs([
            {
              type: "info",
              content: "Python environment loaded successfully! Ready to code.",
              timestamp: new Date(),
            },
          ]);
        } catch (error) {
          setOutputs([
            {
              type: "error",
              content: `Failed to load Python: ${error}`,
              timestamp: new Date(),
            },
          ]);
        }
        setIsLoading(false);
        return;
      }

      // Load Pyodide script
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
      script.async = true;

      script.onload = async () => {
        try {
          const py = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
          });
          pyodideRef.current = py;
          setPyodide(py);
          setOutputs([
            {
              type: "info",
              content: "Python environment loaded successfully! Ready to code.",
              timestamp: new Date(),
            },
          ]);
        } catch (error) {
          setOutputs([
            {
              type: "error",
              content: `Failed to load Python: ${error}`,
              timestamp: new Date(),
            },
          ]);
        }
        setIsLoading(false);
      };

      script.onerror = () => {
        setOutputs([
          {
            type: "error",
            content: "Failed to load Pyodide. Check your internet connection.",
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    loadPyodideScript();
  }, []);

  const installImports = useCallback(async (code: string) => {
    const py = pyodideRef.current;
    if (!py) return;

    // Extract import statements
    const importRegex = /^\s*(?:import|from)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gm;
    const stdlibAndBuiltin = new Set([
      "sys", "os", "io", "re", "math", "json", "random", "time", "datetime",
      "collections", "itertools", "functools", "operator", "string", "textwrap",
      "struct", "copy", "pprint", "typing", "abc", "contextlib", "decimal",
      "fractions", "statistics", "pathlib", "glob", "shutil", "pickle",
      "shelve", "csv", "configparser", "hashlib", "hmac", "secrets",
      "logging", "warnings", "traceback", "unittest", "doctest",
      "enum", "dataclasses", "array", "queue", "heapq", "bisect",
      "ast", "dis", "inspect", "importlib", "pkgutil", "token", "tokenize",
      "urllib", "html", "xml", "email", "base64", "binascii", "cmath",
      "difflib", "calendar", "locale", "gettext", "argparse", "optparse",
      "sqlite3", "zlib", "gzip", "bz2", "lzma", "zipfile", "tarfile",
      "socket", "ssl", "select", "signal", "mmap", "codecs", "unicodedata",
      "stringprep", "readline", "rlcompleter", "weakref", "types",
      "pdb", "profile", "timeit", "platform", "errno", "ctypes",
      // Pyodide built-ins
      "pyodide", "micropip", "js",
      // Common internal modules
      "__future__", "builtins", "_thread", "threading", "multiprocessing",
    ]);

    const modules = new Set<string>();
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const mod = match[1];
      if (!stdlibAndBuiltin.has(mod)) {
        modules.add(mod);
      }
    }

    if (modules.size === 0) return;

    // Load micropip and install missing packages
    await py.loadPackage("micropip");
    const micropip = py.pyimport("micropip");

    for (const mod of modules) {
      try {
        // Check if already available
        py.runPython(`import ${mod}`);
      } catch {
        // Not available, try installing
        setOutputs((prev) => [
          ...prev,
          { type: "info", content: `📦 Installing package: ${mod}...`, timestamp: new Date() },
        ]);
        try {
          await micropip.install(mod);
          setOutputs((prev) => [
            ...prev,
            { type: "info", content: `✅ Installed ${mod} successfully`, timestamp: new Date() },
          ]);
        } catch (err: any) {
          setOutputs((prev) => [
            ...prev,
            { type: "error", content: `❌ Failed to install ${mod}: ${err.message || err}`, timestamp: new Date() },
          ]);
        }
      }
    }
  }, []);

  const runCode = useCallback(
    async (code: string) => {
      if (!pyodideRef.current || isRunning) return;

      setIsRunning(true);
      setOutputs((prev) => [
        ...prev,
        { type: "info", content: ">>> Running code...", timestamp: new Date() },
      ]);

      try {
        // Auto-install imports
        await installImports(code);

        // Redirect stdout and stderr
        pyodideRef.current.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.outputs = []
    
    def write(self, text):
        if text.strip():
            self.outputs.append(text)
    
    def flush(self):
        pass
    
    def get_output(self):
        return ''.join(self.outputs)

_stdout_capture = OutputCapture()
_stderr_capture = OutputCapture()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
        `);

        // Run the user's code
        await pyodideRef.current.runPythonAsync(code);

        // Get captured output
        const stdout = pyodideRef.current.runPython("_stdout_capture.get_output()");
        const stderr = pyodideRef.current.runPython("_stderr_capture.get_output()");

        if (stdout) {
          setOutputs((prev) => [
            ...prev,
            { type: "output", content: stdout, timestamp: new Date() },
          ]);
        }

        if (stderr) {
          setOutputs((prev) => [
            ...prev,
            { type: "error", content: stderr, timestamp: new Date() },
          ]);
        }

        if (!stdout && !stderr) {
          setOutputs((prev) => [
            ...prev,
            { type: "info", content: "Code executed successfully (no output)", timestamp: new Date() },
          ]);
        }
      } catch (error: any) {
        setOutputs((prev) => [
          ...prev,
          { type: "error", content: error.message || String(error), timestamp: new Date() },
        ]);
      } finally {
        pyodideRef.current?.runPython(`
import sys
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
        `);
        setIsRunning(false);
      }
    },
    [isRunning, installImports]
  );

  const clearOutputs = useCallback(() => {
    setOutputs([]);
  }, []);

  const stopExecution = useCallback(() => {
    // Note: Pyodide doesn't support interrupting execution
    // This is a placeholder for UI feedback
    setIsRunning(false);
    setOutputs((prev) => [
      ...prev,
      {
        type: "info",
        content: "Execution stopped.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    pyodide,
    isLoading,
    isRunning,
    outputs,
    runCode,
    clearOutputs,
    stopExecution,
  };
};
