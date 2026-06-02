import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import DocumentDetailsPage from "./DocumentDetailsPage";
import { resolveDocumentListPath } from "../documentRoutes";

export default function DocumentDetailsModal({
  expectedDocumentType,
  title,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    const returnTo = location.state?.returnTo;
    if (returnTo) {
      navigate(returnTo);
      return;
    }

    navigate(resolveDocumentListPath(expectedDocumentType || "TAX_INVOICE"));
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="6xl"
      scrollBehavior="inside"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent maxW="95vw">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <DocumentDetailsPage
            expectedDocumentType={expectedDocumentType}
            title={title}
            embedded
            onClose={handleClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}