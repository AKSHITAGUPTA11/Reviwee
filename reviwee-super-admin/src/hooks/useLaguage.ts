import { useState, useEffect } from "react";
import { useGetLaguageQuery } from "src/services/ReviewFeatureOptionService";

const useLanguage = () => {
  const [language, setLanguage] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const { data, isLoading, isFetching } = useGetLaguageQuery('');

  useEffect(() => {
    if (isLoading || isFetching) {
      setIsDataLoading(true);
    } else {
      const result: any[] = data?.data ?? data ?? [];
      setLanguage(Array.isArray(result) ? result : []);
      setIsDataLoading(false);
    }
  }, [data, isLoading, isFetching]);

  return { language, isDataLoading };
};

export default useLanguage;
