import { Job, Quote, Request } from '../../app/domain';

const now = '2026-08-26T08:00:00.000Z';

export const requestFixture: Request = {
  id: 'request-1', customerId: 'customer-1', serviceId: 'tv-duvar-montaji',
  district: 'Çankaya', neighborhood: 'Bahçelievler', status: 'draft', answers: {},
  createdAt: now, updatedAt: now,
};

export const quoteFixture: Quote = {
  id: 'quote-1', requestId: requestFixture.id, tradespersonId: 'tradesperson-1',
  status: 'submitted', laborAmountKurus: 150_000, materialAmountKurus: 25_000,
  estimatedDurationMinutes: 120, warrantyDays: 90, includedScope:['Montaj işçiliği'],excludedScope:['Duvar onarımı'],version: 1, createdAt: now, updatedAt: now,
};

export const jobFixture: Job = {
  id: 'job-1', requestId: requestFixture.id, acceptedQuoteId: quoteFixture.id,
  customerId: requestFixture.customerId, tradespersonId: quoteFixture.tradespersonId,
  status: 'scheduled', scheduledFor: '2026-08-27T09:00:00.000Z',
  nextEventSequence:0,createdAt: now, updatedAt: now,
};
