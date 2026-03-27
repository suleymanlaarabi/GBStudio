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
  onConfirm: (values: Record<string, any>) => void;
}

type ModalProps =
  | TextModalProps
  | SelectModalProps
  | ConfirmModalProps
  | MultiModalProps;

export const Modal: React.FC<ModalProps> = (props) => {
  const initialValue =
    props.type === "confirm" || props.type === "multi" ? "" : props.defaultValue || "";
  const [value, setValue] = useState<string>(initialValue);
  const [multiValues, setMultiValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    if (props.type === "multi") {
      props.fields.forEach((f) => {
        init[f.name] = f.defaultValue ?? "";
      });
    }
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  if (!props.isOpen) return null;

  const validateTextField = (val: string, fieldProps: TextModalProps): string | null => {
    if (fieldProps.required && !val.trim()) {
      return "This field is required";
    }
    if (fieldProps.validate) {
      return fieldProps.validate(val);
    }
    return null;
  };

  const validateMultiField = (val: any, field: ModalField): string | null => {
    if (field.required && (val === "" || val === null || val === undefined)) {
      return "This field is required";
    }
    if (field.validate) {
      return field.validate(val);
    }
    return null;
