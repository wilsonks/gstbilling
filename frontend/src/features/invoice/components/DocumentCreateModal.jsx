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
import DocumentCreateForm from "./DocumentCreateForm";
import { resolveDocumentListPath } from "../documentRoutes";

export default function DocumentCreateModal({
  documentType,
  title,
  description,
  successTitle,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    const returnTo = location.state?.returnTo;
    if (returnTo) {
      navigate(returnTo);
      return;
    }

    navigate(resolveDocumentListPath(documentType));
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
          <DocumentCreateForm
            documentType={documentType}
            title={title}
            description={description}
            successTitle={successTitle}
            embedded
            onCancel={handleClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}