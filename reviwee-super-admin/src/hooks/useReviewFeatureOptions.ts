import { useState, useEffect } from "react";
import { useGetAllReviewFeatureQuery } from "src/services/ReviewFeatureService";

const useReviewFeatureOptions = () => {
  const [reviewFeature, setReviewFeature] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const { data, isLoading, isFetching } = useGetAllReviewFeatureQuery("");

  useEffect(() => {
    if (isLoading || isFetching) {
      setIsDataLoading(true);
    } else {
      const result: any[] = data?.data ?? data ?? [];
      setReviewFeature(Array.isArray(result) ? result : []);
      setIsDataLoading(false);
    }
  }, [data, isLoading, isFetching]);

  return { reviewFeature, isDataLoading };
};

export default useReviewFeatureOptions;
