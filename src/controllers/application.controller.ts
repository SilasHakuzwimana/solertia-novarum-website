import { Request, Response } from "express";
import {
  getDbPool,
  isDatabaseConnected,
  inMemoryApplications,
} from "../services/database.service";

export class ApplicationController {
  // Get all applications (public) - order by ID ASC
  static async getAll(req: Request, res: Response) {
    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          "SELECT * FROM applications ORDER BY id ASC"
        );
        return res.json(result.rows);
      } catch (err) {
        console.error("Failed to fetch from database:", err);
      }
    }
    const sorted = [...inMemoryApplications].sort(
      (a, b) => (a.id || 0) - (b.id || 0)
    );
    res.json(sorted);
  }

  // Get single application
  static async getOne(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          "SELECT * FROM applications WHERE id = $1",
          [id]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Application not found" });
        }
        return res.json(result.rows[0]);
      } catch (err) {
        console.error("Failed to fetch from database:", err);
        return res.status(500).json({ error: "Database error" });
      }
    }
    const record = inMemoryApplications.find(a => a.id === id);
    if (!record) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json(record);
  }

  // Create application
  static async create(req: Request, res: Response) {
    const {
      fullName,
      email,
      trackId,
      educationLevel,
      institution,
      experienceLevel,
      statement,
    } = req.body;

    if (!fullName || !email || !trackId) {
      return res
        .status(400)
        .json({ error: "Missing required fullName, email, or trackId." });
    }

    const record = {
      fullName,
      email,
      trackId,
      educationLevel,
      institution,
      experienceLevel,
      statement,
      createdAt: new Date().toISOString(),
    };

    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          `INSERT INTO applications (full_name, email, track_id, education_level, institution, experience_level, statement)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            fullName,
            email,
            trackId,
            educationLevel,
            institution,
            experienceLevel,
            statement,
          ]
        );
        return res.status(201).json({
          message: "Application registered successfully in PostgreSQL DB.",
          data: result.rows[0],
        });
      } catch (err) {
        console.error(
          "Failed to insert into postgres applications, falling back to memory:",
          err
        );
      }
    }

    const newRecord = { ...record, id: inMemoryApplications.length + 1 };
    inMemoryApplications.push(newRecord);
    res
      .status(201)
      .json({ message: "Application saved in fallback memory.", data: newRecord });
  }

  // Delete application
  static async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          "DELETE FROM applications WHERE id = $1 RETURNING *",
          [id]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Application not found" });
        }
        return res.json({ message: "Application deleted successfully" });
      } catch (err) {
        console.error("Failed to delete from database:", err);
        return res.status(500).json({ error: "Database error" });
      }
    }
    const index = inMemoryApplications.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Application not found" });
    }
    inMemoryApplications.splice(index, 1);
    res.json({ message: "Application deleted successfully" });
  }

  // Admin: Get all applications - ORDER BY created_at DESC (newest first)
  static async adminGetAll(req: Request, res: Response) {
    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          "SELECT * FROM applications ORDER BY created_at DESC"
        );
        return res.json({
          success: true,
          data: result.rows,
          count: result.rows.length,
        });
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        return res.status(500).json({ error: "Database error" });
      }
    }
    // Sort by created_at descending (newest first)
    const sorted = [...inMemoryApplications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({
      success: true,
      data: sorted,
      count: sorted.length,
    });
  }

  // Admin: Update application
  static async adminUpdate(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { status, notes } = req.body;

    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const checkResult = await db.query(
          "SELECT * FROM applications WHERE id = $1",
          [id]
        );

        if (checkResult.rows.length === 0) {
          return res.status(404).json({ error: "Application not found" });
        }

        await db.query(
          "UPDATE applications SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3",
          [status || "pending", notes || null, id]
        );

        const updated = await db.query(
          "SELECT * FROM applications WHERE id = $1",
          [id]
        );

        return res.json({
          success: true,
          message: "Application updated successfully",
          data: updated.rows[0],
        });
      } catch (err) {
        console.error("Failed to update application:", err);
        return res.status(500).json({ error: "Database error" });
      }
    }

    // In-memory update
    const index = inMemoryApplications.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Application not found" });
    }

    const updated = {
      ...inMemoryApplications[index],
      status: status || "pending",
      notes: notes || "",
    };
    inMemoryApplications[index] = updated;

    res.json({
      success: true,
      message: "Application updated successfully",
      data: updated,
    });
  }

  // Admin: Delete application
  static async adminDelete(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          "DELETE FROM applications WHERE id = $1 RETURNING *",
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Application not found" });
        }

        return res.json({
          success: true,
          message: "Application deleted successfully",
          data: result.rows[0],
        });
      } catch (err) {
        console.error("Failed to delete application:", err);
        return res.status(500).json({ error: "Database error" });
      }
    }

    // In-memory deletion
    const index = inMemoryApplications.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Application not found" });
    }

    const deleted = inMemoryApplications[index];
    inMemoryApplications.splice(index, 1);

    res.json({
      success: true,
      message: "Application deleted successfully",
      data: deleted,
    });
  }
}
