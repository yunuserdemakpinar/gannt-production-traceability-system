import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
} from "@chakra-ui/react";

interface Props {
  updateError: string;
  onClose: () => void;
}

const UpdateError = ({ updateError, onClose }: Props) => {
  if (!updateError) return;
  return (
    <Alert status="error" padding={5}>
      <Box>
        <AlertIcon />
        <AlertTitle>An error occurred during the update!</AlertTitle>
        <AlertDescription>{updateError}</AlertDescription>
      </Box>
      <CloseButton
        alignSelf="flex-start"
        position="relative"
        right={-1}
        top={-1}
        onClick={onClose}
      />
    </Alert>
  );
};

export default UpdateError;
