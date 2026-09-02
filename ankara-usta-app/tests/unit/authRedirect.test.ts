import {describe,expect,it} from 'vitest';
import {landingPathForRoles,safeNextPath} from '../../app/lib/authRedirect';

describe('auth redirects',()=>{
  it('preserves the wizard return query for new and existing accounts',()=>{
    const next='/?resume=1&service=tv-duvar-montaji';
    expect(landingPathForRoles([],next)).toBe(next);
    expect(landingPathForRoles(['customer'],next)).toBe(next);
  });
  it('rejects external and protocol-relative redirects',()=>{
    expect(safeNextPath('https://example.com')).toBeNull();
    expect(safeNextPath('//example.com')).toBeNull();
    expect(safeNextPath('/taleplerim')).toBe('/taleplerim');
  });
  it('uses explicit safe intent before the role landing page',()=>{
    expect(landingPathForRoles(['admin'],'/islerim')).toBe('/islerim');
  });
  it('uses the highest privileged role landing page',()=>{
    expect(landingPathForRoles(['customer','tradesperson'])).toBe('/usta/talepler');
    expect(landingPathForRoles(['customer','admin'])).toBe('/yonetim/uyusmazliklar');
  });
});
