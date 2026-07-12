import React, { useState } from "react";
import {
  X,
  Send,
  Mail,
  User,
  Briefcase,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    email: string;
    name: string;
    type: "partnership" | "application";
    company?: string;
    track?: string;
  };
  token: string;
  onSuccess?: () => void;
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  recipient,
  token,
  onSuccess,
}) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeAttachments, setIncludeAttachments] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!subject.trim()) {
      setError("Please enter a subject");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/email/send-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: recipient.email,
          subject: subject,
          message: message,
          recipientName: recipient.name,
          recipientType: recipient.type,
          includeAttachments: includeAttachments,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`✅ Email sent successfully to ${recipient.email}`);
        setSubject("");
        setMessage("");
        setTimeout(() => {
          setSuccess(null);
          onClose();
          if (onSuccess) onSuccess();
        }, 3000);
      } else {
        setError(data.error || "Failed to send email");
      }
    } catch (err) {
      setError("❌ Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRecipientInfo = () => {
    if (recipient.type === "partnership") {
      return {
        icon: <Briefcase className="w-4 h-4" />,
        label: "Partnership",
        details: recipient.company || recipient.name,
      };
    }
    return {
      icon: <User className="w-4 h-4" />,
      label: "Application",
      details: `${recipient.name} - ${recipient.track || "N/A"}`,
    };
  };

  const info = getRecipientInfo();

  // Pre-fill subject based on recipient type
  React.useEffect(() => {
    if (isOpen && !subject) {
      const defaultSubject =
        recipient.type === "partnership"
          ? `Re: Partnership Inquiry - ${recipient.company || recipient.name}`
          : `Re: Application Status - ${recipient.name}`;
      setSubject(defaultSubject);
    }
  }, [isOpen, recipient, subject]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-slate-950 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#007aff]" />
            Reply to{" "}
            {recipient.type === "partnership" ? "Partnership" : "Applicant"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Recipient Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-700">To:</span>
              <span className="text-slate-900">{recipient.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-700">Recipient:</span>
              <span className="text-slate-900 flex items-center gap-1">
                {info.icon}
                {info.details}
              </span>
              <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full">
                {info.label}
              </span>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-slate-950 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#007aff] text-sm"
              placeholder="Email subject"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 text-slate-950 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#007aff] text-sm resize-none"
              placeholder={`Dear ${recipient.name},`}
              required
            />
            <div className="text-xs text-slate-400 mt-1">
              {message.length} characters
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeAttachments}
                onChange={(e) => setIncludeAttachments(e.target.checked)}
                className="w-4 h-4 text-[#007aff] focus:ring-[#007aff] border-slate-300 rounded"
              />
              Include report attachment (optional)
            </label>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSend}
              disabled={loading}
              className="flex-1 bg-linear-to-r from-[#007aff] to-teal-500 hover:from-teal-500 hover:to-[#007aff] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending email {recipient.name}...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email to {recipient.name}
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-500 hover:bg-slate-450 border border-slate-200 rounded-lg text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;
