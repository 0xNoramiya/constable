import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

interface Report {
  id: string;
  caseId: string;
  title: string;
  description: string;
  findings: Finding[];
  evidenceHashes: string[];
  createdAt: string;
  reportHash: string;
}

interface Finding {
  type: 'suspicious' | 'confirmed' | 'info';
  description: string;
  addresses: string[];
  transactions: string[];
}

// In-memory storage (would be database in production)
const reports: Map<string, Report> = new Map();

/**
 * POST /api/report/create
 * Create a new investigation report
 */
router.post('/create', async (req, res) => {
  try {
    const { caseId, title, description, findings, evidenceHashes } = req.body;

    if (!caseId || !title || !description) {
      return res.status(400).json({
        error: 'caseId, title, and description are required'
      });
    }

    const reportId = crypto.randomUUID();
    
    // Generate report hash
    const reportData = JSON.stringify({
      caseId,
      title,
      description,
      findings,
      evidenceHashes,
      timestamp: Date.now()
    });
    const reportHash = crypto.createHash('sha256').update(reportData).digest('hex');

    const report: Report = {
      id: reportId,
      caseId,
      title,
      description,
      findings: findings || [],
      evidenceHashes: evidenceHashes || [],
      createdAt: new Date().toISOString(),
      reportHash
    };

    reports.set(reportId, report);

    res.status(201).json({
      reportId,
      caseId,
      reportHash,
      createdAt: report.createdAt,
      url: `/api/report/${reportId}`
    });
  } catch (error) {
    console.error('Report creation error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

/**
 * GET /api/report/:reportId
 * Get a report by ID
 */
router.get('/:reportId', (req, res) => {
  const { reportId } = req.params;
  const report = reports.get(reportId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.json(report);
});

/**
 * GET /api/report/case/:caseId
 * Get all reports for a case
 */
router.get('/case/:caseId', (req, res) => {
  const { caseId } = req.params;
  const caseReports = Array.from(reports.values())
    .filter(r => r.caseId === caseId);

  res.json({
    caseId,
    count: caseReports.length,
    reports: caseReports
  });
});

/**
 * POST /api/report/:reportId/verify
 * Verify a report hash
 */
router.post('/:reportId/verify', (req, res) => {
  const { reportId } = req.params;
  const { reportHash } = req.body;

  const report = reports.get(reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const isValid = report.reportHash === reportHash;

  res.json({
    reportId,
    isValid,
    storedHash: report.reportHash,
    providedHash: reportHash
  });
});

export { router as reportRouter };
