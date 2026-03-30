import { useEffect } from "react";
import { isEditableElement } from "../../utils/keyboard";

type ShortcutHandler = (event: KeyboardEvent) => void;

interface ShortcutDefinition {
  handler: ShortcutHandler;
  matcher: (event: KeyboardEvent) => boolean;
  allowInEditable?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: ShortcutDefinition[];
}

export const useKeyboardShortcuts = ({
  enabled = true,
  shortcuts,
}: UseKeyboardShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isEditable = isEditableElement(event.target);

      for (const shortcut of shortcuts) {
        if (!shortcut.allowInEditable && isEditable) continue;
        if (!shortcut.matcher(event)) continue;

        shortcut.handler(event);
        break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, shortcuts]);
};
