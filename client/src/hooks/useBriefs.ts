import { trpc } from "@/providers/trpc";

export function useBriefs() {
  const { data, isLoading, error, ...rest } = trpc.getBriefs.useQuery();

  // add formatting logic here if needed

  return {
    briefs: data,
    isLoadingBriefs: isLoading,
    briefsError: error,
    ...rest,
  };
}
