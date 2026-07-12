import { Request, Response } from "express";
import {
  getDbPool,
  inMemoryAnnouncements,
  isDatabaseConnected,
} from "../services/database.service";

export interface Announcement {
  id: number;
  text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class AnnouncementController {
  // Get active announcement (public)
  async getActive(req: Request, res: Response): Promise<void> {
    try {
      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          `SELECT id, text, is_active, created_at, updated_at 
           FROM announcements 
           WHERE is_active = true 
           ORDER BY created_at DESC 
           LIMIT 1`,
        );

        if (result.rows.length === 0) {
          res.status(200).json({
            success: true,
            data: null,
            message: "No active announcement found",
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: result.rows[0],
        });
        return;
      }

      // Fallback to in-memory
      const activeAnnouncement = inMemoryAnnouncements.find((a) => a.is_active);
      res.status(200).json({
        success: true,
        data: activeAnnouncement || null,
      });
    } catch (error) {
      console.error("Error fetching announcement:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch announcement",
      });
    }
  }

  // Get all announcements (admin only)
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          `SELECT id, text, is_active, created_at, updated_at 
           FROM announcements 
           ORDER BY created_at DESC`,
        );

        res.status(200).json({
          success: true,
          data: result.rows,
        });
        return;
      }

      // Fallback to in-memory
      res.status(200).json({
        success: true,
        data: inMemoryAnnouncements,
      });
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch announcements",
      });
    }
  }

  // Create or update announcement (admin only)
  async upsert(req: Request, res: Response): Promise<void> {
    try {
      const { text } = req.body;

      // Validate input
      if (!text || text.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Announcement text is required",
        });
        return;
      }

      if (text.length > 500) {
        res.status(400).json({
          success: false,
          error: "Announcement text cannot exceed 500 characters",
        });
        return;
      }

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const client = await db.connect();

        try {
          await client.query("BEGIN");

          // Deactivate all existing announcements
          await client.query(
            "UPDATE announcements SET is_active = false, updated_at = CURRENT_TIMESTAMP",
          );

          // Create new announcement
          const result = await client.query(
            `INSERT INTO announcements (text, is_active, created_at, updated_at) 
             VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
             RETURNING id, text, is_active, created_at, updated_at`,
            [text.trim(), true],
          );

          await client.query("COMMIT");

          res.status(200).json({
            success: true,
            data: result.rows[0],
            message: "Announcement updated successfully",
          });
          return;
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        } finally {
          client.release();
        }
      }

      // Fallback to in-memory
      // Deactivate all existing
      inMemoryAnnouncements.forEach((a) => (a.is_active = false));

      // Create new
      const newAnnouncement: Announcement = {
        id: Date.now(),
        text: text.trim(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      inMemoryAnnouncements.push(newAnnouncement);

      res.status(200).json({
        success: true,
        data: newAnnouncement,
        message: "Announcement updated successfully (in-memory)",
      });
    } catch (error) {
      console.error("Error saving announcement:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save announcement",
      });
    }
  }

  // Delete announcement (admin only)
  async delete(req: Request, res: Response): Promise<void> {
    try {
      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          `UPDATE announcements 
           SET is_active = false, updated_at = CURRENT_TIMESTAMP 
           WHERE is_active = true 
           RETURNING id`,
        );

        if (result.rows.length === 0) {
          res.status(404).json({
            success: false,
            error: "No active announcement found to delete",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "Announcement deleted successfully",
        });
        return;
      }

      // Fallback to in-memory
      const activeIndex = inMemoryAnnouncements.findIndex((a) => a.is_active);
      if (activeIndex === -1) {
        res.status(404).json({
          success: false,
          error: "No active announcement found to delete",
        });
        return;
      }

      inMemoryAnnouncements[activeIndex].is_active = false;
      inMemoryAnnouncements[activeIndex].updated_at = new Date().toISOString();

      res.status(200).json({
        success: true,
        message: "Announcement deleted successfully (in-memory)",
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete announcement",
      });
    }
  }
}

export default new AnnouncementController();
