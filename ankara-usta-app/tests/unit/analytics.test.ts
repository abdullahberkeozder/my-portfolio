import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {trackFunnel} from '../../app/lib/analytics';

describe('consent-gated funnel analytics',()=>{
  beforeEach(()=>{localStorage.clear();vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENDPOINT','');});
  afterEach(()=>vi.unstubAllEnvs());

  it('does nothing without explicit consent',()=>{
    const listener=vi.fn();window.addEventListener('orkestra:analytics',listener);
    trackFunnel('service_search');
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener('orkestra:analytics',listener);
  });

  it('rejects events outside the allow list',()=>{
    localStorage.setItem('ankara_analytics_consent','accepted');
    const listener=vi.fn();window.addEventListener('orkestra:analytics',listener);
    trackFunnel('address_entered',{address:'secret'});
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener('orkestra:analytics',listener);
  });

  it('dispatches an allow-listed event without sensitive form content',()=>{
    localStorage.setItem('ankara_analytics_consent','accepted');
    const listener=vi.fn();window.addEventListener('orkestra:analytics',listener);
    trackFunnel('wizard_started',{serviceId:'musluk-degisimi'});
    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0].detail).toMatchObject({eventName:'wizard_started',properties:{serviceId:'musluk-degisimi'}});
    window.removeEventListener('orkestra:analytics',listener);
  });

  it('uses sendBeacon only when an endpoint is configured',()=>{
    localStorage.setItem('ankara_analytics_consent','accepted');
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENDPOINT','https://analytics.example.test/events');
    const beacon=vi.fn(()=>true);Object.defineProperty(navigator,'sendBeacon',{configurable:true,value:beacon});
    trackFunnel('wizard_completed',{serviceId:'avize-montaji'});
    expect(beacon).toHaveBeenCalledOnce();
  });
});
