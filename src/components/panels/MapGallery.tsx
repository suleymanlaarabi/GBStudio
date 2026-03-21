import React, { useEffect, useRef, useState } from "react";
import { Edit3, Map as MapIcon, Plus, Trash2, Package } from "lucide-react";
import { GB_COLORS } from "../../constants/colors";
import { useStore } from "../../store";
import type { TileMap, Tileset, TileSize } from "../../types";
import { CHUNK_SIZE } from "../../types/map";
import { Modal } from "../ui/Modal";
import { ExportTemplateModal } from "../ui/ExportTemplateModal";
