import { HStack, List, ListItem, Image, Text } from "@chakra-ui/react";
import useWorkOrders from "../hooks/useWorkOrders";
import WorkOrderImage from "../assets/workorder.webp";
import { GiPencil, GiSewingMachine } from "react-icons/gi";
import { FaHourglassEnd, FaHourglassStart } from "react-icons/fa";

const WorOrderList = () => {
  const { workOrders, error, loading } = useWorkOrders();

  if (error) return null;

  return (
    <List>
      {workOrders.map((workOrder) => (
        <ListItem key={workOrder.id} paddingY="5px">
          <HStack>
            <Image boxSize="32px" borderRadius={8} src={WorkOrderImage} />
            <Text fontSize="lg">
              {workOrder.id} ({workOrder.product} x {workOrder.qty})
            </Text>
          </HStack>
          <List marginLeft={10}>
            {workOrder.operations.map((operation) => (
              <ListItem key={operation.id} paddingY="5px">
                <Text>
                  {operation.index}: {operation.id}
                </Text>
                <HStack marginLeft={5}>
                  <GiSewingMachine />
                  <Text>{operation.machineId}</Text>
                </HStack>
                <HStack marginLeft={5}>
                  <GiPencil />
                  <Text>{operation.name}</Text>
                </HStack>
                <HStack marginLeft={5}>
                  <FaHourglassStart />
                  <Text>{operation.start}</Text>
                </HStack>
                <HStack marginLeft={5}>
                  <FaHourglassEnd />
                  <Text>{operation.end}</Text>
                </HStack>
              </ListItem>
            ))}
          </List>
        </ListItem>
      ))}
    </List>
  );
};

export default WorOrderList;
