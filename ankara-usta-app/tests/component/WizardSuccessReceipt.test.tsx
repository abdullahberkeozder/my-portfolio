import {render,screen} from '@testing-library/react';
import {describe,expect,it} from 'vitest';
import WizardSuccessReceipt from '../../app/components/wizard/WizardSuccessReceipt';

describe('WizardSuccessReceipt',()=>{
  it('shows only the authoritative request summary and focuses the result',()=>{
    render(<WizardSuccessReceipt requestId="abcdef12-1234-5678-9012-abcdefabcdef" serviceName="Musluk Değişimi" district="Çankaya" neighborhood="Ayrancı" timing="this_week"/>);
    expect(screen.getByRole('heading',{name:'Ustalara iletilmek üzere hazır'})).toHaveFocus();
    expect(screen.getByText('ABCDEF12')).toBeVisible();
    expect(screen.getByText('Ayrancı, Çankaya')).toBeVisible();
    expect(screen.getByRole('link',{name:'Talebi görüntüle'})).toHaveAttribute('href','/taleplerim/abcdef12-1234-5678-9012-abcdefabcdef/teklifler?created=1');
  });

  it('explains directed-request visibility without implying automatic broadening',()=>{
    render(<WizardSuccessReceipt requestId="request-1" serviceName="Musluk Değişimi" district="Çankaya" neighborhood="Ayrancı" timing="flexible" targetProfessionalName="Ayşe Usta"/>);
    expect(screen.getByText(/başka ustalara otomatik açılmaz/i)).toBeVisible();
  });
});
