import React, { useState, useEffect } from "react";
import { Bell, Save, X, Edit2, Trash2, AlertCircle } from "lucide-react";
import {
  AnnouncementService,
  Announcement,
} from "../../services/announcement.service";

interface AnnouncementEditorProps {
  token: string;
  onUpdate?: () => void;
}

const AnnouncementEditor: React.FC<AnnouncementEditorProps> = ({
  token,
  onUpdate,
}) => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch current announcement on mount
  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const data = await AnnouncementService.getActiveAnnouncement(token);
      setAnnouncement(data);
      if (data) {
        setText(data.text);
      }
    } catch (error) {
      console.error("Failed to fetch announcement:", error);
    }
  };

  const handleSave = async () => {
    if (!text.trim()) {
      setError("Announcement text cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await AnnouncementService.updateAnnouncement(
        token,
        text.trim(),
      );
      if (result) {
        setAnnouncement(result);
        setSuccess("Announcement saved successfully!");
        setEditing(false);
        if (onUpdate) onUpdate();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to save announcement");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this announcement?")) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const success = await AnnouncementService.deleteAnnouncement(token);
      if (success) {
        setAnnouncement(null);
        setText("");
        setSuccess("Announcement removed successfully!");
        setEditing(false);
        if (onUpdate) onUpdate();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to remove announcement");
      }
    } catch (err: any) {
      setError(err.message || "Failed to remove announcement");
    } finally {
      setLoading(false);
    }
  };

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Edit Announcement
          </h3>
        </div>

        <div className="space-y-4 text-slate-950">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Announcement Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 text-sm resize-none transition-all"
              placeholder="Enter your announcement text here..."
              maxLength={500}
            />
            <div className="text-xs text-slate-400 mt-1 text-right">
              {text.length}/500 characters
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-[#007aff] hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Announcement
                </>
              )}
            </button>
            {announcement && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                setEditing(false);
                setError(null);
                if (announcement) {
                  setText(announcement.text);
                }
              }}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Site Announcement
            </h3>
            <p className="text-sm text-slate-500">
              {announcement
                ? "Current announcement is active"
                : "No announcement set"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 bg-[#007aff] hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          {announcement ? "Edit" : "Add"}
        </button>
      </div>

      {announcement && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Bell className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wider block">
                Active Announcement
              </span>
              <p className="text-sm text-slate-700 mt-1">{announcement.text}</p>
              {announcement.updated_at && (
                <span className="text-xs text-slate-400 mt-2 block">
                  Last updated:{" "}
                  {new Date(announcement.updated_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementEditor;
