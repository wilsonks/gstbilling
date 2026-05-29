import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
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
import { createCustomer, updateCustomer } from "./customerApi";

const CUSTOMER_TYPES = [
  "BUSINESS",
  "INDIVIDUAL",
  "GOVERNMENT",
  "EXPORT",
];

const GST_REGISTRATION_TYPES = [
  "REGISTERED",
  "UNREGISTERED",
  "COMPOSITION",
  "SEZ",
  "EXPORT",
  "CONSUMER",
];

const initialForm = {
  code: "",
  legalName: "",
  tradeName: "",
  customerType: "BUSINESS",
  gstRegistrationType: "REGISTERED",
  gstin: "",
  pan: "",
  contactPerson: "",
  phone: "",
  email: "",
  billingAddressLine1: "",
  billingAddressLine2: "",
  billingCity: "",
  billingState: "",
  billingStateCode: "",
  billingPincode: "",
  billingCountry: "India",
  shippingSameAsBilling: true,
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingCity: "",
  shippingState: "",
  shippingStateCode: "",
  shippingPincode: "",
  shippingCountry: "India",
  paymentTermsDays: 30,
  active: true,
};

function requiresGstin(type) {
  return ["REGISTERED", "COMPOSITION", "SEZ"].includes(type);
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  onSuccess,
  customer = null,
}) {
  const toast = useToast();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [touched, setTouched] = useState({});

  const editing = !!customer?.id;

  useEffect(() => {
    if (!isOpen) return;

    setLoadingForm(true);

    if (customer) {
      setForm({
        code: customer.code ?? "",
        legalName: customer.legalName ?? "",
        tradeName: customer.tradeName ?? "",
        customerType: customer.customerType ?? "BUSINESS",
        gstRegistrationType: customer.gstRegistrationType ?? "REGISTERED",
        gstin: customer.gstin ?? "",
        pan: customer.pan ?? "",
        contactPerson: customer.contactPerson ?? "",
        phone: customer.phone ?? "",
        email: customer.email ?? "",
        billingAddressLine1: customer.billingAddressLine1 ?? "",
        billingAddressLine2: customer.billingAddressLine2 ?? "",
        billingCity: customer.billingCity ?? "",
        billingState: customer.billingState ?? "",
        billingStateCode: customer.billingStateCode ?? "",
        billingPincode: customer.billingPincode ?? "",
        billingCountry: customer.billingCountry ?? "India",
        shippingSameAsBilling: customer.shippingSameAsBilling ?? true,
        shippingAddressLine1: customer.shippingAddressLine1 ?? "",
        shippingAddressLine2: customer.shippingAddressLine2 ?? "",
        shippingCity: customer.shippingCity ?? "",
        shippingState: customer.shippingState ?? "",
        shippingStateCode: customer.shippingStateCode ?? "",
        shippingPincode: customer.shippingPincode ?? "",
        shippingCountry: customer.shippingCountry ?? "India",
        paymentTermsDays: customer.paymentTermsDays ?? 30,
        active: customer.active ?? true,
      });
    } else {
      setForm(initialForm);
    }

    setTouched({});
    setLoadingForm(false);
  }, [isOpen, customer]);

  const errors = useMemo(() => {
    const next = {};

    if (!String(form.code).trim()) next.code = "Customer code is required";
    if (!String(form.legalName).trim()) next.legalName = "Legal name is required";
    if (!String(form.customerType).trim()) next.customerType = "Customer type is required";
    if (!String(form.gstRegistrationType).trim()) {
      next.gstRegistrationType = "GST registration type is required";
    }

    if (requiresGstin(form.gstRegistrationType) && !String(form.gstin).trim()) {
      next.gstin = "GSTIN is required for the selected registration type";
    } else if (form.gstin && String(form.gstin).trim().length !== 15) {
      next.gstin = "GSTIN must be 15 characters";
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email).trim())
    ) {
      next.email = "Enter a valid email address";
    }

    if (form.paymentTermsDays === "" || form.paymentTermsDays === null) {
      next.paymentTermsDays = "Payment terms are required";
    } else if (Number(form.paymentTermsDays) < 0) {
      next.paymentTermsDays = "Payment terms cannot be negative";
    }

    if (!String(form.billingAddressLine1).trim()) {
      next.billingAddressLine1 = "Billing address line 1 is required";
    }

    if (!String(form.billingStateCode).trim()) {
      next.billingStateCode = "Billing state code is required";
    }

    if (!form.shippingSameAsBilling) {
      if (!String(form.shippingAddressLine1).trim()) {
        next.shippingAddressLine1 = "Shipping address line 1 is required";
      }
      if (!String(form.shippingStateCode).trim()) {
        next.shippingStateCode = "Shipping state code is required";
      }
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

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleShippingSameAsBilling = (checked) => {
    setForm((prev) => ({
      ...prev,
      shippingSameAsBilling: checked,
      ...(checked
        ? {
            shippingAddressLine1: prev.billingAddressLine1,
            shippingAddressLine2: prev.billingAddressLine2,
            shippingCity: prev.billingCity,
            shippingState: prev.billingState,
            shippingStateCode: prev.billingStateCode,
            shippingPincode: prev.billingPincode,
            shippingCountry: prev.billingCountry || "India",
          }
        : {}),
    }));
  };

  const buildPayload = () => ({
    code: String(form.code || "").trim().toUpperCase(),
    legalName: String(form.legalName || "").trim(),
    tradeName: String(form.tradeName || "").trim() || null,
    customerType: form.customerType,
    gstRegistrationType: form.gstRegistrationType,
    gstin: String(form.gstin || "").trim().toUpperCase() || null,
    pan: String(form.pan || "").trim().toUpperCase() || null,
    contactPerson: String(form.contactPerson || "").trim() || null,
    phone: String(form.phone || "").trim() || null,
    email: String(form.email || "").trim().toLowerCase() || null,
    billingAddressLine1: String(form.billingAddressLine1 || "").trim() || null,
    billingAddressLine2: String(form.billingAddressLine2 || "").trim() || null,
    billingCity: String(form.billingCity || "").trim() || null,
    billingState: String(form.billingState || "").trim() || null,
    billingStateCode: String(form.billingStateCode || "").trim().toUpperCase() || null,
    billingPincode: String(form.billingPincode || "").trim() || null,
    billingCountry: String(form.billingCountry || "").trim() || "India",
    shippingSameAsBilling: !!form.shippingSameAsBilling,
    shippingAddressLine1: form.shippingSameAsBilling
      ? String(form.billingAddressLine1 || "").trim() || null
      : String(form.shippingAddressLine1 || "").trim() || null,
    shippingAddressLine2: form.shippingSameAsBilling
      ? String(form.billingAddressLine2 || "").trim() || null
      : String(form.shippingAddressLine2 || "").trim() || null,
    shippingCity: form.shippingSameAsBilling
      ? String(form.billingCity || "").trim() || null
      : String(form.shippingCity || "").trim() || null,
    shippingState: form.shippingSameAsBilling
      ? String(form.billingState || "").trim() || null
      : String(form.shippingState || "").trim() || null,
    shippingStateCode: form.shippingSameAsBilling
      ? String(form.billingStateCode || "").trim().toUpperCase() || null
      : String(form.shippingStateCode || "").trim().toUpperCase() || null,
    shippingPincode: form.shippingSameAsBilling
      ? String(form.billingPincode || "").trim() || null
      : String(form.shippingPincode || "").trim() || null,
    shippingCountry: form.shippingSameAsBilling
      ? String(form.billingCountry || "").trim() || "India"
      : String(form.shippingCountry || "").trim() || "India",
    paymentTermsDays: Number(form.paymentTermsDays),
    active: !!form.active,
  });

  const handleSubmit = async () => {
    setTouched({
      code: true,
      legalName: true,
      customerType: true,
      gstRegistrationType: true,
      gstin: true,
      email: true,
      billingAddressLine1: true,
      billingStateCode: true,
      shippingAddressLine1: true,
      shippingStateCode: true,
      paymentTermsDays: true,
    });

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
        await updateCustomer(customer.id, payload);
      } else {
        await createCustomer(payload);
      }

      toast({
        title: editing ? "Customer updated" : "Customer created",
        description: editing
          ? "The customer has been updated successfully."
          : "The customer has been created successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast({
        title: editing ? "Failed to update customer" : "Failed to create customer",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const disableForm = saving || loadingForm;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader>{editing ? "Edit Customer" : "Create Customer"}</ModalHeader>
        <ModalCloseButton isDisabled={saving} />

        <ModalBody>
          <Stack spacing={5}>
            <Text color="gray.500" fontSize="sm">
              Create and manage invoice-ready customer profiles with GST and address details.
            </Text>

            {loadingForm ? (
              <Stack spacing={4}>
                <Skeleton height="40px" />
                <Skeleton height="40px" />
                <Skeleton height="80px" />
                <Skeleton height="80px" />
              </Stack>
            ) : (
              <>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={touched.code && !!errors.code}>
                    <FormLabel>Customer Code</FormLabel>
                    <Input
                      value={form.code}
                      onChange={(e) => handleChange("code", e.target.value)}
                      onBlur={() => handleBlur("code")}
                      placeholder="e.g. CUST-001"
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.code}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={touched.legalName && !!errors.legalName}>
                    <FormLabel>Legal Name</FormLabel>
                    <Input
                      value={form.legalName}
                      onChange={(e) => handleChange("legalName", e.target.value)}
                      onBlur={() => handleBlur("legalName")}
                      placeholder="Enter legal name"
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.legalName}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Trade Name</FormLabel>
                    <Input
                      value={form.tradeName}
                      onChange={(e) => handleChange("tradeName", e.target.value)}
                      placeholder="Enter trade name"
                      isDisabled={disableForm}
                    />
                  </FormControl>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={touched.customerType && !!errors.customerType}>
                    <FormLabel>Customer Type</FormLabel>
                    <Select
                      value={form.customerType}
                      onChange={(e) => handleChange("customerType", e.target.value)}
                      onBlur={() => handleBlur("customerType")}
                      isDisabled={disableForm}
                    >
                      {CUSTOMER_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.replaceAll("_", " ")}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.customerType}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isRequired
                    isInvalid={touched.gstRegistrationType && !!errors.gstRegistrationType}
                  >
                    <FormLabel>GST Registration Type</FormLabel>
                    <Select
                      value={form.gstRegistrationType}
                      onChange={(e) => handleChange("gstRegistrationType", e.target.value)}
                      onBlur={() => handleBlur("gstRegistrationType")}
                      isDisabled={disableForm}
                    >
                      {GST_REGISTRATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.replaceAll("_", " ")}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.gstRegistrationType}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={touched.gstin && !!errors.gstin}>
                    <FormLabel>GSTIN</FormLabel>
                    <Input
                      value={form.gstin}
                      onChange={(e) => handleChange("gstin", e.target.value.toUpperCase())}
                      onBlur={() => handleBlur("gstin")}
                      placeholder="Enter GSTIN"
                      maxLength={15}
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.gstin}</FormErrorMessage>
                  </FormControl>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr 1fr" }} gap={4}>
                  <FormControl>
                    <FormLabel>PAN</FormLabel>
                    <Input
                      value={form.pan}
                      onChange={(e) => handleChange("pan", e.target.value.toUpperCase())}
                      placeholder="Enter PAN"
                      maxLength={10}
                      isDisabled={disableForm}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Contact Person</FormLabel>
                    <Input
                      value={form.contactPerson}
                      onChange={(e) => handleChange("contactPerson", e.target.value)}
                      placeholder="Enter contact person"
                      isDisabled={disableForm}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Enter phone"
                      isDisabled={disableForm}
                    />
                  </FormControl>

                  <FormControl isInvalid={touched.email && !!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="Enter email"
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>
                </Grid>

                <Stack spacing={3}>
                  <Text fontWeight="600">Billing Address</Text>

                  <FormControl
                    isRequired
                    isInvalid={touched.billingAddressLine1 && !!errors.billingAddressLine1}
                  >
                    <FormLabel>Address Line 1</FormLabel>
                    <Textarea
                      value={form.billingAddressLine1}
                      onChange={(e) => handleChange("billingAddressLine1", e.target.value)}
                      onBlur={() => handleBlur("billingAddressLine1")}
                      placeholder="Enter billing address line 1"
                      rows={2}
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.billingAddressLine1}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Address Line 2</FormLabel>
                    <Input
                      value={form.billingAddressLine2}
                      onChange={(e) => handleChange("billingAddressLine2", e.target.value)}
                      placeholder="Enter billing address line 2"
                      isDisabled={disableForm}
                    />
                  </FormControl>

                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr 1fr 1fr" }} gap={4}>
                    <FormControl>
                      <FormLabel>City</FormLabel>
                      <Input
                        value={form.billingCity}
                        onChange={(e) => handleChange("billingCity", e.target.value)}
                        placeholder="City"
                        isDisabled={disableForm}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>State</FormLabel>
                      <Input
                        value={form.billingState}
                        onChange={(e) => handleChange("billingState", e.target.value)}
                        placeholder="State"
                        isDisabled={disableForm}
                      />
                    </FormControl>

                    <FormControl
                      isRequired
                      isInvalid={touched.billingStateCode && !!errors.billingStateCode}
                    >
                      <FormLabel>State Code</FormLabel>
                      <Input
                        value={form.billingStateCode}
                        onChange={(e) =>
                          handleChange("billingStateCode", e.target.value.toUpperCase())
                        }
                        onBlur={() => handleBlur("billingStateCode")}
                        placeholder="e.g. 29"
                        maxLength={2}
                        isDisabled={disableForm}
                      />
                      <FormErrorMessage>{errors.billingStateCode}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Pincode</FormLabel>
                      <Input
                        value={form.billingPincode}
                        onChange={(e) => handleChange("billingPincode", e.target.value)}
                        placeholder="Pincode"
                        isDisabled={disableForm}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Country</FormLabel>
                      <Input
                        value={form.billingCountry}
                        onChange={(e) => handleChange("billingCountry", e.target.value)}
                        placeholder="Country"
                        isDisabled={disableForm}
                      />
                    </FormControl>
                  </Grid>
                </Stack>

                <Stack spacing={3}>
                  <Checkbox
                    isChecked={form.shippingSameAsBilling}
                    onChange={(e) => handleShippingSameAsBilling(e.target.checked)}
                    isDisabled={disableForm}
                  >
                    Shipping address same as billing
                  </Checkbox>

                  {!form.shippingSameAsBilling && (
                    <>
                      <Text fontWeight="600">Shipping Address</Text>

                      <FormControl
                        isRequired
                        isInvalid={touched.shippingAddressLine1 && !!errors.shippingAddressLine1}
                      >
                        <FormLabel>Address Line 1</FormLabel>
                        <Textarea
                          value={form.shippingAddressLine1}
                          onChange={(e) => handleChange("shippingAddressLine1", e.target.value)}
                          onBlur={() => handleBlur("shippingAddressLine1")}
                          placeholder="Enter shipping address line 1"
                          rows={2}
                          isDisabled={disableForm}
                        />
                        <FormErrorMessage>{errors.shippingAddressLine1}</FormErrorMessage>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Address Line 2</FormLabel>
                        <Input
                          value={form.shippingAddressLine2}
                          onChange={(e) => handleChange("shippingAddressLine2", e.target.value)}
                          placeholder="Enter shipping address line 2"
                          isDisabled={disableForm}
                        />
                      </FormControl>

                      <Grid
                        templateColumns={{ base: "1fr", md: "1fr 1fr 1fr 1fr 1fr" }}
                        gap={4}
                      >
                        <FormControl>
                          <FormLabel>City</FormLabel>
                          <Input
                            value={form.shippingCity}
                            onChange={(e) => handleChange("shippingCity", e.target.value)}
                            placeholder="City"
                            isDisabled={disableForm}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>State</FormLabel>
                          <Input
                            value={form.shippingState}
                            onChange={(e) => handleChange("shippingState", e.target.value)}
                            placeholder="State"
                            isDisabled={disableForm}
                          />
                        </FormControl>

                        <FormControl
                          isRequired
                          isInvalid={touched.shippingStateCode && !!errors.shippingStateCode}
                        >
                          <FormLabel>State Code</FormLabel>
                          <Input
                            value={form.shippingStateCode}
                            onChange={(e) =>
                              handleChange("shippingStateCode", e.target.value.toUpperCase())
                            }
                            onBlur={() => handleBlur("shippingStateCode")}
                            placeholder="e.g. 29"
                            maxLength={2}
                            isDisabled={disableForm}
                          />
                          <FormErrorMessage>{errors.shippingStateCode}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Pincode</FormLabel>
                          <Input
                            value={form.shippingPincode}
                            onChange={(e) => handleChange("shippingPincode", e.target.value)}
                            placeholder="Pincode"
                            isDisabled={disableForm}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Country</FormLabel>
                          <Input
                            value={form.shippingCountry}
                            onChange={(e) => handleChange("shippingCountry", e.target.value)}
                            placeholder="Country"
                            isDisabled={disableForm}
                          />
                        </FormControl>
                      </Grid>
                    </>
                  )}
                </Stack>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl
                    isRequired
                    isInvalid={touched.paymentTermsDays && !!errors.paymentTermsDays}
                  >
                    <FormLabel>Payment Terms (Days)</FormLabel>
                    <Input
                      type="number"
                      value={form.paymentTermsDays}
                      onChange={(e) => handleChange("paymentTermsDays", e.target.value)}
                      onBlur={() => handleBlur("paymentTermsDays")}
                      min={0}
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.paymentTermsDays}</FormErrorMessage>
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Active</FormLabel>
                    <Switch
                      isChecked={!!form.active}
                      onChange={(e) => handleChange("active", e.target.checked)}
                      isDisabled={disableForm}
                    />
                  </FormControl>
                </Grid>
              </>
            )}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={saving}>
            {editing ? "Save Changes" : "Create Customer"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}