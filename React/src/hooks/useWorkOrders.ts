import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import { AxiosRequestConfig, CanceledError } from "axios";

interface Operation {
  id: string;
  workOrderId: string;
  index: number;
  machineId: string;
  name: string;
  start: string;
  end: string;
}

interface WorkOrder {
  id: string;
  product: string;
  qty: number;
  operations: Operation[];
}

const useWorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setWorkOrders([]);
    setLoading(true);
    apiClient
      .get<WorkOrder[]>("/workorders", { signal: controller.signal })
      .then((res) => {
        setWorkOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof CanceledError) return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { workOrders, error, loading };
};

export default useWorkOrders;
