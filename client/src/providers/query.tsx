import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export function getContext() {
  return {
    queryClient,
  };
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* @ts-expect-error Children has the wrong type */}
      {children}
    </QueryClientProvider>
  );
}
