import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

export type ModalType = "text" | "select" | "confirm" | "number" | "multi";

interface ModalField {
  name: string;
  label: string;
  type: "text" | "number" | "select";
  defaultValue?: string | number;
  options?: { label: string; value: string | number }[];
  required?: boolean;
  validate?: (value: any) => string | null;
}

interface BaseModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

interface TextModalProps extends BaseModalProps {
  type?: "text" | "number";
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  required?: boolean;
  validate?: (value: string) => string | null;
}

interface SelectModalProps extends BaseModalProps {
  type: "select";
  options: { label: string; value: string }[];
  defaultValue?: string;
  onConfirm: (value: string) => void;
}

interface ConfirmModalProps extends BaseModalProps {
  type: "confirm";
  message: string;
  onConfirm: () => void;
}

interface MultiModalProps extends BaseModalProps {
  type: "multi";
  fields: ModalField[];
