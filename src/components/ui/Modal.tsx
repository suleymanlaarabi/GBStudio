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
  };

  const handleConfirm = () => {
    if (props.type === "confirm") {
      props.onConfirm();
    } else if (props.type === "multi") {
      props.onConfirm(multiValues);
    } else {
      props.onConfirm(value as any);
    }
  };

  const updateMultiValue = (name: string, val: any) => {
    setMultiValues((prev) => ({ ...prev, [name]: val }));
    const field = props.type === "multi" ? props.fields.find(f => f.name === name) : undefined;
    if (field) {
      const error = validateMultiField(val, field);
      setErrors(prev => ({
        ...prev,
        [name]: error || null
      }));
    }
  };

  const isFormValid = (): boolean => {
    if (props.type === "text" || props.type === "number") {
      const error = validateTextField(value, props as TextModalProps);
      return !error;
    } else if (props.type === "multi") {
      // Validate all fields in multi form
      for (const field of props.fields) {
        const error = validateMultiField(multiValues[field.name], field);
        if (error) return false;
      }
      return true;
    }
    return true;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (props.type === "text" || props.type === "number") {
      const error = validateTextField(newValue, props as TextModalProps);
      setErrors(prev => ({
        ...prev,
        __main__: error || null
      }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <div className="section-title">
          {props.title}
          <button
            className="btn btn-secondary"
            style={{ padding: "4px" }}
            onClick={props.onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "1rem 0", width: "100%" }}>
          {props.type === "confirm" ? (
            <div style={{ width: "100%" }}>
              <p style={{ color: "#eee", margin: 0 }}>{props.message}</p>
            </div>
          ) : props.type === "text" || props.type === "number" ? (
            <div style={{ width: "100%" }}>
              <input
                autoFocus
                type={props.type}
                className="btn btn-secondary"
                style={{ width: "100%", textAlign: "left", cursor: "text", boxSizing: "border-box" }}
                value={value}
                onChange={handleTextChange}
                placeholder={props.placeholder}
                onKeyDown={(e) => e.key === "Enter" && isFormValid() && handleConfirm()}
              />
              {errors.__main__ && (
                <div style={{ marginTop: "0.35rem", color: "#ff7a7a", fontSize: "0.75rem" }}>
                  {errors.__main__}
                </div>
              )}
            </div>
          ) : props.type === "select" ? (
            <div style={{ width: "100%" }}>
              <CustomSelect
                value={value}
                onChange={(nextValue) => setValue(String(nextValue))}
                options={props.options || []}
                placeholder="Select..."
              />
            </div>
          ) : props.type === "multi" && "fields" in props ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                width: "100%",
              }}
            >
              {props.fields.map((field) => (
                <div
                  key={field.name}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    width: "100%",
                  }}
                >
                  <label
                    style={{ fontSize: "0.8rem", color: "#aaa", display: "block" }}
                  >
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <div style={{ width: "100%" }}>
                      <CustomSelect
                        value={multiValues[field.name] || ''}
                        onChange={(val) => updateMultiValue(field.name, val)}
                        options={field.options || []}
                        placeholder="Select..."
                      />
                    </div>
                  ) : (
                    <div style={{ width: "100%" }}>
                      <input
                        type={field.type}
                        className="btn btn-secondary"
                        style={{
                          width: "100%",
                          textAlign: "left",
                          cursor: "text",
                          boxSizing: "border-box",
                        }}
                        value={multiValues[field.name] || ""}
                        onChange={(e) =>
                          updateMultiValue(field.name, e.target.value)
                        }
                        placeholder={field.label}
                      />
                      {errors[field.name] && (
                        <div style={{ marginTop: "0.35rem", color: "#ff7a7a", fontSize: "0.75rem" }}>
                          {errors[field.name]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button
            className="btn"
            style={{ flex: 1, background: "#22c55e", justifyContent: "center" }}
            onClick={handleConfirm}
            disabled={!isFormValid()}
          >
            <Check size={18} /> {props.type === "confirm" ? "Confirm" : "OK"}
          </button>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={props.onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
