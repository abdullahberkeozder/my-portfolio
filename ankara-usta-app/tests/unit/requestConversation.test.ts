import {it,expect} from 'vitest';
import {conversationActionSchema,conversationQuerySchema,mergeConversationMessages} from '../../app/domain/requestConversation';
const id='f31e936b-d492-4d9b-a44a-a6ce932976d0';
it('validates and trims text, rejects empty/oversized bodies and absent retry keys',()=>{
  expect(conversationActionSchema.parse({action:'send',professionalId:id,body:'  Kapsam?  ',key:id})).toMatchObject({body:'Kapsam?'});
  for(const body of ['', '   ','x'.repeat(4001)])expect(conversationActionSchema.safeParse({action:'send',professionalId:id,body,key:id}).success).toBe(false);
  expect(conversationActionSchema.safeParse({action:'send',professionalId:id,body:'Merhaba'}).success).toBe(false);
});
it('validates cursors and rejects unknown actions',()=>{
  expect(conversationQuerySchema.parse({professionalId:id,after:'100'}).after).toBe(100);
  for(const sequence of [-1,.5,Number.MAX_SAFE_INTEGER+1])expect(conversationActionSchema.safeParse({action:'read',professionalId:id,sequence}).success).toBe(false);
  expect(conversationActionSchema.safeParse({action:'delete',professionalId:id}).success).toBe(false);
});
it('merges replayed pages without duplication and in server order',()=>{
  const one={id:'one',sequence:1,sender_id:id,body:'Bir',created_at:'2026-09-03T12:00:00Z'};
  const two={...one,id:'two',sequence:2};
  expect(mergeConversationMessages([two],[one,two])).toEqual([one,two]);
});
