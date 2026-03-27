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
        zIndex: 1000,
      }}
    >
      <div 
        data-tauri-drag-region
        style={{ 
          flex: 1, 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          paddingLeft: '12px',
          cursor: 'default'
        }}
      >
        <Gamepad2 size={18} color="var(--accent)" style={{ pointerEvents: 'none' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8, pointerEvents: 'none' }}>GB-CART EDITOR</span>
      </div>

      <div style={{ display: 'flex', height: '100%' }}>
        <div className="titlebar-button" onClick={() => appWindow.minimize()}>
          <Minus size={14} />
        </div>
        <div className="titlebar-button" onClick={() => appWindow.toggleMaximize()}>
          <Square size={12} />
        </div>
        <div className="titlebar-button close" onClick={() => appWindow.close()}>
          <X size={16} />
        </div>
      </div>
    </div>
  );
};
