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
