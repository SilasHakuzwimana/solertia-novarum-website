// ConfirmationModal.tsx - Enhanced version
import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  danger = true,
  icon,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && !loading) onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-2 ${
                  danger ? "bg-red-50" : "bg-amber-50"
                }`}
              >
                {icon || (
                  <AlertTriangle
                    className={`w-6 h-6 ${
                      danger ? "text-red-500" : "text-amber-500"
                    }`}
                  />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              disabled={loading}
            >
              <X className="w-5 h-5 text-[#ff0000]" />
            </button>
          </div>

          {/* Message */}
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            {message}
          </p>

          {/* Warning for critical actions */}
          {danger && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6">
              <p className="text-red-700 text-xs font-medium flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                This action cannot be undone
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 text-slate-950">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-950 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-200 text-sm ${
                danger
                  ? "bg-red-500 text-slate-100 hover:bg-red-600 active:bg-red-700"
                  : "bg-[#007aff] hover:bg-blue-600 active:bg-blue-700"
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
