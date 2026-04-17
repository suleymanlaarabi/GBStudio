export const SoundStudioStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
        .sound-control-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.8rem;
        }
        .sound-control-group label {
          flex: 1;
          font-size: 0.9rem;
          opacity: 0.8;
        }
        .sound-control-group input[type="range"] {
          flex: 2;
        }
        .sound-control-group span {
          width: 20px;
          text-align: right;
          font-family: monospace;
        }
        .sound-editor-section {
          background: rgba(255,255,255,0.03);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .sound-editor-section h4 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: var(--accent);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `,
    }}
  />
);
