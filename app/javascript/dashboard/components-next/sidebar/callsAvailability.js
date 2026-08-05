export const isCallsMenuAvailable = ({
  isOnChatwootCloud,
  isEnterprise,
  isEnabledForAccount,
}) => (isOnChatwootCloud || isEnterprise) && isEnabledForAccount;
