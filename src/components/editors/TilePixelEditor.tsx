import React, { useCallback, useEffect, useRef, useState } from "react";
import { Copy, FlipHorizontal, FlipVertical, RotateCw, RotateCcw } from "lucide-react";
import { GB_COLORS } from "../../constants/colors";
import { useStore } from "../../store";
import { useKeyboardShortcuts } from "../../store/hooks/useKeyboardShortcuts";
import type { GBColor } from "../../types";
import { drawCircle, drawRectangle, getCircleFromBounds, isPointInSelection } from "../../utils";
