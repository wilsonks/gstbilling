import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Skeleton,
  Stack,
  Switch,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import {
  createProduct,
  getGstSlabMasters,
  getHsnSacMasters,
  getUnitMasters,
  updateProduct,
} from "./productApi";

const initialForm = {
  code: "",
  name: "",
  description: "",
  defaultPrice: "",
  hsnSacId: "",
  unitId: "",
  gstSlabId: "",
  active: true,
};

function toOptionValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  product = null,
}) {
  const toast = useToast();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [touched, setTouched] = useState({});

  const [hsnSacOptions, setHsnSacOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [gstSlabOptions, setGstSlabOptions] = useState([]);

  const editing = !!product?.id;

  useEffect(() => {
    if (!isOpen) return;

    const loadMasters = async () => {
      setLoadingMasters(true);
      try {
        const [hsnSacData, unitData, gstData] = await Promise.all([
          getHsnSacMasters(),
          getUnitMasters(),
          getGstSlabMasters(),
        ]);

        setHsnSacOptions(hsnSacData || []);
        setUnitOptions(unitData || []);
        setGstSlabOptions(gstData || []);
      } catch (error) {
        toast({
          title: "Failed to load product master data",
          description: error?.response?.data?.message || "Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingMasters(false);
      }
    };

    loadMasters();
  }, [isOpen, toast]);

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      setForm({
        code: product.code ?? "",
        name: product.name ?? "",
        description: product.description ?? "",
        defaultPrice: product.defaultPrice ?? "",
        hsnSacId: toOptionValue(product.hsnSacId),
        unitId: toOptionValue(product.unitId),
        gstSlabId: toOptionValue(product.gstSlabId),
        active: product.active ?? true,
      });
    } else {
      setForm(initialForm);
    }

    setTouched({});
  }, [isOpen, product]);

  const selectedHsnSac = useMemo(() => {
    return hsnSacOptions.find((item) => String(item.id) === String(form.hsnSacId)) || null;
  }, [form.hsnSacId, hsnSacOptions]);

  const selectedGstSlab = useMemo(() => {
    return gstSlabOptions.find((item) => String(item.id) === String(form.gstSlabId)) || null;
  }, [form.gstSlabId, gstSlabOptions]);

  const errors = useMemo(() => {
    const next = {};

    if (!String(form.code).trim()) {
      next.code = "Product code is required";
    }

    if (!String(form.name).trim()) {
      next.name = "Product name is required";
    }

    if (form.defaultPrice === "" || form.defaultPrice === null) {
      next.defaultPrice = "Default price is required";
    } else if (Number(form.defaultPrice) < 0) {
      next.defaultPrice = "Default price cannot be negative";
    }

    if (!String(form.hsnSacId).trim()) {
      next.hsnSacId = "HSN/SAC is required";
    }

    if (!String(form.unitId).trim()) {
      next.unitId = "Unit is required";
    }

    if (!String(form.gstSlabId).trim()) {
      next.gstSlabId = "GST slab is required";
    }

    return next;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHsnSacChange = (value) => {
    const selected = hsnSacOptions.find((item) => String(item.id) === String(value));

    setForm((prev) => ({
      ...prev,
      hsnSacId: value,
      gstSlabId: selected?.defaultGstSlabId ? String(selected.defaultGstSlabId) : "",
    }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleModalClose = () => {
    if (saving) return;
    onClose?.();
  };

  const buildPayload = () => ({
    code: String(form.code || "").trim(),
    name: String(form.name || "").trim(),
    description: form.description ? String(form.description).trim() : null,
    defaultPrice: Number(form.defaultPrice),
    hsnSacId: Number(form.hsnSacId),
    unitId: Number(form.unitId),
    gstSlabId: Number(form.gstSlabId),
    active: !!form.active,
  });

  const handleSubmit = async () => {
    setTouched((prev) => ({
      ...prev,
      code: true,
      name: true,
      defaultPrice: true,
      hsnSacId: true,
      unitId: true,
      gstSlabId: true,
    }));

    if (!isValid) {
      toast({
        title: "Please fix the form errors",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();

      if (editing) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }

      toast({
        title: editing ? "Product updated" : "Product created",
        description: editing
          ? "The product has been updated successfully."
          : "The product has been created successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast({
        title: editing ? "Failed to update product" : "Failed to create product",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const disableForm = saving || loadingMasters;

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader>{editing ? "Edit Product" : "Create Product"}</ModalHeader>
        <ModalCloseButton isDisabled={saving} />

        <ModalBody>
          <Stack spacing={4}>
            <Text color="gray.500" fontSize="sm">
              Create products using standardized HSN/SAC, unit, and GST slab masters.
            </Text>

            {loadingMasters ? (
              <Stack spacing={4}>
                <Skeleton height="40px" />
                <Skeleton height="40px" />
                <Skeleton height="72px" />
                <Skeleton height="40px" />
                <Skeleton height="40px" />
              </Stack>
            ) : (
              <>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={touched.code && !!errors.code}>
                    <FormLabel>Product Code</FormLabel>
                    <Input
                      value={form.code}
                      onChange={(e) => handleChange("code", e.target.value)}
                      onBlur={() => handleBlur("code")}
                      placeholder="e.g. GST-SOFT-STD"
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.code}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={touched.name && !!errors.name}>
                    <FormLabel>Product Name</FormLabel>
                    <Input
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder="Enter product name"
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>
                </Grid>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                    isDisabled={disableForm}
                  />
                </FormControl>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={touched.hsnSacId && !!errors.hsnSacId}>
                    <FormLabel>HSN / SAC</FormLabel>
                    <Select
                      placeholder="Select HSN / SAC"
                      value={form.hsnSacId}
                      onChange={(e) => handleHsnSacChange(e.target.value)}
                      onBlur={() => handleBlur("hsnSacId")}
                      isDisabled={disableForm}
                    >
                      {hsnSacOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.code} - {item.description}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.hsnSacId}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={touched.unitId && !!errors.unitId}>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      placeholder="Select unit"
                      value={form.unitId}
                      onChange={(e) => handleChange("unitId", e.target.value)}
                      onBlur={() => handleBlur("unitId")}
                      isDisabled={disableForm}
                    >
                      {unitOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.code} - {item.name}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.unitId}</FormErrorMessage>
                  </FormControl>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={touched.gstSlabId && !!errors.gstSlabId}>
                    <FormLabel>GST Slab</FormLabel>
                    <Select
                      placeholder="Select GST slab"
                      value={form.gstSlabId}
                      onChange={(e) => handleChange("gstSlabId", e.target.value)}
                      onBlur={() => handleBlur("gstSlabId")}
                      isDisabled={disableForm}
                    >
                      {gstSlabOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.code} - {item.name} ({Number(item.rate || 0).toFixed(2)}%)
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.gstSlabId}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={touched.defaultPrice && !!errors.defaultPrice}>
                    <FormLabel>Default Price</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.defaultPrice}
                      onChange={(e) => handleChange("defaultPrice", e.target.value)}
                      onBlur={() => handleBlur("defaultPrice")}
                      placeholder="0.00"
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.defaultPrice}</FormErrorMessage>
                  </FormControl>
                </Grid>

                {selectedHsnSac && selectedGstSlab && (
                  <Box bg="blue.50" borderWidth="1px" borderColor="blue.100" borderRadius="md" p={3}>
                    <Text fontSize="sm" color="blue.800">
                      Selected HSN/SAC: <strong>{selectedHsnSac.code}</strong>
                    </Text>
                    <Text fontSize="sm" color="blue.800">
                      Default GST slab: <strong>{selectedGstSlab.code}</strong> (
                      {Number(selectedGstSlab.rate || 0).toFixed(2)}%)
                    </Text>
                  </Box>
                )}

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Active</FormLabel>
                  <Switch
                    isChecked={!!form.active}
                    onChange={(e) => handleChange("active", e.target.checked)}
                    isDisabled={disableForm}
                  />
                </FormControl>
              </>
            )}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleModalClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={saving}
            isDisabled={loadingMasters}
          >
            {editing ? "Save Changes" : "Create Product"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}