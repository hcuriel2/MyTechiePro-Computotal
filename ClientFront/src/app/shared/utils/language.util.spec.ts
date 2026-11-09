
import { getLanguageForLocation } from './language.util';

describe('IP Language Selection Tests', () => {

  it('should select French for Quebec', () => {
    expect(getLanguageForLocation('CA', 'QC')).toBe('fr');
  });

  it('should select French for France', () => {
    expect(getLanguageForLocation('FR', '')).toBe('fr');
  });

  it('should select Spanish for Mexico', () => {
    expect(getLanguageForLocation('MX', 'CMX')).toBe('es');
  });

  it('should select Spanish for Spain', () => {
    expect(getLanguageForLocation('ES', '')).toBe('es');
  });

  it('should select English for British Columbia', () => {
    expect(getLanguageForLocation('CA', 'BC')).toBe('en-us');
  });

  it('should default to English for Japan', () => {
    expect(getLanguageForLocation('JP', '')).toBe('en-us');
  });

  it('should handle lowercase location codes', () => {
    expect(getLanguageForLocation('ca', 'qc')).toBe('fr');
  });

  it('should default to English for missing location', () => {
    expect(getLanguageForLocation('', '')).toBe('en-us');
  });

});
