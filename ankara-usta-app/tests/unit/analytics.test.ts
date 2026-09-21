import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {trackFunnel} from '../../app/lib/analytics';

describe('consent-gated funnel analytics',()=>{
  beforeEach(()=>{localStorage.clear();vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENDPOINT','');});
  afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks();});

  it('does not interrupt a product action when consent storage is unavailable',()=>{
    vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('storage denied');});
    expect(()=>trackFunnel('wizard_completed')).not.toThrow();
  });

  it('does not interrupt a product action when the transport throws',()=>{
    localStorage.setItem('ankara_analytics_consent','accepted');
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENDPOINT','https://analytics.example.test/events');
    Object.defineProperty(navigator,'sendBeacon',{configurable:true,value:()=>{throw new Error('beacon denied');}});
    expect(()=>trackFunnel('wizard_completed')).not.toThrow();
  });

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

  it('scrubs extended sensitive fields such as notes, description, answers and storage_path',()=>{
    localStorage.setItem('ankara_analytics_consent','accepted');
    const listener=vi.fn();window.addEventListener('orkestra:analytics',listener);
    trackFunnel('wizard_abandoned',{
      serviceId:'musluk-degisimi',
      stepIndex:2,
      durationSeconds:45,
      description:'Private customer text with sensitive details',
      notes:'Personal phone and note',
      answers:'A: 5 katlı bina',
      storage_path:'user-123/secret_doc.pdf',
    });
    expect(listener).toHaveBeenCalledOnce();
    const props = listener.mock.calls[0][0].detail.properties;
    expect(props).toEqual({
      serviceId:'musluk-degisimi',
      stepIndex:2,
      durationSeconds:45,
    });
    expect(props).not.toHaveProperty('description');
    expect(props).not.toHaveProperty('notes');
    expect(props).not.toHaveProperty('answers');
    expect(props).not.toHaveProperty('storage_path');
    window.removeEventListener('orkestra:analytics',listener);
  });

  it('tracks reliability and lifecycle events like first_quote_received and duplicate_submission_blocked',()=>{
    localStorage.setItem('ankara_analytics_consent','accepted');
    const listener=vi.fn();window.addEventListener('orkestra:analytics',listener);
    trackFunnel('first_quote_received',{serviceId:'klima-bakimi',elapsedSeconds:1800});
    trackFunnel('duplicate_submission_blocked',{serviceId:'klima-bakimi'});
    trackFunnel('auth_return_completed',{serviceId:'klima-bakimi',returnTarget:'/taleplerim'});
    trackFunnel('realtime_reconnected',{channel:'job-123'});

    expect(listener).toHaveBeenCalledTimes(4);
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
