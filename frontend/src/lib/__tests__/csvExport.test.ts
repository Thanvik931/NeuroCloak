// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { escapeCSV, exportDecisionsToCSV, exportAnalyticsSummaryCSV } from '../csvExport';

describe('CSV Export Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('escapeCSV', () => {
    it('returns empty quotes for null and undefined', () => {
      expect(escapeCSV(null)).toBe('""');
      expect(escapeCSV(undefined)).toBe('""');
    });

    it('wraps plain strings in quotes', () => {
      expect(escapeCSV('NeuroCloak')).toBe('"NeuroCloak"');
      expect(escapeCSV(12345)).toBe('"12345"');
    });

    it('escapes internal quotes following RFC 4180', () => {
      expect(escapeCSV('He said "Approved"')).toBe('"He said ""Approved"""');
    });

    it('handles commas and newlines safely', () => {
      expect(escapeCSV('line 1\nline 2, item 3')).toBe('"line 1\nline 2, item 3"');
    });

    it('stringifies and escapes nested JSON objects', () => {
      const obj = { age: 45, credit: 50000 };
      expect(escapeCSV(obj)).toBe('"{""age"":45,""credit"":50000}"');
    });
  });

  describe('exportDecisionsToCSV', () => {
    it('alerts and exits cleanly if decision list is empty', () => {
      window.alert = vi.fn();
      exportDecisionsToCSV([]);
      expect(window.alert).toHaveBeenCalledWith('No decision records available to export.');
    });

    it('formats decisions and triggers browser download', () => {
      const mockDecisions = [
        {
          id: 'dec-001',
          aiSystem: { name: 'Credit Sentinel', domain: 'finance' },
          status: 'APPROVED',
          confidenceScore: 0.942,
          ethicalComplianceRate: 1.0,
          biasFlags: [],
          inputData: { age: 35 },
          createdAt: '2026-10-13T10:00:00Z',
        },
      ];

      const createElementSpy = vi.spyOn(document, 'createElement');
      const clickSpy = vi.fn();

      createElementSpy.mockReturnValue({
        setAttribute: vi.fn(),
        style: {},
        click: clickSpy,
      } as any);

      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as any));
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as any));
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      exportDecisionsToCSV(mockDecisions, 'test-decisions.csv');
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('exportAnalyticsSummaryCSV', () => {
    it('generates benchmark analytics rows and triggers download', () => {
      const mockBenchmarks = {
        models: {
          finance: {
            model_name: 'RandomForestClassifier',
            dataset: 'German Credit UCI (N=1,000)',
            test_sample_count: 200,
            accuracy: 78.5,
            precision: 81.2,
            recall: 75.4,
            f1_score: 0.782,
            roc_auc: 0.824,
            baseline_disparity_pct: 18.2,
            repaired_disparity_pct: 4.1,
            disparity_reduction_delta: '+29.86%',
            calibrated_threshold_theta: 0.491,
          },
        },
      };

      const clickSpy = vi.fn();
      vi.spyOn(document, 'createElement').mockReturnValue({
        setAttribute: vi.fn(),
        style: {},
        click: clickSpy,
      } as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as any));
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as any));
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-analytics');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      exportAnalyticsSummaryCSV(mockBenchmarks, []);
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
