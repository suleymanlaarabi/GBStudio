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
