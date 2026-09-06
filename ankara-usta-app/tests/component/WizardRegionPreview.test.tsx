import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {expect, it} from 'vitest';
import WizardRegionPreview from '../../app/components/wizard/WizardRegionPreview';

it('only connects to the map after explicit opening and allows closing it', async () => {
  const user = userEvent.setup();
  render(<WizardRegionPreview district="Çankaya" serviceId="musluk-degisimi"/>);
  expect(screen.queryByTitle('Çankaya bölge haritası')).not.toBeInTheDocument();
  await user.click(screen.getByText('Diğer seçenekler', {exact:false}));
  const directory = screen.getByRole('link', {name: /Bölgede bu hizmeti/});
  expect(directory).toHaveAttribute('target', '_blank');
  expect(directory.getAttribute('href')).toContain('service=musluk-degisimi');
  await user.click(screen.getByRole('button', {name: 'Bölgeyi haritada göster'}));
  expect(screen.getByTitle('Çankaya bölge haritası')).toHaveAttribute('src', expect.stringContaining('openstreetmap.org/export/embed.html'));
  await user.click(screen.getByRole('button', {name: 'Haritayı gizle'}));
  expect(screen.queryByTitle('Çankaya bölge haritası')).not.toBeInTheDocument();
});

it('does not encourage changing the professional on a directed request', () => {
  render(<WizardRegionPreview district="Çankaya" serviceId="musluk-degisimi" targetProfessionalName="Seçilen usta"/>);
  expect(screen.queryByRole('link', {name: /Bölgede bu hizmeti/})).not.toBeInTheDocument();
  expect(screen.getByText(/Yalnız Seçilen usta için/)).toBeInTheDocument();
});

it('does not guess a location for unknown districts', () => {
  const {container} = render(<WizardRegionPreview district="Bilinmeyen" serviceId="musluk-degisimi"/>);
  expect(container).toBeEmptyDOMElement();
});
