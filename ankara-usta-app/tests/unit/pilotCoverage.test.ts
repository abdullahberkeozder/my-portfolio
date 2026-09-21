import { describe, expect, it } from 'vitest';
import {
  CORE_PILOT_DISTRICTS,
  CORE_PILOT_SERVICES,
  EXTENDED_PILOT_DISTRICTS,
  getPilotCoverage,
  getServiceCalibration,
  isCorePilotService,
} from '../../app/data/pilotCoverage';
import { getCalibratedServiceScope, packageScopePreview } from '../../app/data/serviceGuidance';
import { services } from '../../app/data/serviceTaxonomy';

describe('pilot coverage and calibration', () => {
  it('defines the core pilot scope with exactly 5 services and 5 districts', () => {
    expect(CORE_PILOT_SERVICES).toHaveLength(5);
    expect(CORE_PILOT_DISTRICTS).toHaveLength(5);
    expect(EXTENDED_PILOT_DISTRICTS).toHaveLength(4);
  });

  it('guarantees zero synthetic artisan profiles across all districts and services', () => {
    const coreResult = getPilotCoverage('Çankaya', 'musluk-degisimi');
    expect(coreResult.tier).toBe('core');
    expect(coreResult.isCoreDistrict).toBe(true);
    expect(coreResult.isCoreService).toBe(true);
    expect(coreResult.hasSyntheticArtisans).toBe(false);
    expect(coreResult.message).toContain('çekirdek pilot bölgesindedir');

    const extendedResult = getPilotCoverage('Gölbaşı', 'su-kacagi');
    expect(extendedResult.tier).toBe('extended');
    expect(extendedResult.isCoreDistrict).toBe(false);
    expect(extendedResult.hasSyntheticArtisans).toBe(false);
    expect(extendedResult.message).toContain('genişletilmektedir');

    const unsupportedResult = getPilotCoverage('Polatlı', 'elektrik-arizasi');
    expect(unsupportedResult.tier).toBe('unsupported');
    expect(unsupportedResult.isCoreDistrict).toBe(false);
    expect(unsupportedResult.hasSyntheticArtisans).toBe(false);
    expect(unsupportedResult.message).toContain('henüz aktif pilot kapsama alanımızda değildir');
  });

  it('provides complete calibration for all 5 core pilot services', () => {
    for (const serviceId of CORE_PILOT_SERVICES) {
      expect(isCorePilotService(serviceId)).toBe(true);
      const calibration = getServiceCalibration(serviceId);
      expect(calibration).toBeDefined();
      expect(calibration?.isCorePilot).toBe(true);
      expect(calibration?.includedScope).toHaveLength(3);
      expect(calibration?.excludedScope).toHaveLength(3);
      expect(['package', 'inspection', 'quote']).toContain(calibration?.deliveryModel);

      // Verify that the service exists in the canonical taxonomy
      const canonicalService = services.find(s => s.id === serviceId);
      expect(canonicalService).toBeDefined();
    }
  });

  it('calibrated scope returns service-specific scopes and falls back gracefully', () => {
    const muslukScope = getCalibratedServiceScope('musluk-degisimi');
    expect(muslukScope.included[0]).toContain('demontajı');
    expect(muslukScope.excluded[0]).toContain('Duvar içi');

    const uncalibratedScope = getCalibratedServiceScope('kombi-bakimi');
    expect(uncalibratedScope).toEqual(packageScopePreview);
  });

  it('calibrated services have safety protocols where physical hazards exist', () => {
    const leakCal = getServiceCalibration('su-kacagi');
    expect(leakCal?.safetyProtocol).toContain('ana vanayı kapatıp');

    const electricCal = getServiceCalibration('elektrik-arizasi');
    expect(electricCal?.safetyProtocol).toContain('112');

    const furnitureCal = getServiceCalibration('mobilya-kurulumu');
    expect(furnitureCal?.safetyProtocol).toBeUndefined();
  });
});
