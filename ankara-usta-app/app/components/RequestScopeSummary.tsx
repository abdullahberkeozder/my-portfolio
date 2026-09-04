import Link from 'next/link';
import type { DeliveryModel, RequestStatus } from '../domain/models';
import type { WizardQuestion } from '../domain/wizard';
import { requestJourney, requestNextStep } from '../domain/requestJourney';
import { requestTimingLabel } from '../domain/requestTiming';
import styles from './requestWorkspace.module.css';

const deliveryLabels: Record<DeliveryModel, string> = {
  package: 'Paket hizmet',
  quote: 'Teklif modeli',
  inspection: 'Keşif modeli',
};

export function RequestJourney({status, quoteCount, jobHref}: {status: RequestStatus; quoteCount: number; jobHref?: string}) {
  const next = requestNextStep(status, quoteCount);
  return <section className={styles.journey} aria-labelledby="request-next-step">
    <ol aria-label="Talep ilerlemesi">
      {requestJourney(status).map(stage => <li className={styles[stage.state]} key={stage.id} aria-current={stage.state === 'current' ? 'step' : undefined}>
        <span aria-hidden="true">{stage.state === 'complete' ? '✓' : ''}</span>
        {stage.label}
      </li>)}
    </ol>
    <div className={styles.nextStep}>
      <div><span>Sıradaki adım</span><h2 id="request-next-step">{next.title}</h2><p>{next.description}</p></div>
      {jobHref && <Link href={jobHref}>İş odasını aç</Link>}
    </div>
  </section>;
}

export default function RequestScopeSummary({
  serviceName, deliveryModel, questions, answers, district, neighborhood, timing,
}: {
  serviceName: string;
  deliveryModel: DeliveryModel;
  questions: WizardQuestion[];
  answers: Record<string, string>;
  district: string;
  neighborhood: string;
  timing: string;
}) {
  const answered = questions.filter(question => answers[question.id]);
  return <section className={styles.scope} aria-labelledby="request-scope-title">
    <header><div><span>Talep kapsamı</span><h2 id="request-scope-title">{serviceName}</h2></div><small>{deliveryLabels[deliveryModel]}</small></header>
    <dl>
      {answered.map(question => <div key={question.id}><dt>{question.label}</dt><dd>{answers[question.id]}</dd></div>)}
      <div><dt>Konum</dt><dd>{neighborhood}, {district}</dd></div>
      <div><dt>Zamanlama</dt><dd>{requestTimingLabel(timing)}</dd></div>
    </dl>
  </section>;
}
