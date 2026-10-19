import { RegularExpression } from '../../../src/core/commons/constants/RegexConstants';

describe('email validation', () => {
  it('has no stateful flags and produces the same result on repeated validation', () => {
    expect(RegularExpression.Email.global).toBe(false);
    expect(RegularExpression.Email.sticky).toBe(false);
    const results = Array.from({ length: 6 }, () => RegularExpression.Email.test('usuario+editor@example.com'));
    expect(results).toEqual([true, true, true, true, true, true]);
    expect(RegularExpression.Email.lastIndex).toBe(0);
  });

  it('does not depend on previous valid or invalid inputs', () => {
    const results = ['uno@example.com', 'invalid', 'DOS+EDITOR@EXAMPLE.COM', 'sin-dominio@', 'uno@example.com']
      .map((email) => RegularExpression.Email.test(email));
    expect(results).toEqual([true, false, true, false, true]);
  });

  it.each(['', 'not-an-email', 'user@example', 'user name@example.com', 'user@example.com trailing'])('keeps rejecting invalid email %s', (email) => {
    expect(RegularExpression.Email.test(email)).toBe(false);
  });
});
