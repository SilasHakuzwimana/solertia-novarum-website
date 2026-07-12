import { Request, Response } from "express";
import {
  getDbPool,
  isDatabaseConnected,
  inMemoryPartnerships,
  inMemoryApplications,
} from "../services/database.service";

export class StatsController {
  // Get public stats
  static async getStats(req: Request, res: Response) {
    try {
      let partnershipCount = 0;
      let applicationCount = 0;

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const partnershipResult = await db.query(
          "SELECT COUNT(*) FROM partnerships",
        );
        const applicationResult = await db.query(
          "SELECT COUNT(*) FROM applications",
        );
        partnershipCount = parseInt(partnershipResult.rows[0].count);
        applicationCount = parseInt(applicationResult.rows[0].count);
      } else {
        partnershipCount = inMemoryPartnerships.length;
        applicationCount = inMemoryApplications.length;
      }

      res.json({
        success: true,
        data: {
          partnerships: partnershipCount,
          applications: applicationCount,
          total: partnershipCount + applicationCount,
        },
        database: isDatabaseConnected() ? "connected" : "fallback-in-memory",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to get stats:", err);
      res.status(500).json({
        success: false,
        error: "Failed to get stats",
      });
    }
  }

  // Admin: Get detailed dashboard stats
  static async adminGetStats(req: Request, res: Response) {
    try {
      if (isDatabaseConnected()) {
        const db = getDbPool();

        // Get total counts
        const partnershipCount = await db.query(
          "SELECT COUNT(*) FROM partnerships",
        );
        const applicationCount = await db.query(
          "SELECT COUNT(*) FROM applications",
        );

        // Get status breakdown for partnerships
        const partnershipStatus = await db.query(
          "SELECT status, COUNT(*) as count FROM partnerships GROUP BY status",
        );

        // Get status breakdown for applications
        const applicationStatus = await db.query(
          "SELECT status, COUNT(*) as count FROM applications GROUP BY status",
        );

        // Get recent partnerships (last 7 days)
        const recentPartnerships = await db.query(
          "SELECT * FROM partnerships WHERE created_at > NOW() - INTERVAL '7 days' ORDER BY id ASC LIMIT 10",
        );

        // Get recent applications (last 7 days)
        const recentApplications = await db.query(
          "SELECT * FROM applications WHERE created_at > NOW() - INTERVAL '7 days' ORDER BY id ASC LIMIT 10",
        );

        // Get today's count
        const todayPartnerships = await db.query(
          "SELECT COUNT(*) FROM partnerships WHERE DATE(created_at) = CURRENT_DATE",
        );
        const todayApplications = await db.query(
          "SELECT COUNT(*) FROM applications WHERE DATE(created_at) = CURRENT_DATE",
        );

        // Get weekly trend (last 7 days)
        const weeklyPartnerships = await db.query(
          `SELECT DATE(created_at) as date, COUNT(*) as count 
           FROM partnerships 
           WHERE created_at > NOW() - INTERVAL '7 days' 
           GROUP BY DATE(created_at) 
           ORDER BY date DESC`,
        );
        const weeklyApplications = await db.query(
          `SELECT DATE(created_at) as date, COUNT(*) as count 
           FROM applications 
           WHERE created_at > NOW() - INTERVAL '7 days' 
           GROUP BY DATE(created_at) 
           ORDER BY date DESC`,
        );

        return res.json({
          success: true,
          data: {
            total: {
              partnerships: parseInt(partnershipCount.rows[0].count),
              applications: parseInt(applicationCount.rows[0].count),
              all:
                parseInt(partnershipCount.rows[0].count) +
                parseInt(applicationCount.rows[0].count),
            },
            today: {
              partnerships: parseInt(todayPartnerships.rows[0].count),
              applications: parseInt(todayApplications.rows[0].count),
              total:
                parseInt(todayPartnerships.rows[0].count) +
                parseInt(todayApplications.rows[0].count),
            },
            status: {
              partnerships: partnershipStatus.rows,
              applications: applicationStatus.rows,
            },
            recent: {
              partnerships: recentPartnerships.rows,
              applications: recentApplications.rows,
            },
            weekly: {
              partnerships: weeklyPartnerships.rows,
              applications: weeklyApplications.rows,
            },
          },
        });
      }

      // In-memory stats
      const today = new Date().toDateString();
      const todayPartnerships = inMemoryPartnerships.filter(
        (p) => new Date(p.createdAt).toDateString() === today,
      );
      const todayApplications = inMemoryApplications.filter(
        (a) => new Date(a.createdAt).toDateString() === today,
      );

      // Calculate status distribution for in-memory
      const partnershipStatusMap: Record<string, number> = {};
      inMemoryPartnerships.forEach((p) => {
        const status = p.status || "pending";
        partnershipStatusMap[status] = (partnershipStatusMap[status] || 0) + 1;
      });

      const applicationStatusMap: Record<string, number> = {};
      inMemoryApplications.forEach((a) => {
        const status = a.status || "pending";
        applicationStatusMap[status] = (applicationStatusMap[status] || 0) + 1;
      });

      // Weekly trend for in-memory (last 7 days)
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const pCount = inMemoryPartnerships.filter(
          (p) => new Date(p.createdAt).toDateString() === dateStr,
        ).length;
        const aCount = inMemoryApplications.filter(
          (a) => new Date(a.createdAt).toDateString() === dateStr,
        ).length;
        weeklyData.push({
          date: date.toISOString().split("T")[0],
          partnerships: pCount,
          applications: aCount,
        });
      }

      res.json({
        success: true,
        data: {
          total: {
            partnerships: inMemoryPartnerships.length,
            applications: inMemoryApplications.length,
            all: inMemoryPartnerships.length + inMemoryApplications.length,
          },
          today: {
            partnerships: todayPartnerships.length,
            applications: todayApplications.length,
            total: todayPartnerships.length + todayApplications.length,
          },
          status: {
            partnerships: Object.entries(partnershipStatusMap).map(
              ([status, count]) => ({ status, count }),
            ),
            applications: Object.entries(applicationStatusMap).map(
              ([status, count]) => ({ status, count }),
            ),
          },
          recent: {
            partnerships: inMemoryPartnerships.slice(0, 10),
            applications: inMemoryApplications.slice(0, 10),
          },
          weekly: {
            partnerships: weeklyData.map((d) => ({
              date: d.date,
              count: d.partnerships,
            })),
            applications: weeklyData.map((d) => ({
              date: d.date,
              count: d.applications,
            })),
          },
        },
      });
    } catch (err) {
      console.error("Failed to get admin stats:", err);
      res.status(500).json({
        success: false,
        error: "Failed to get admin stats",
      });
    }
  }

  // Get stats by date range
  static async getStatsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: "startDate and endDate are required",
        });
      }

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const partnerships = await db.query(
          `SELECT * FROM partnerships 
           WHERE DATE(created_at) BETWEEN $1 AND $2 
           ORDER BY id ASC`,
          [startDate, endDate],
        );
        const applications = await db.query(
          `SELECT * FROM applications 
           WHERE DATE(created_at) BETWEEN $1 AND $2 
           ORDER BY id ASC`,
          [startDate, endDate],
        );

        return res.json({
          success: true,
          data: {
            partnerships: partnerships.rows,
            applications: applications.rows,
            total: partnerships.rows.length + applications.rows.length,
            dateRange: { startDate, endDate },
          },
        });
      }

      // In-memory filtering
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const filteredPartnerships = inMemoryPartnerships.filter((p) => {
        const date = new Date(p.createdAt);
        return date >= start && date <= end;
      });
      const filteredApplications = inMemoryApplications.filter((a) => {
        const date = new Date(a.createdAt);
        return date >= start && date <= end;
      });

      res.json({
        success: true,
        data: {
          partnerships: filteredPartnerships,
          applications: filteredApplications,
          total: filteredPartnerships.length + filteredApplications.length,
          dateRange: { startDate, endDate },
        },
      });
    } catch (err) {
      console.error("Failed to get stats by date range:", err);
      res.status(500).json({
        success: false,
        error: "Failed to get stats by date range",
      });
    }
  }

  // Get top performing services (partnerships)
  static async getTopServices(req: Request, res: Response) {
    try {
      let serviceCounts: Record<string, number> = {};

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          "SELECT selected_services FROM partnerships WHERE selected_services IS NOT NULL",
        );

        result.rows.forEach((row) => {
          if (row.selected_services) {
            row.selected_services.forEach((service: string) => {
              serviceCounts[service] = (serviceCounts[service] || 0) + 1;
            });
          }
        });
      } else {
        inMemoryPartnerships.forEach((p) => {
          if (p.selectedServices) {
            p.selectedServices.forEach((service: string) => {
              serviceCounts[service] = (serviceCounts[service] || 0) + 1;
            });
          }
        });
      }

      // Sort by count and get top 10
      const sorted = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([service, count]) => ({ service, count }));

      res.json({
        success: true,
        data: sorted,
      });
    } catch (err) {
      console.error("Failed to get top services:", err);
      res.status(500).json({
        success: false,
        error: "Failed to get top services",
      });
    }
  }

  // Get track distribution (applications)
  static async getTrackDistribution(req: Request, res: Response) {
    try {
      let trackCounts: Record<string, number> = {};

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query("SELECT track_id FROM applications");

        result.rows.forEach((row) => {
          const track = row.track_id;
          trackCounts[track] = (trackCounts[track] || 0) + 1;
        });
      } else {
        inMemoryApplications.forEach((a) => {
          const track = a.trackId;
          trackCounts[track] = (trackCounts[track] || 0) + 1;
        });
      }

      const distribution = Object.entries(trackCounts).map(
        ([track, count]) => ({
          track: track.toUpperCase(),
          count,
          percentage: 0, // Will calculate below
        }),
      );

      const total = distribution.reduce((sum, d) => sum + d.count, 0);
      distribution.forEach((d) => {
        d.percentage = total > 0 ? Math.round((d.count / total) * 100) : 0;
      });

      res.json({
        success: true,
        data: distribution,
      });
    } catch (err) {
      console.error("Failed to get track distribution:", err);
      res.status(500).json({
        success: false,
        error: "Failed to get track distribution",
      });
    }
  }

  // Get education level distribution (applications)
  static async getEducationDistribution(req: Request, res: Response) {
    try {
      let educationCounts: Record<string, number> = {};

      if (isDatabaseConnected()) {
        const db = getDbPool();
        const result = await db.query(
          "SELECT education_level FROM applications WHERE education_level IS NOT NULL",
        );

        result.rows.forEach((row) => {
          const level = row.education_level;
          educationCounts[level] = (educationCounts[level] || 0) + 1;
        });
      } else {
        inMemoryApplications.forEach((a) => {
          const level = a.educationLevel || "Not specified";
          educationCounts[level] = (educationCounts[level] || 0) + 1;
        });
      }

      const distribution = Object.entries(educationCounts).map(
        ([level, count]) => ({
          level,
          count,
        }),
      );

      res.json({
        success: true,
        data: distribution,
      });
    } catch (err) {
      console.error("Failed to get education distribution:", err);
      res.status(500).json({
        success: false,
        error: "Failed to get education distribution",
      });
    }
  }
}
