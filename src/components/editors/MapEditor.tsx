import { useEffect } from "react";
import { useStore } from "../../store";
import { MapCanvas } from "./map-editor/MapCanvas";
import { MapEditorHeader } from "./map-editor/MapEditorHeader";
import { MapToolBar } from "./map-editor/MapToolBar";
import { MapAssetPanel } from "./map-editor/MapAssetPanel";
import { LayersPanel } from "./map-editor/LayersPanel";
import { useMapEditorShortcuts } from "./map-editor/useMapEditorShortcuts";
import { useMapEditorInteraction } from "./map-editor/useMapEditorInteraction";

export const MapEditor = () => {
  const {
    maps,
    activeMapIndex,
    tilesets,
    activeTileIndex,
    setActiveTile,
    zoom,
    setZoom,
    setView,
    activeTilesetIndex,
    setActiveTileset,
    mapTool,
    setMapTool,
    mapShapeFilled,
    setMapShapeFilled,
    mapSelection,
    mapClipboard,
    clearMapSelection,
    copyMapSelection,
    cutMapSelection,
    pasteMapSelection,
    deleteMapSelection,
  } = useStore();

  const map = maps[activeMapIndex];
  const activeTileset = tilesets[activeTilesetIndex];
  const tileSize = map?.tileSize || 8;
  const unitSize = tileSize * zoom;

  const {
    isDrawing,
    dragStart,
    hoverCell,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  } = useMapEditorInteraction({
    map,
    activeMapIndex,
    activeTileset,
    activeTileIndex,
  });

  useMapEditorShortcuts({ hoverCell });

  useEffect(() => {
    if (!map) return;

    const activeTileset = tilesets[activeTilesetIndex];
    if (!activeTileset || activeTileset.tileSize !== map.tileSize) {
      const compatibleIndex = tilesets.findIndex(
        (ts) => ts.tileSize === map.tileSize,
      );
      if (compatibleIndex !== -1) {
        setActiveTileset(compatibleIndex);
      }
    }
  }, [map, tilesets, activeTilesetIndex, setActiveTileset]);

  if (!map) return <div>Map not found</div>;

  return (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <MapEditorHeader
          map={map}
          zoom={zoom}
          setZoom={setZoom}
          setView={setView}
        />

        <MapToolBar
          mapTool={mapTool}
          setMapTool={setMapTool}
          mapShapeFilled={mapShapeFilled}
          setMapShapeFilled={setMapShapeFilled}
          mapSelection={mapSelection}
          mapClipboard={mapClipboard}
          copyMapSelection={copyMapSelection}
          cutMapSelection={cutMapSelection}
          pasteMapSelection={pasteMapSelection}
          deleteMapSelection={deleteMapSelection}
          clearMapSelection={clearMapSelection}
          hoverCell={hoverCell}
        />

        <MapCanvas
          map={map}
          tilesets={tilesets}
          zoom={zoom}
          tileSize={tileSize}
          unitSize={unitSize}
          isDrawing={isDrawing}
          dragStart={dragStart}
          hoverCell={hoverCell}
          mapTool={mapTool}
          mapSelection={mapSelection}
          mapShapeFilled={mapShapeFilled}
          onMouseDown={(_, coords) => handleMouseDown(coords)}
          onMouseMove={(_, coords) => handleMouseMove(coords)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <LayersPanel mapIndex={activeMapIndex} />
        <MapAssetPanel
          tilesets={tilesets}
          activeTilesetIndex={activeTilesetIndex}
          setActiveTileset={setActiveTileset}
          activeTileIndex={activeTileIndex}
          setActiveTile={setActiveTile}
          tileSize={tileSize}
          mapTool={mapTool}
          mapSelection={mapSelection}
        />
      </div>
    </div>
  );
};
