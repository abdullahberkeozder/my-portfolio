import { useQuery } from "@tanstack/react-query";
import { getSettings } from "../../services/apiSettings";

export function useSettings() {
  const {
    isLoading,
    error,
    data: settings,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    // We want to cache the settings data for a long time, since it doesn't change often
    cacheTime: 1000 * 60 * 60, // 1 hour
    // We also want to avoid refetching the settings data on every mount, since it doesn't change often
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return {
    settings,
    isLoading,
    error,
  };
}
