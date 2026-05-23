import { useState, useEffect } from "react";
import { useGetAllCreditConfigQuery } from "src/services/CreditConfigService";

const usecredit = () => {
  const [credit, setcredit] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const { data, isLoading, isFetching } = useGetAllCreditConfigQuery('');

  useEffect(() => {
    if (isLoading || isFetching) {
      setIsDataLoading(true);
    } else {
      const result: any[] = data?.data ?? data ?? [];
      setcredit(Array.isArray(result) ? result : []);
      setIsDataLoading(false);
    }
  }, [data, isLoading, isFetching]);

  return { credit, isDataLoading };
};

export default usecredit;
