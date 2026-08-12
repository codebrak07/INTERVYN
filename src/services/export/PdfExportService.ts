import { AssessmentEvidence } from '../../types';
import { AssessmentEvidenceService } from '../evidence/AssessmentEvidenceService';

export class PdfExportService {
  /**
   * Generates and triggers browser PDF printing for the finalized AssessmentEvidence dossier.
   * Validates consistency before allowing export.
   */
  static exportPdf(evidence: AssessmentEvidence): { success: boolean; errors?: string[] } {
    // 1. Pre-PDF Evidence Consistency Check
    const validation = AssessmentEvidenceService.validateAssessmentEvidence(evidence);

    if (!validation.isValid) {
      console.error('[PdfExportService] Export blocked due to evidence inconsistency:', validation.errors);
      return {
        success: false,
        errors: validation.errors
      };
    }

    // 2. Trigger native clean browser print engine
    if (typeof window !== 'undefined') {
      window.print();
    }

    return { success: true };
  }
}
