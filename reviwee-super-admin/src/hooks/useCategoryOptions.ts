import { useState, useEffect } from "react";
import { useGetAllCategoryQuery } from "src/services/CategoryService";

const useCategory = () => {
  const [category, setCategory] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const { data, isLoading, isFetching } = useGetAllCategoryQuery('');

  useEffect(() => {
    if (isLoading || isFetching) {
      setIsDataLoading(true);
    } else {
      const result: any[] = data?.data ?? data ?? [];
      setCategory(Array.isArray(result) ? result : []);
      setIsDataLoading(false);
    }
  }, [data, isLoading, isFetching]);

  return { category, isDataLoading };
};

export default useCategory;
