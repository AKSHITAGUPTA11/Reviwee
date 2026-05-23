import { useState, useEffect } from "react";
import { useGetAllSubcategoryQuery } from "src/services/SubcategoryService";
const useSubcategoryOptions = (categoryId?: string) => {
  const [subcategory, setSubcategory] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const { data, isLoading, isFetching } = useGetAllSubcategoryQuery('');

  useEffect(() => {
    if (isLoading || isFetching) {
      setIsDataLoading(true);
    } else {
      const result: any[] = data?.data ?? data ?? [];
      let list = Array.isArray(result) ? result : [];
      if (categoryId) {
        list = list.filter(
          (s: any) => (s.categoryId ?? s.category_id ?? "") === categoryId
        );
      }
      setSubcategory(list);
      setIsDataLoading(false);
    }
  }, [data, isLoading, isFetching, categoryId]);

  return { subcategory, isDataLoading };
};

export default useSubcategoryOptions;
