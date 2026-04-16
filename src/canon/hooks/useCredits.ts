export function useCredits() {
  return {
    credits: 999999,
    loading: false,
    hasCredits: true,
    isAdmin: true,
    deductCredit: async () => true,
    refetch: async () => {},
  };
}
