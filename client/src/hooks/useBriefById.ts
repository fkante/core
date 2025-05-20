import { trpc } from "@/providers/trpc";

export function useBriefById(briefId: string | undefined) {
  const isBriefIdValid = briefId !== undefined;
  const { data, isLoading, error, ...rest } = trpc.getBriefById.useQuery(
    { id: briefId! },
    {
      enabled: isBriefIdValid,
    }
  );

  return {
    brief: data,
    isLoadingBrief: isLoading,
    briefError: error,
    ...rest,
  };
}
