import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Database, Plus, Trash2, X } from "lucide-react";
import { GB_COLORS } from "../../constants/colors";
import { useStore } from "../../store";
import type { Tile, TileSize } from "../../types";
import { getTilesetPositionForTile, normalizeTilesetLayout } from "../../services/tileService";
