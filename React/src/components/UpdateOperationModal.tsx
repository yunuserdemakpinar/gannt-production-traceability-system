import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { Operation } from "../hooks/userOperations";
import { useRef } from "react";
import apiClient from "../services/apiClient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation | null;
  onUpdateError: (updateError: string) => void;
  onRefresh: () => void;
}

const UpdateOperationModal = ({
  isOpen,
  onClose,
  operation,
  onUpdateError,
  onRefresh,
}: Props) => {
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Operation's Time</ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            apiClient
              .patch("/operations", {
                id: operation?.id,
                start: startRef.current?.value,
                end: endRef.current?.value,
              })
              .then((res) => {
                console.log(res);
              })
              .catch((err) => {
                onUpdateError(err.response.data.detail);
              });
            onRefresh();
          }}
        >
          <ModalBody>
            <Input ref={startRef} type="datetime-local" required={true} />
            <Input ref={endRef} type="datetime-local" required={true} />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button type="submit" variant="ghost">
              Update
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default UpdateOperationModal;
