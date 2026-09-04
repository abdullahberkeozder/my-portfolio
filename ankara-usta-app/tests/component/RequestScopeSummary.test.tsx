import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import RequestScopeSummary,{RequestJourney} from '../../app/components/RequestScopeSummary';

const questions=[
  {id:'faucet-type',label:'Hangi musluk değiştirilecek?',options:['Mutfak','Banyo']},
  {id:'part-available',label:'Yeni musluk hazır mı?',options:['Evet','Hayır']},
];

describe('RequestScopeSummary',()=>{
  it('shows one shared, readable scope without inventing unanswered values',()=>{
    render(<RequestScopeSummary serviceName="Musluk Değişimi" deliveryModel="package" questions={questions} answers={{'faucet-type':'Mutfak'}} district="Çankaya" neighborhood="Ayrancı" timing="this_week"/>);
    expect(screen.getByRole('heading',{name:'Musluk Değişimi'})).toBeVisible();
    expect(screen.getByText('Mutfak')).toBeVisible();
    expect(screen.queryByText('Yeni musluk hazır mı?')).toBeNull();
    expect(screen.getByText('Ayrancı, Çankaya')).toBeVisible();
    expect(screen.getByText('Bu hafta içinde')).toBeVisible();
  });

  it('announces the current decision stage and exposes the job handoff',()=>{
    render(<RequestJourney status="provider_selected" quoteCount={1} jobHref="/islerim/job-1"/>);
    expect(screen.getByRole('listitem',{current:'step'})).toHaveTextContent('İş');
    expect(screen.getByRole('link',{name:'İş odasını aç'})).toHaveAttribute('href','/islerim/job-1');
  });
});
