export function usePromptQuota() {
  return {
    promptCount: 0,
    promptLimit: 999999,
    accessBlocked: false,
    remaining: 999999,
    loading: false,
    fetchQuota: async () => {},
    consumePrompt: async () => true,
  };
}
