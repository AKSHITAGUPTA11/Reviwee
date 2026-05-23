import { useState, useEffect } from "react";
import { useGetStateListQuery } from "src/services/BusinessProfileProductsService";

const useStateList = () => {
  const [state, setState] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  const { data, isLoading, isFetching } = useGetStateListQuery("");

  useEffect(() => {
    if (isLoading || isFetching) {
      setIsDataLoading(true);
    } else {
      const result: any[] = data?.data ?? data ?? [];
      setState(Array.isArray(result) ? result : []);
      setIsDataLoading(false);
    }
  }, [data, isLoading, isFetching]);

  return { state, isDataLoading };
};

export default useStateList;
