"use client";

import { useState } from "react";
import { Tab } from "@headlessui/react";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import KYCResultCard from "./KYCResultCard";
import { Select } from "@/components/FormElements/select";

const ekycTypes = [
  { id: "pan", label: "PAN Verification" },
  { id: "aadhar", label: "Aadhar Verification" },
  { id: "cin", label: "CIN Verification" },
  { id: "gst", label: "GST Verification" },
  { id: "dl", label: "Driving License" },
  { id: "fssai", label: "Food License (FSSAI)" },
  { id: "shopact", label: "Shopact License" },
  { id: "udyam", label: "Udyam Aadhaar" },
  { id: "voter", label: "Voter ID" },
  { id: "passport", label: "Passport" },
  { id: "pan-aadhaar-link", label: "Pan-Aadhaar Linking Status" },
]; 

const validationPatterns: Record<string, RegExp> = {
  aadhar: /^[0-9]{12}$/, // Aadhaar number - only digits
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // PAN number - uppercase letters and digits only
  cin: /^[A-Z]{2}[0-9]{5}$/, // CIN - uppercase letters and digits only
  gst: /^[0-9]{15}$/, // GSTIN - only digits
  dl: /^[A-Z]{2}[0-9]{13}$/, // DL - uppercase letters and digits only
  fssai: /^[0-9]{14}$/, // FSSAI - only digits
  shopact: /^[A-Z0-9]{10}$/, // Shopact - uppercase letters and digits only
  udyam: /^[A-Z0-9]{12}$/, // Udyam Aadhaar - uppercase letters and digits only
  voter: /^[A-Z0-9]{10}$/, // Voter ID - uppercase letters and digits only
  passport: /^[A-Z]{1}[0-9]{7}$/, // Passport - uppercase letter followed by digits only
  otp: /^[0-9]{6}$/, // OTP - only digits
};


export default function EKYCForm() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);

  const [aadhaarStep, setAadhaarStep] = useState(1);
  const [txnId, setTxnId] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [otp, setOtp] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    let formattedValue = value;

    if (type === "date") {
      const dateObj = new Date(value);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      formattedValue = `${yyyy}-${mm}-${dd}`;
    }

    setFormData((prev) => {
      const newFormData = { ...prev, [name]: formattedValue };
      // Clear results whenever form data changes
      setResults((prevResults) => {
        const updatedResults = { ...prevResults };
        delete updatedResults[selectedIndex]; // Delete the results for the current tab
        return updatedResults;
      });
      return newFormData;
    });
  };
  const validateField = (type: keyof typeof validationPatterns, value: string) => {
    const pattern = validationPatterns[type]; // now TypeScript knows 'type' is a valid key
    if (pattern) {
      return pattern.test(value);
    }
    return true;
  };
  const handleSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    setLoading(true);
    const isValid = Object.entries(formData).every(([key, value]) => validateField(key, value));
    if (!isValid) {
      alert("Please provide valid inputs.");
      setLoading(false);
      return;
    }
    try {
      if (type === "aadhar") {
        if (aadhaarStep === 1) {
          const res = await fetch("/api/kyc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type,
              aadhaar_number: formData.aadhaar_number,
            }),
          });
          const data = await res.json();
          setTxnId(data.transaction_id);
          setReferenceId(data.reference_id);
          setAadhaarStep(2);
        } else {
          const res = await fetch("/api/kyc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "aadhar-verify",
              otp,
              txnId,
              reference_id: referenceId,
            }),
          });
          const data = await res.json();
          setResults((prev) => ({ ...prev, [type]: data }));
          setAadhaarStep(1);
          setOtp("");
          setTxnId("");
          setReferenceId("");
          setFormData({});
        }
      } else {
        const res = await fetch("/api/kyc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            ...formData,
          }),
        });
        const data = await res.json();
        setResults((prev) => ({ ...prev, [type]: data }));
      }
    } catch (err) {
      setResults((prev) => ({ ...prev, [type]: { error: "Request failed" } }));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (index: number) => {
    const newType = ekycTypes[index].id;

    setSelectedIndex(index);
    setFormData({});
    setAadhaarStep(1);
    setOtp("");
    setTxnId("");
    setReferenceId("");

    setResults((prev) => {
      const updated = { ...prev };
      if (updated[newType]) {
        delete updated[newType];
      }
      return updated;
    });
  };
  const clearForm = () => {
    setFormData({});
    setResults({});
    setOtp("");
    setTxnId("");
    setReferenceId("");
    setAadhaarStep(1);
  };

  const stateOptions = [
    { value: "DL", label: "Delhi" },
    { value: "HR", label: "Haryana" },
    { value: "JK", label: "Jammu And Kashmir" },
    { value: "KR", label: "Karnataka" },
    { value: "RJ", label: "Rajasthan" },
    { value: "TL", label: "Telangana" },
    { value: "UK", label: "Uttarakhand" },
    { value: "UP", label: "Uttar Pradesh" },
    { value: "WB", label: "West Bengal" },
  ];

  const renderFormFields = (type: string) => {
    if (type === "aadhar") {
      if (aadhaarStep === 1) {
        return (
          <InputGroup
            label="Aadhaar Number"
            name="aadhaar_number"
            value={formData.aadhaar_number || ""}
            placeholder="Enter Aadhaar Number"
            type="text"
            handleChange={handleChange}
            required
          />
        );
      } else {
        return (
          <>
            <p className="mb-2 font-medium text-green-600">
              OTP sent to your registered mobile. Enter OTP to verify.
            </p>
            <InputGroup
              label="Enter OTP"
              value={otp}
              name="otp"
              placeholder="Enter OTP"
              type="text"
              handleChange={(e) => setOtp(e.target.value)}
              required
            />
          </>
        );
      }
    }

    switch (type) {
      case "pan":
        return (
          <InputGroup
            label="PAN Number"
            name="pan_number"
            value={formData.pan_number || ""}
            placeholder="Enter PAN Number"
            type="text"
            handleChange={handleChange}
            required
          />
        );
      case "cin":
        return (
          <InputGroup
            label="CIN"
            name="cin"
            value={formData.cin || ""}
            placeholder="Enter CIN"
            type="text"
            handleChange={handleChange}
            required
          />
        );
      case "gst":
        return (
          <InputGroup
            label="GSTIN"
            name="gstin"
            value={formData.gstin || ""}
            placeholder="Enter GSTIN"
            type="text"
            handleChange={handleChange}
            required
          />
        );
      case "dl":
        return (
          <>
            <InputGroup
              label="DL Number"
              name="rc_number"
              value={formData.rc_number || ""}
              placeholder="Enter DL Number"
              type="text"
              handleChange={handleChange}
              required
            />
            <InputGroup
              label="Date of Birth"
              name="dob"
              value={formData.dob || ""}
              placeholder="YYYY-MM-DD"
              type="date"
              handleChange={handleChange}
              required
            />
          </>
        );
      case "fssai":
        return (
          <InputGroup
            label="FSSAI Number"
            name="fssai_number"
            value={formData.fssai_number || ""}
            placeholder="Enter FSSAI Number"
            type="text"
            handleChange={handleChange}
            required
          />
        );
      case "shopact":
        return (
          <>
            <InputGroup
              label="Shopact Number"
              name="shopact_number"
              value={formData.shopact_number || ""}
              placeholder="Enter Shopact Number"
              type="text"
              handleChange={handleChange}
              required
            />
            <Select
              label="State Code"
              name="state_code"
              value={formData.state_code || ""}
              items={stateOptions}
              placeholder="Select State"
              handleChange={handleChange}
            />
          </>
        );
      case "udyam":
        return (
          <InputGroup
            label="Udyam Aadhaar"
            value={formData.udyam_number || ""}
            name="udyam_number"
            placeholder="Enter Udyam Aadhaar Number"
            type="text"
            handleChange={handleChange}
            required
          />
        );
      case "voter":
        return (
          <InputGroup
            label="EPIC Number"
            name="epic_number"
            value={formData.epic_number || ""}
            placeholder="Enter EPIC Number"
            type="text"
            handleChange={handleChange}
            required
          />
        );
      case "passport":
        return (
          <>
            <InputGroup
              label="Passport Number"
              name="passport_number"
              value={formData.passport_number || ""}
              placeholder="Enter Passport Number"
              type="text"
              handleChange={handleChange}
              required
            />
            <InputGroup
              label="Date of Birth"
              name="dob"
              value={formData.dob || ""}
              placeholder="YYYY-MM-DD"
              type="date"
              handleChange={handleChange}
              required
            />
          </>
        );
      case "pan-aadhaar-link":
        return (
          <>
            <InputGroup
              label="PAN Number"
              name="pan_number"
              value={formData.pan_number || ""}
              placeholder="Enter PAN Number"
              type="text"
              handleChange={handleChange}
              required
            />
            <InputGroup
              label="Aadhaar Number"
              name="aadhaar_number"
              value={formData.aadhaar_number || ""}
              placeholder="Enter Aadhaar Number"
              type="text"
              handleChange={handleChange}
              required
            />
          </>
        );
      default:
        return <p>Unsupported KYC Type</p>;
    }
  };

  return (
    <ShowcaseSection title="E-KYC Verification">
      <Tab.Group selectedIndex={selectedIndex} onChange={handleTabChange}>
        <div className="flex">
          <Tab.List className="flex w-64 flex-col gap-1 border-r border-gray-200 pr-4">
            {ekycTypes.map((type) => (
              <Tab
                key={type.id}
                className={({ selected }) =>
                  `cursor-pointer rounded px-4 py-2 text-left ${
                    selected
                      ? "bg-blue-100 font-medium text-blue-900"
                      : "hover:bg-gray-100"
                  }`
                }
              >
                {type.label}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="flex-1 px-6">
            {ekycTypes.map((type) => (
              <Tab.Panel key={type.id}>
                <form
                  onSubmit={(e) => handleSubmit(e, type.id)}
                  className="space-y-4"
                >
                  {renderFormFields(type.id)}
                  <button
                    type="submit"
                    className="rounded bg-blue-900 px-4 py-2 text-white hover:bg-blue-800"
                    disabled={loading}
                  >
                    {type.id === "aadhar"
                      ? loading
                        ? "Processing..."
                        : aadhaarStep === 1
                          ? "Generate OTP"
                          : "Submit OTP"
                      : loading
                        ? "Verifying..."
                        : "Verify"}
                  </button>
                  <button
                    type="button"
                    onClick={clearForm}
                    className="mx-4 rounded bg-blue-900 px-4 py-2 text-white hover:bg-blue-800"
                  >
                    Clear
                  </button>
                </form>

                {results[type.id] && (
                  <KYCResultCard
                    type={ekycTypes[selectedIndex].id}
                    data={results[ekycTypes[selectedIndex].id]}
                  />
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </div>
      </Tab.Group>
    </ShowcaseSection>
  );
}
