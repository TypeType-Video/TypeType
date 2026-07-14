type RecoveryRef = {
  current: boolean;
};

export function claimAutomaticSabrRecovery(recoveryRef: RecoveryRef): boolean {
  if (recoveryRef.current) return false;
  recoveryRef.current = true;
  return true;
}

export function resetAutomaticSabrRecovery(recoveryRef: RecoveryRef): void {
  recoveryRef.current = false;
}
