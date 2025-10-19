// components/mode-toggle.jsx
"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Monitor, Moon, Sun } from "lucide-react";

export default function ModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button aria-label="Light" variant="outline" size="sm" onClick={() => setTheme("light")}>
        <Sun className="h-4 w-4" />
      </Button>
      <Button aria-label="Dark" variant="outline" size="sm" onClick={() => setTheme("dark")}>
        <Moon className="h-4 w-4" />
      </Button>
      <Button aria-label="System" variant="outline" size="sm" onClick={() => setTheme("system")}>
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}
