import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 bg-white/10 hover:bg-white/20 dark:bg-black/10 dark:hover:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="h-4 w-4 text-gray-700 dark:text-gray-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}