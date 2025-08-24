import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import { AxiosRequestConfig, CanceledError } from "axios";

export interface Operation {
  id: string;
  workOrderId: string;
  index: number;
  machineId: string;
  name: string;
  start: string;
  end: string;
}

const userOperations = (refresh: boolean[]) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setOperations([]);
    setLoading(true);
    apiClient
      .get<Operation[]>("/operations", { signal: controller.signal })
      .then((res) => {
        setOperations(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof CanceledError) return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [...refresh]);

  return { operations, error, loading };
};

export default userOperations;
