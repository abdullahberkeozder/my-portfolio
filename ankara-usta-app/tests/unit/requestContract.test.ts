import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,it,expect} from 'vitest';
import {wizardDefinitions} from '../../app/data/wizardDefinitions';
import {getVisibleWizardQuestions} from '../../app/domain/wizard';
import {validateRequestDraft} from '../../app/domain/requestPersistence';
import {normalizeRequestTiming} from '../../app/domain/requestTiming';
import {preferredTimingHorizonDays} from '../../app/domain/matching';

describe('UI, API and SQL request contract',()=>{
  it('keeps the generated SQL snapshot identical to all 26 UI definitions',()=>{
    const sql=readFileSync(resolve('supabase/migrations/20260902102337_unified_request_contract.sql'),'utf8');
    const snapshot=sql.split('$contract$')[1];
    expect(JSON.parse(snapshot)).toEqual(wizardDefinitions);
  });
  for(const definition of Object.values(wizardDefinitions)) {
    it(`validates every option branch for ${definition.serviceId}`,()=>{
      // Enumerate actual visible paths, including conditional branches.
      function visit(index:number,answers:Record<string,string>) {
        if(index===definition.questions.length) {
          const payload={serviceId:definition.serviceId,answers,idempotencyKey:'f31e936b-d492-4d9b-a44a-a6ce932976d0',district:'Çankaya',neighborhood:'Ayrancı',preferredTiming:'this_week'};
          expect(()=>validateRequestDraft(payload,true)).not.toThrow();
          expect(()=>validateRequestDraft({...payload,answers:{...answers,unknown:'x'}},true)).toThrow();
          return;
        }
        const q=definition.questions[index];
        if(!getVisibleWizardQuestions(definition,answers).some(item=>item.id===q.id)) return visit(index+1,answers);
        for(const option of q.options) visit(index+1,{...answers,[q.id]:option});
      }
      visit(0,{});
    });
  }
  it('normalizes old drafts without silently widening the matching window',()=>{
    expect(normalizeRequestTiming('Bu hafta içinde')).toBe('this_week');
    expect(preferredTimingHorizonDays('Bu hafta içinde')).toBe(7);
    expect(preferredTimingHorizonDays('urgent')).toBe(0);
    expect(preferredTimingHorizonDays('Mümkün olan en kısa sürede')).toBe(0);
    expect(()=>normalizeRequestTiming('unknown')).toThrow();
  });
  it('rejects hidden answers rather than persisting stale conditional data',()=>{
    expect(()=>validateRequestDraft({serviceId:'elektrik-arizasi',idempotencyKey:'f31e936b-d492-4d9b-a44a-a6ce932976d0',answers:{symptom:'Belirli odada elektrik yok','visible-damage':'Evet, görünür hasar var'}})).toThrow();
  });
});
