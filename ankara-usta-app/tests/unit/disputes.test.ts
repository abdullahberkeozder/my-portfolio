import {describe,expect,it} from 'vitest';
import {canTransitionDispute,disputeAppealSchema,disputeEvidenceSchema,disputeSlaState,disputeTransitionSchema} from '../../app/domain';

describe('dispute operations',()=>{
  it('allows only explicit workflow transitions',()=>{
    expect(canTransitionDispute('opened','triage')).toBe(true);
    expect(canTransitionDispute('awaiting_evidence','investigation')).toBe(true);
    expect(canTransitionDispute('notified','appealed')).toBe(true);
    expect(canTransitionDispute('closed','investigation')).toBe(false);
    expect(canTransitionDispute('opened','closed')).toBe(false);
  });

  it('classifies SLA state at the four-hour warning boundary',()=>{
    const now=new Date('2026-08-27T10:00:00Z');
    expect(disputeSlaState('2026-08-27T09:59:59Z',now)).toBe('overdue');
    expect(disputeSlaState('2026-08-27T14:00:00Z',now)).toBe('due_soon');
    expect(disputeSlaState('2026-08-27T14:00:01Z',now)).toBe('on_track');
  });

  it('validates evidence, transition explanations, and appeals',()=>{
    expect(disputeEvidenceSchema.safeParse({kind:'photo',description:'Hasarın iş sonrası görünümü'}).success).toBe(true);
    expect(disputeEvidenceSchema.safeParse({kind:'photo',description:'az'}).success).toBe(false);
    expect(disputeTransitionSchema.safeParse({status:'awaiting_evidence',reason:'İki taraftan ek fotoğraf istendi.',evidenceDueAt:'2026-08-30T12:00:00.000Z'}).success).toBe(true);
    expect(disputeAppealSchema.safeParse({reason:'Kararda kullanılan kapsam kaydı güncel sürüm değildir.'}).success).toBe(true);
  });
});
