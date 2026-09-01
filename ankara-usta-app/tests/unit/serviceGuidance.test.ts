import { describe, expect, it } from 'vitest';
import { getServiceSafetyGuidance, packageScopePreview } from '../../app/data/serviceGuidance';
import { services } from '../../app/data/serviceTaxonomy';

describe('service guidance', () => {
  it('keeps the package preview concise and balanced', () => {
    expect(packageScopePreview.included).toHaveLength(3);
    expect(packageScopePreview.excluded).toHaveLength(3);
  });

  it('returns safety guidance only for services with an immediate-risk context', () => {
    const electricalFault = services.find(service => service.id === 'elektrik-arizasi');
    const tvMounting = services.find(service => service.id === 'tv-duvar-montaji');

    expect(getServiceSafetyGuidance(electricalFault)?.body).toContain('112');
    expect(getServiceSafetyGuidance(tvMounting)).toBeUndefined();
  });
});
