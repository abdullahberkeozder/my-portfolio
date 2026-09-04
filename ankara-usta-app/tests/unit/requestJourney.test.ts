import {describe, expect, it} from 'vitest';
import {requestJourney, requestNextStep} from '../../app/domain/requestJourney';

describe('request journey',()=>{
  it('keeps a submitted request at the professional-response stage',()=>{
    expect(requestJourney('submitted').map(stage=>stage.state)).toEqual(['complete','current','upcoming','upcoming']);
    expect(requestNextStep('submitted',0).title).toBe('Usta yanıtı bekleniyor');
  });

  it('moves a request with quotes to an explicit decision stage',()=>{
    expect(requestJourney('quotes_received').map(stage=>stage.state)).toEqual(['complete','complete','current','upcoming']);
    expect(requestNextStep('quotes_received',3).title).toBe('3 güncel teklifi değerlendirin');
  });

  it('moves an accepted request to its job workspace',()=>{
    expect(requestJourney('provider_selected').at(-1)?.state).toBe('current');
    expect(requestNextStep('provider_selected',1).description).toContain('iş odasında');
  });

  it.each(['cancelled','expired'] as const)('does not imply progress for a closed %s request',(status)=>{
    expect(requestJourney(status).every(stage=>stage.state==='upcoming')).toBe(true);
  });
});
