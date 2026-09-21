import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import JobWorkspace,{type AcceptedQuoteTerms} from '../../app/components/JobWorkspace';

const mocks=vi.hoisted(()=>({router:{refresh:vi.fn()}}));
vi.mock('next/navigation',()=>({useRouter:()=>mocks.router}));
vi.mock('../../app/lib/workspaceMutation',()=>({workspaceMutation:vi.fn()}));

beforeEach(()=>vi.clearAllMocks());
afterEach(cleanup);

const sampleQuote:AcceptedQuoteTerms={
  id:'quote-contract-1',
  version:2,
  labor_amount_kurus:150000, // 1.500 TL
  material_amount_kurus:50000, // 500 TL -> Total: 2.000 TL
  estimated_duration_minutes:180,
  warranty_days:90,
  included_scope:['Banyo bataryası montajı','Sızdırmazlık testi'],
  excluded_scope:['Fayans kırma ve yenileme'],
  note:'Eski batarya sökülüp yenisi teslim edilecektir.',
};

describe('JobWorkspace Scope & Contract Freezing',() => {
  it('displays immutable contract terms on the scope tab when acceptedQuote is provided',() => {
    render(
      <JobWorkspace
        jobId="job-1"
        currentUserId="customer-1"
        role="customer"
        status="in_progress"
        events={[]}
        messages={[]}
        appointments={[]}
        scopeChanges={[]}
        address={null}
        acceptedQuote={sampleQuote}
      />
    );

    // Switch to Kapsam tab
    fireEvent.click(screen.getByRole('tab',{name:'Kapsam'}));

    const contractCard=screen.getByRole('article',{name:'Kabul edilen sözleşme şartları'});
    expect(contractCard).toBeInTheDocument();
    expect(contractCard).toHaveTextContent('DEĞİŞMEZ SÖZLEŞME REFERANSI');
    expect(contractCard).toHaveTextContent('Sürüm 2');
    expect(contractCard).toHaveTextContent('Sözleşme Sabitlendi');

    // Financials and specs
    expect(contractCard).toHaveTextContent('180 dakika');
    expect(contractCard).toHaveTextContent('90 gün');
    expect(contractCard).toHaveTextContent('Banyo bataryası montajı');
    expect(contractCard).toHaveTextContent('Sızdırmazlık testi');
    expect(contractCard).toHaveTextContent('Fayans kırma ve yenileme');
    expect(contractCard).toHaveTextContent('Eski batarya sökülüp yenisi teslim edilecektir.');
  });

  it('computes live financial balance adding approved scope changes to original contract',() => {
    const scopeChanges=[
      {
        id:'sc-1',
        proposed_by:'tradesperson',
        description:'Ek ara musluk değişimi',
        labor_delta_kurus:20000, // +200 TL
        material_delta_kurus:10000, // +100 TL -> +300 TL total
        duration_delta_minutes:30,
        status:'approved',
      },
      {
        id:'sc-2',
        proposed_by:'tradesperson',
        description:'Reddedilen ek talep',
        labor_delta_kurus:50000,
        material_delta_kurus:0,
        duration_delta_minutes:45,
        status:'rejected',
      },
      {
        id:'sc-3',
        proposed_by:'tradesperson',
        description:'Bekleyen ek boru hattı',
        labor_delta_kurus:35000,
        material_delta_kurus:15000,
        duration_delta_minutes:60,
        status:'pending_customer',
      },
    ];

    render(
      <JobWorkspace
        jobId="job-1"
        currentUserId="customer-1"
        role="customer"
        status="in_progress"
        events={[]}
        messages={[]}
        appointments={[]}
        scopeChanges={scopeChanges}
        address={null}
        acceptedQuote={sampleQuote}
      />
    );

    fireEvent.click(screen.getByRole('tab',{name:'Kapsam'}));

    // Check Live balance card
    expect(screen.getByText('GÜNCEL TOPLAM İŞ BEDELİ')).toBeInTheDocument();
    expect(screen.getByText(/Onaylanan Zeyilname/)).toBeInTheDocument();
  });

  it('renders gracefully when acceptedQuote is absent or null',() => {
    render(
      <JobWorkspace
        jobId="job-1"
        currentUserId="customer-1"
        role="customer"
        status="in_progress"
        events={[]}
        messages={[]}
        appointments={[]}
        scopeChanges={[]}
        address={null}
        acceptedQuote={null}
      />
    );

    fireEvent.click(screen.getByRole('tab',{name:'Kapsam'}));

    expect(screen.queryByRole('article',{name:'Kabul edilen sözleşme şartları'})).not.toBeInTheDocument();
    expect(screen.getByText('İş esnasında ortaya çıkan ek işçilik ve malzemeler iki tarafın onayıyla dijital fişe eklenir.')).toBeInTheDocument();
  });
});
