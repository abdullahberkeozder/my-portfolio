import { Job, JobStatus, Request, RequestStatus } from './models';

export class InvalidStateTransitionError extends Error {
  constructor(entity: 'Request' | 'Job', from: string, to: string) {
    super(`${entity} cannot transition from "${from}" to "${to}".`);
    this.name = 'InvalidStateTransitionError';
  }
}

const requestTransitions: Readonly<Record<RequestStatus, readonly RequestStatus[]>> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['matching', 'cancelled', 'expired'],
  matching: ['quotes_received', 'cancelled', 'expired'],
  quotes_received: ['provider_selected', 'matching', 'cancelled', 'expired'],
  provider_selected: ['cancelled'],
  cancelled: [],
  expired: [],
};

const jobTransitions: Readonly<Record<JobStatus, readonly JobStatus[]>> = {
  scheduled: ['inspection_scheduled', 'in_progress', 'cancelled'],
  inspection_scheduled: ['scheduled', 'in_progress', 'cancelled'],
  in_progress: ['awaiting_customer_approval', 'disputed', 'cancelled'],
  awaiting_customer_approval: ['in_progress', 'completed', 'disputed'],
  completed: ['disputed'],
  disputed: ['in_progress', 'awaiting_customer_approval', 'completed', 'cancelled'],
  cancelled: [],
};

export function canTransitionRequest(from: RequestStatus, to: RequestStatus) {
  return requestTransitions[from].includes(to);
}

export function transitionRequest(request: Request, to: RequestStatus, at: string): Request {
  if (!canTransitionRequest(request.status, to)) {
    throw new InvalidStateTransitionError('Request', request.status, to);
  }

  return {...request, status: to, updatedAt: at};
}

export function canTransitionJob(from: JobStatus, to: JobStatus) {
  return jobTransitions[from].includes(to);
}

export function transitionJob(job: Job, to: JobStatus, at: string): Job {
  if (!canTransitionJob(job.status, to)) {
    throw new InvalidStateTransitionError('Job', job.status, to);
  }

  return {...job, status: to, updatedAt: at};
}
