import {z} from 'zod';

export const conversationActionSchema=z.discriminatedUnion('action',[
  z.object({action:z.literal('send'),professionalId:z.uuid(),body:z.string().trim().min(1).max(4000),key:z.uuid()}),
  z.object({action:z.literal('read'),professionalId:z.uuid(),sequence:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)}),
]);
export const conversationQuerySchema=z.object({professionalId:z.uuid(),after:z.coerce.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).default(0)});
export type ConversationMessage={id:string;sequence:number;sender_id:string;body:string;created_at:string};
export type ConversationSnapshot={conversationId:string|null;messages:ConversationMessage[];cursor:number;hasMore:boolean;unreadCount:number;canSend:boolean;jobId:string|null;acknowledgedId:string|null};

export function mergeConversationMessages(current:ConversationMessage[],incoming:ConversationMessage[]) {
  return [...new Map([...current,...incoming].map(message=>[message.id,message])).values()].sort((a,b)=>a.sequence-b.sequence);
}
