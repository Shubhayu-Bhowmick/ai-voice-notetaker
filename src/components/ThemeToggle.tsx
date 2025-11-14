"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" className="h-10 w-full justify-start" disabled>
        <Sun className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      className="h-10 w-full justify-start"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 mr-2" />
          Switch to Light Mode
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 mr-2" />
          Switch to Dark Mode
        </>
      )}
    </Button>
  );
}

