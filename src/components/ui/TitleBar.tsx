import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X, Gamepad2 } from "lucide-react";

const appWindow = getCurrentWindow();

export const TitleBar: React.FC = () => {
  return (
    <div 
      className="titlebar"
      style={{
        gridColumn: '1 / span 2',
        height: '40px',
        background: 'var(--bg-sidebar)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none',
        borderBottom: '1px solid var(--border)',
