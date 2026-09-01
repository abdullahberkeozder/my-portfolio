import {describe,expect,it} from 'vitest';
import {getWizardSafetyGuidance} from '../../app/data/wizardSafety';

describe('wizard safety guidance',()=>{
  it('shows urgent guidance for electrical fire indicators',()=>{
    expect(getWizardSafetyGuidance('elektrik-arizasi',{symptom:'Yanık kokusu / kıvılcım var'})).toMatchObject({level:'urgent'});
  });

  it('shows urgent guidance for an active water leak and stays silent for routine work',()=>{
    expect(getWizardSafetyGuidance('su-kacagi',{active:'Evet, aktif akıyor'})).toMatchObject({level:'urgent'});
    expect(getWizardSafetyGuidance('tv-duvar-montaji',{})).toBeNull();
  });
});
