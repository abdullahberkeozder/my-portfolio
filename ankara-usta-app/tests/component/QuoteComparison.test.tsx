import { render,screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe,expect,it,vi } from 'vitest';
import QuoteComparison,{type ComparableQuote} from '../../app/components/QuoteComparison';

vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()})}));

const quote=(id:string,name:string):ComparableQuote=>({id,tradespersonName:name,version:1,laborAmountKurus:100000,materialAmountKurus:25000,estimatedDurationMinutes:120,warrantyDays:90,includedScope:['İşçilik'],excludedScope:[],note:null});

describe('QuoteComparison',()=>{
  it('never allows more than three selected quotes',async()=>{
    const user=userEvent.setup();
    render(<QuoteComparison quotes={[quote('1','Birinci Usta'),quote('2','İkinci Usta'),quote('3','Üçüncü Usta'),quote('4','Dördüncü Usta')]}/>);
    const fourth=screen.getByRole('checkbox',{name:/Dördüncü Usta/});
    expect(fourth).toBeDisabled();
    await user.click(screen.getByRole('checkbox',{name:/Birinci Usta/}));
    expect(fourth).toBeEnabled();
    await user.click(fourth);
    expect(screen.getAllByRole('button',{name:'Bu teklifi kabul et'})).toHaveLength(3);
  });
});
