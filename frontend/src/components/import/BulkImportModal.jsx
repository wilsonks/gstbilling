import React, { useRef, useState } from "react";

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Divider,
  Grid,
  GridItem,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
} from "@chakra-ui/react";

import { CheckCircle, Download, FileSpreadsheet, Upload } from "lucide-react";

import { downloadBlob } from "../../utils/fileDownload";

const ImportStep = {
  UPLOAD: "UPLOAD",
  VALIDATION: "VALIDATION",
  COMMITTING: "COMMITTING",
  COMPLETE: "COMPLETE",
};

const getPreviewValue = (row, dtoField, rawField) => {
  if (row.data?.[dtoField] !== undefined && row.data?.[dtoField] !== null) {
    return row.data[dtoField];
  }

  return row.rawValues?.[rawField] ?? "-";
};

export default function BulkImportModal({
  isOpen,
  onClose,
  entityName,
  previewColumns = [],
  validationColumns = [],
  summaryCards = [],
  downloadTemplate,
  downloadErrors,
  validateImport,
  commitImport,
  onSuccess,
}) {
  const toast = useToast();

  const hiddenFileInputRef = useRef(null);

  const [file, setFile] = useState(null);

  const [validationResult, setValidationResult] = useState(null);

  const [commitResult, setCommitResult] = useState(null);

  const [step, setStep] = useState(ImportStep.UPLOAD);

  const [loading, setLoading] = useState(false);

  const [downloadingErrors, setDownloadingErrors] = useState(false);

  const resetState = () => {
    setFile(null);

    setValidationResult(null);

    setCommitResult(null);

    setStep(ImportStep.UPLOAD);

    setLoading(false);

    if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();

    onClose();
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await downloadTemplate();

      downloadBlob(blob, `${entityName.toLowerCase()}-template.xlsx`);
    } catch (error) {
      toast({
        title: "Failed to download template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownloadErrors = async () => {
    setDownloadingErrors(true);

    try {
      const blob = await downloadErrors(file);

      downloadBlob(blob, `${entityName.toLowerCase()}-import-errors.xlsx`);
    } catch (error) {
      toast({
        title: "Failed to download errors",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDownloadingErrors(false);
    }
  };

  const openFilePicker = () => {
    hiddenFileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] ?? null;

    setFile(selected);

    setValidationResult(null);

    setCommitResult(null);

    setStep(ImportStep.UPLOAD);
  };

  const handleValidate = async () => {
    if (!file) {
      toast({
        title: "Please select a file",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });

      return;
    }

    setLoading(true);

    try {
      const result = await validateImport(file);

      setValidationResult(result);

      setStep(ImportStep.VALIDATION);
    } catch (error) {
      toast({
        title: "Validation failed",
        description: error?.response?.data?.message ?? "Unknown error",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!file) {
      return;
    }

    setStep(ImportStep.COMMITTING);

    try {
      const result = await commitImport(file);

      setCommitResult(result);

      setStep(ImportStep.COMPLETE);

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: error?.response?.data?.message ?? "Unknown error",
        status: "error",
        duration: 4000,
        isClosable: true,
      });

      setStep(ImportStep.VALIDATION);
    }
  };

  const renderErrors = (errors = []) => {
    if (!errors.length) {
      return null;
    }

    return (
      <VStack spacing={3} align="stretch">
        {errors.map((error, index) => (
          <Box
            key={index}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            borderColor="red.200"
            bg="red.50"
          >
            <Text fontWeight="bold">Row {error.rowNumber}</Text>

            {error.column && <Text>Column: {error.column}</Text>}

            {error.value && <Text>Value: {error.value}</Text>}

            <Text color="red.600">{error.message}</Text>
          </Box>
        ))}
      </VStack>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="4xl"
      closeOnOverlayClick={!loading}
    >
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>{entityName} Import</ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          {step === ImportStep.UPLOAD && (
            <VStack align="stretch" spacing={5}>
              <Alert status="info">
                <AlertIcon />
                Download the template, populate your data, then validate before
                importing.
              </Alert>

              <Button
                leftIcon={<Download size={16} />}
                variant="outline"
                onClick={handleTemplateDownload}
              >
                Download Template
              </Button>

              <Divider />

              <input
                ref={hiddenFileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                style={{
                  display: "none",
                }}
              />

              <Button
                leftIcon={<Upload size={16} />}
                colorScheme="blue"
                variant="outline"
                onClick={openFilePicker}
              >
                Choose Excel File
              </Button>

              {file ? (
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p={4}
                  bg="green.50"
                  borderColor="green.200"
                >
                  <HStack>
                    <FileSpreadsheet size={20} />

                    <Box>
                      <Text fontWeight="600">Selected File</Text>

                      <Text fontSize="sm" color="gray.600">
                        {file.name}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Box
                  borderWidth="1px"
                  borderStyle="dashed"
                  borderRadius="md"
                  p={6}
                  textAlign="center"
                  color="gray.500"
                >
                  No file selected
                </Box>
              )}
            </VStack>
          )}

          {step === ImportStep.VALIDATION && validationResult && (
            <VStack align="stretch" spacing={4}>
              <Text fontWeight="bold">Validation Summary</Text>

              <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                <GridItem>
                  <Stat>
                    <StatLabel>Total Rows</StatLabel>

                    <StatNumber>{validationResult.totalRows}</StatNumber>
                  </Stat>
                </GridItem>

                <GridItem>
                  <Stat>
                    <StatLabel>Valid Rows</StatLabel>

                    <StatNumber color="green.500">
                      {validationResult.validRows}
                    </StatNumber>
                  </Stat>
                </GridItem>

                <GridItem>
                  <Stat>
                    <StatLabel>Invalid Rows</StatLabel>

                    <StatNumber color="red.500">
                      {validationResult.invalidRows}
                    </StatNumber>
                  </Stat>
                </GridItem>
                <GridItem>
                  <Stat>
                    <StatLabel>Success Rate</StatLabel>

                    <StatNumber color="blue.500">
                      {validationResult.totalRows > 0
                        ? Math.round(
                            (validationResult.validRows * 100) /
                              validationResult.totalRows,
                          )
                        : 0}
                      %
                    </StatNumber>
                  </Stat>
                </GridItem>
              </Grid>

              {validationResult.invalidRows > 0 ? (
                <Alert status="warning">
                  <AlertIcon />
                  {validationResult.invalidRows} row(s) require attention before
                  import.
                </Alert>
              ) : (
                <Alert status="success">
                  <AlertIcon />
                  All rows passed validation and are ready for import.
                </Alert>
              )}

              {validationResult.invalidRows > 0 && (
                <Button
                  leftIcon={<Download size={16} />}
                  colorScheme="orange"
                  variant="outline"
                  isLoading={downloadingErrors}
                  onClick={handleDownloadErrors}
                  alignSelf="flex-start"
                >
                  Download Errors.xlsx
                </Button>
              )}

              <Text fontWeight="bold">
                Preview Rows ({Math.min(validationResult.rows?.length ?? 0, 20)}
                )
              </Text>

              <TableContainer>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Row</Th>
                      <Th>Status</Th>
                      {previewColumns.map((column) => (
                        <Th key={column.dtoField}>{column.label}</Th>
                      ))}
                      <Th>First Issue</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {validationResult.rows?.slice(0, 20).map((row) => (
                      <Tr
                        key={row.rowNumber}
                        bg={row.valid ? undefined : "red.50"}
                      >
                        <Td>{row.rowNumber}</Td>

                        <Td>
                          <Badge colorScheme={row.valid ? "green" : "red"}>
                            {row.valid ? "✓ Valid" : "✗ Invalid"}
                          </Badge>
                        </Td>

                        {previewColumns.map((column) => {
                          let value = getPreviewValue(
                            row,
                            column.dtoField,
                            column.rawField,
                          );

                          if (column.formatter) {
                            value = column.formatter(value);
                          }

                          return <Td key={column.dtoField}>{value ?? "-"}</Td>;
                        })}

                        <Td>
                          <Badge
                            colorScheme={
                              row.errors?.length > 0 ? "red" : "green"
                            }
                          >
                            {row.errors?.[0] ?? "-"}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {validationResult.valid ? (
                <Alert status="success">
                  <AlertIcon />
                  Validation passed. Ready to import{" "}
                  {validationResult.validRows} rows.
                </Alert>
              ) : (
                <Alert status="error">
                  <AlertIcon />
                  Validation failed.
                </Alert>
              )}
            </VStack>
          )}

          {step === ImportStep.COMMITTING && (
            <VStack py={10} spacing={4}>
              <Spinner size="xl" />

              <Text>
                Importing {entityName}
                ...
              </Text>
            </VStack>
          )}

          {step === ImportStep.COMPLETE && commitResult && (
            <VStack align="stretch" spacing={4}>
              <Alert status={commitResult.failed > 0 ? "warning" : "success"}>
                <AlertIcon />

                {commitResult.failed > 0
                  ? "Import completed with errors."
                  : "Import completed successfully."}
              </Alert>

              <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                <Stat>
                  <StatLabel>Total</StatLabel>

                  <StatNumber>{commitResult.totalRows}</StatNumber>
                </Stat>

                <Stat>
                  <StatLabel>Inserted</StatLabel>

                  <StatNumber color="green.500">
                    {commitResult.inserted}
                  </StatNumber>
                </Stat>

                <Stat>
                  <StatLabel>Updated</StatLabel>

                  <StatNumber color="blue.500">
                    {commitResult.updated}
                  </StatNumber>
                </Stat>

                <Stat>
                  <StatLabel>Failed</StatLabel>

                  <StatNumber color="red.500">{commitResult.failed}</StatNumber>
                </Stat>
              </Grid>

              {commitResult.errors?.length > 0 && (
                <TableContainer>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Row</Th>
                        <Th>Error</Th>
                      </Tr>
                    </Thead>

                    <Tbody>
                      {commitResult.errors.map((error, index) => (
                        <Tr key={index}>
                          <Td>{error.rowNumber}</Td>
                          <Td>{error.message}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <HStack>
            {step === ImportStep.UPLOAD && (
              <Button
                colorScheme="blue"
                onClick={handleValidate}
                isLoading={loading}
              >
                Validate
              </Button>
            )}

            {step === ImportStep.VALIDATION && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep(ImportStep.UPLOAD)}
                >
                  Back
                </Button>

                <Button
                  colorScheme="green"
                  isDisabled={!validationResult?.valid}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Import ${validationResult.validRows} valid rows?`,
                      )
                    ) {
                      handleCommit();
                    }
                  }}
                >
                  Commit Import
                </Button>
              </>
            )}

            {step === ImportStep.COMPLETE && (
              <Button
                leftIcon={<CheckCircle size={16} />}
                colorScheme="green"
                onClick={handleClose}
              >
                Close
              </Button>
            )}

            {(step === ImportStep.UPLOAD || step === ImportStep.VALIDATION) && (
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
