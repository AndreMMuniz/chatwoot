import { isCallsMenuAvailable } from '../callsAvailability';

describe('isCallsMenuAvailable', () => {
  it.each([
    {
      scenario: 'cloud with the account feature enabled',
      isOnChatwootCloud: true,
      isEnterprise: false,
      isEnabledForAccount: true,
      expected: true,
    },
    {
      scenario: 'enterprise with the account feature enabled',
      isOnChatwootCloud: false,
      isEnterprise: true,
      isEnabledForAccount: true,
      expected: true,
    },
    {
      scenario: 'a supported platform with the account feature disabled',
      isOnChatwootCloud: true,
      isEnterprise: false,
      isEnabledForAccount: false,
      expected: false,
    },
    {
      scenario: 'community with the account feature enabled',
      isOnChatwootCloud: false,
      isEnterprise: false,
      isEnabledForAccount: true,
      expected: false,
    },
  ])('returns $expected for $scenario', scenario => {
    expect(isCallsMenuAvailable(scenario)).toBe(scenario.expected);
  });
});
