import { useEffect, useRef, useState } from "react";
import { DataSet, Timeline } from "vis-timeline/standalone";
import userOperations, { Operation } from "../hooks/userOperations";
import { Box, useColorModeValue } from "@chakra-ui/react";
import apiClient from "../services/apiClient";

interface Props {
  onUpdateError: (updateError: string) => void;
  onUpdateOperation: (updateOperation: Operation | null) => void;
  refreshFromApp: boolean;
}

const WorkOrderGannt = ({
  onUpdateError,
  onUpdateOperation,
  refreshFromApp,
}: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<Timeline | null>(null);

  const [refresh, setRefresh] = useState(false);
  const { operations, error, loading } = userOperations([
    refresh,
    refreshFromApp,
  ]);

  if (error) return null;

  useEffect(() => {
    if (!containerRef.current) return;

    const groups = new DataSet(
      [...new Set(operations.map((op) => op.machineId))].map((machine) => ({
        id: machine,
        content: machine,
      }))
    );

    const items = new DataSet(
      operations.map((op) => ({
        id: op.id,
        group: op.machineId,
        content: op.workOrderId + " " + op.name,
        start: op.start,
        end: op.end,
      }))
    );

    timelineRef.current = new Timeline(containerRef.current, items, groups, {
      margin: {
        item: 20,
      },
      horizontalScroll: true,
      editable: {
        add: false,
        updateTime: true,
        updateGroup: false,
        remove: false,
      },
      multiselect: false,
      stack: false,
      onMove: (item: any, callback: (itemOrNull: any) => void) => {
        apiClient
          .patch("/operations", {
            id: item.id,
            start: item.start,
            end: item.end,
          })
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            onUpdateError(err.response.data.detail);
            setRefresh(!refresh);
          });
        callback(item);
      },
    });

    timelineRef.current.on("select", (props) => {
      const selectedId = props.items[0];
      if (!selectedId) return;

      const selectedOp = operations.find((op) => op.id === selectedId);
      if (!selectedOp) return;

      onUpdateOperation(selectedOp);

      operations.forEach((op) => {
        (items as any).update({
          id: op.id,
          style: "",
        });
      });

      operations
        .filter(
          (op) =>
            op.workOrderId === selectedOp.workOrderId && op.id !== selectedOp.id
        )
        .forEach((op) => {
          (items as any).update({
            id: op.id,
            style:
              "background-color: rgba(100, 200, 100, 0.7); border-color: green;",
          });
        });
    });

    timelineRef.current.on("click", (props) => {
      if (!props.item) {
        onUpdateOperation(null);
        items.forEach((op) => {
          (items as any).update({
            id: op.id,
            style: "",
          });
        });
      }
    });

    return () => {
      if (timelineRef.current) timelineRef.current.destroy();
    };
  }, [operations]);

  return (
    <Box padding={5}>
      <div
        ref={containerRef}
        style={{ width: "100%", color: useColorModeValue("black", "white") }}
      />
    </Box>
  );
};

export default WorkOrderGannt;
