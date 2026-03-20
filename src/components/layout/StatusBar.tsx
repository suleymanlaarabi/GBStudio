import { CheckCircle2, AlertTriangle, Info, LoaderCircle, Keyboard } from "lucide-react";
import { useStore } from "../../store";

export type StatusTone = "info" | "success" | "error" | "busy";

interface StatusBarProps {
  message: string;
  tone: StatusTone;
  onOpenShortcuts: () => void;
}

const TONE_ICON = {
  info: Info,
  success: CheckCircle2,
  error: AlertTriangle,
  busy: LoaderCircle,
} as const;

export const StatusBar = ({ message, tone, onOpenShortcuts }: StatusBarProps) => {
  const {
    view,
