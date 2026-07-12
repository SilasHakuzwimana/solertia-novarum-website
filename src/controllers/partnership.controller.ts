import { Request, Response } from "express";
import {
  getDbPool,
  isDatabaseConnected,
  inMemoryPartnerships,
} from "../services/database.service";

export class PartnershipController {
  // Get all partnerships (public) - order by ID ASC
  static async getAll(req: Request, res: Response) {
    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          "SELECT * FROM partnerships ORDER BY id ASC",
        );
        return res.json(result.rows);
      } catch (err) {
        console.error("Failed to fetch from database:", err);
      }
    }
    const sorted = [...inMemoryPartnerships].sort(
      (a, b) => (a.id || 0) - (b.id || 0),
    );
    res.json(sorted);
  }

  // Get single partnership
  static async getOne(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          "SELECT * FROM partnerships WHERE id = $1",
          [id],
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Partnership not found" });
        }
        return res.json(result.rows[0]);
      } catch (err) {
        console.error("Failed to fetch from database:", err);
        return res.status(500).json({ error: "Database error" });
      }
    }
    const record = inMemoryPartnerships.find((p) => p.id === id);
    if (!record) {
      return res.status(404).json({ error: "Partnership not found" });
    }
    res.json(record);
  }

  // Create partnership
  static async create(req: Request, res: Response) {
    const {
      companyName,
      contactName,
      email,
      projectScope,
      budgetRange,
      selectedServices,
    } = req.body;

    if (!companyName || !contactName || !email) {
      return res.status(400).json({
        error: "Missing required companyName, contactName, or email.",
      });
    }

    const record = {
      companyName,
      contactName,
      email,
      projectScope: projectScope || "",
      budgetRange: budgetRange || "Enterprise Level (SLA Based)",
      selectedServices: selectedServices || [],
      createdAt: new Date().toISOString(),
    };

    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          `INSERT INTO partnerships (company_name, contact_name, email, project_scope, budget_range, selected_services)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            companyName,
            contactName,
            email,
            projectScope,
            budgetRange,
            selectedServices,
          ],
        );
        return res.status(201).json({
          message: "Partnership registered successfully in PostgreSQL DB.",
          data: result.rows[0],
        });
      } catch (err) {
        console.error(
          "Failed to insert into postgres, falling back to memory:",
          err,
        );
      }
    }

    const newRecord = { ...record, id: inMemoryPartnerships.length + 1 };
    inMemoryPartnerships.push(newRecord);
    res
      .status(201)
      .json({
        message: "Partnership saved in fallback memory.",
        data: newRecord,
      });
  }

  // Delete partnership
  static async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          "DELETE FROM partnerships WHERE id = $1 RETURNING *",
          [id],
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Partnership not found" });
        }
        return res.json({ message: "Partnership deleted successfully" });
      } catch (err) {
        console.error("Failed to delete from database:", err);
        return res.status(500).json({ error: "Database error" });
      }
    }
    // In-memory deletion
    const index = inMemoryPartnerships.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Partnership not found" });
    }
    inMemoryPartnerships.splice(index, 1);
    res.json({ message: "Partnership deleted successfully" });
  }

  // Admin: Get all partnerships - ORDER BY created_at DESC (newest first)
  static async adminGetAll(req: Request, res: Response) {
    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          "SELECT * FROM partnerships ORDER BY created_at DESC",
        );
        return res.json({
          success: true,
          data: result.rows,
          count: result.rows.length,
        });
      } catch (err) {
        console.error("Failed to fetch partnerships:", err);
        return res.status(500).json({ error: "Database error" });
      }
    }
    // Sort by created_at descending (newest first)
    const sorted = [...inMemoryPartnerships].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    res.json({
      success: true,
      data: sorted,
      count: sorted.length,
    });
  }

  // Admin: Update partnership
  static async adminUpdate(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { status, notes } = req.body;

    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const checkResult = await db.query(
          "SELECT * FROM partnerships WHERE id = $1",
          [id],
        );

        if (checkResult.rows.length === 0) {
          return res.status(404).json({ error: "Partnership not found" });
        }

        await db.query(
          "UPDATE partnerships SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3",
          [status || "pending", notes || null, id],
        );

        const updated = await db.query(
          "SELECT * FROM partnerships WHERE id = $1",
          [id],
        );

        return res.json({
          success: true,
          message: "Partnership updated successfully",
          data: updated.rows[0],
        });
      } catch (err) {
        console.error("Failed to update partnership:", err);
        return res.status(500).json({ error: "Database error" });
      }
    }

    // In-memory update
    const index = inMemoryPartnerships.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Partnership not found" });
    }

    const updated = {
      ...inMemoryPartnerships[index],
      status: status || "pending",
      notes: notes || "",
    };
    inMemoryPartnerships[index] = updated;

    res.json({
      success: true,
      message: "Partnership updated successfully",
      data: updated,
    });
  }

  // Admin: Delete partnership
  static async adminDelete(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    if (isDatabaseConnected()) {
      try {
        const db = getDbPool();
        const result = await db.query(
          "DELETE FROM partnerships WHERE id = $1 RETURNING *",
          [id],
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Partnership not found" });
        }

        return res.json({
          success: true,
          message: "Partnership deleted successfully",
          data: result.rows[0],
        });
      } catch (err) {
        console.error("Failed to delete partnership:", err);
        return res.status(500).json({ error: "Database error" });
      }
    }

    // In-memory deletion
    const index = inMemoryPartnerships.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Partnership not found" });
    }

    const deleted = inMemoryPartnerships[index];
    inMemoryPartnerships.splice(index, 1);

    res.json({
      success: true,
      message: "Partnership deleted successfully",
      data: deleted,
    });
  }
}
