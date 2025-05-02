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

const validationPatterns: Record<string, { pattern: RegExp, maxLength: number, uppercaseOnly?: boolean, numbersOnly?: boolean }> = {
  aadhaar_number: { pattern: /^[0-9]{12}$/, maxLength: 12 }, // Aadhaar number - only digits
  pan_number: { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, maxLength: 10, uppercaseOnly: true }, // PAN number - uppercase letters and digits only
  cin: { pattern: /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/, maxLength: 21, uppercaseOnly: true }, // CIN - uppercase letters and digits only
  gstin: { pattern: /^[A-Z0-9]{15}$/, maxLength: 15 }, // GSTIN - only digits
  rc_number: { pattern: /^[A-Z]{2}[0-9]{13}$/, maxLength: 15, uppercaseOnly: true }, // DL - uppercase letters and digits only
  fssai_number: { 
    pattern: /^[0-9]{14}$/,  // Exactly 14 digits
    maxLength: 14,
    numbersOnly: true 
  },
  shopact_number: { 
    pattern: /^[0-9]{2}\/[0-9]{3}\/[A-Z]{2}\/[0-9]{4}\/[0-9]{4}$/,
    maxLength: 19,
    uppercaseOnly: true
  },// Shopact - uppercase letters and digits only
  udyam_number: { 
    pattern: /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/, 
    maxLength: 19, 
    uppercaseOnly: true 
  }, // Udyam Aadhaar - uppercase letters and digits only
  epic_number: { pattern: /^[A-Z0-9]{10}$/, maxLength: 10, uppercaseOnly: true }, // Voter ID - uppercase letters and digits only
  passport_number: { pattern: /^[A-Z]{2}[0-9]{13}$/, maxLength: 15, uppercaseOnly: true }, // Passport - uppercase letter followed by digits only
  otp: { pattern: /^[0-9]{6}$/, maxLength: 6 }, // OTP - only digits
};

export default function EKYCForm() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    } else {
      // Convert to uppercase if the field requires it
      const validation = validationPatterns[name];
      if (validation?.uppercaseOnly) {
        formattedValue = value.toUpperCase();
      }

      // Special handling for number-only fields
    if (validation?.numbersOnly) {
      formattedValue = formattedValue.replace(/\D/g, ''); // Remove non-digits
    }

    // Special handling for EPIC number to remove special characters
    if (name === "epic_number") {
      // Remove any non-alphanumeric characters
      formattedValue = formattedValue.replace(/[^A-Z0-9]/g, '');
    }

    if (name === "gstin") {
      // Remove any non-alphanumeric characters
      formattedValue = formattedValue.replace(/[^A-Z0-9]/g, '');
    } 
    if (name === "cin") {
      // Remove any non-alphanumeric characters
      formattedValue = formattedValue.replace(/[^A-Z0-9]/g, '');
    }

    // Special handling for Shopact number
    if (name === "shopact_number") {
      // Allow numbers, uppercase letters, and forward slashes
      formattedValue = formattedValue.replace(/[^0-9A-Z\/]/g, '');
      
      // Auto-format while preserving manually entered slashes
      const parts = formattedValue.split('/');
      let newValue = '';
      
      // First part (2 digits)
      if (parts[0]) newValue += parts[0].slice(0, 2);
      
      // Second part (3 digits) - only add slash if user typed it or we have digits
      if (parts[1] || (parts[0] && parts[0].length >= 2 && formattedValue.includes('/'))) {
        newValue += '/' + (parts[1] || '').slice(0, 3);
      }
      
      // Third part (2 letters)
      if (parts[2] || (parts[1] && parts[1].length >= 3 && formattedValue.includes('/', newValue.lastIndexOf('/')))) {
        newValue += '/' + (parts[2] || '').slice(0, 2);
      }
      
      // Fourth part (4 digits)
      if (parts[3] || (parts[2] && parts[2].length >= 2 && formattedValue.includes('/', newValue.lastIndexOf('/')))) {
        newValue += '/' + (parts[3] || '').slice(0, 4);
      }
      
      // Fifth part (4 digits)
      if (parts[4] || (parts[3] && parts[3].length >= 4 && formattedValue.includes('/', newValue.lastIndexOf('/')))) {
        newValue += '/' + (parts[4] || '').slice(0, 4);
      }
      
      formattedValue = newValue;
    }
    if (name === "udyam_number") {
      // Remove invalid characters but keep hyphens
      formattedValue = formattedValue.replace(/[^A-Z0-9-]/g, '');
      
      // Auto-format while preserving manually entered hyphens
      const parts = formattedValue.split('-');
      let newValue = '';
      
      // First part (UDYAM)
      if (parts[0]) newValue += parts[0].slice(0, 5); // "UDYAM"
      
      // Second part (2 letters)
      if (parts[1] || (parts[0] && parts[0].length >= 5 && formattedValue.includes('-'))) {
        newValue += '-' + (parts[1] || '').slice(0, 2);
      }
      
      // Third part (2 digits)
      if (parts[2] || (parts[1] && parts[1].length >= 2 && formattedValue.includes('-', newValue.lastIndexOf('-')))) {
        newValue += '-' + (parts[2] || '').slice(0, 2);
      }
      
      // Fourth part (7 digits)
      if (parts[3] || (parts[2] && parts[2].length >= 2 && formattedValue.includes('-', newValue.lastIndexOf('-')))) {
        newValue += '-' + (parts[3] || '').slice(0, 7);
      }
      
      formattedValue = newValue;
    }

      // Validate input length
      if (validation && value.length > validation.maxLength) {
        return;
      }
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

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (type: string) => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (type === "aadhar") {
      if (aadhaarStep === 1) {
        if (!formData.aadhaar_number) {
          newErrors.aadhaar_number = "Aadhaar number is required";
          isValid = false;
        } else if (!validationPatterns.aadhaar_number.pattern.test(formData.aadhaar_number)) {
          newErrors.aadhaar_number = "Invalid Aadhaar number (must be 12 digits)";
          isValid = false;
        }
      } else {
        if (!otp) {
          newErrors.otp = "OTP is required";
          isValid = false;
        } else if (!validationPatterns.otp.pattern.test(otp)) {
          newErrors.otp = "Invalid OTP (must be 6 digits)";
          isValid = false;
        }
      }
    } else {
      // Validate based on form type
      switch (type) {
        case "pan":
          if (!formData.pan_number) {
            newErrors.pan_number = "PAN number is required";
            isValid = false;
          } else if (!validationPatterns.pan_number.pattern.test(formData.pan_number)) {
            newErrors.pan_number = "Invalid PAN number (format: ABCDE1234F)";
            isValid = false;
          }
          break;
        case "cin":
          if (!formData.cin) {
            newErrors.cin = "CIN is required";
            isValid = false;
          } else if (!validationPatterns.cin.pattern.test(formData.cin)) {
            newErrors.cin = "Invalid CIN format";
            isValid = false;
          }
          break;
        case "gst":
          if (!formData.gstin) {
            newErrors.gstin = "GSTIN is required";
            isValid = false;
          } else if (!validationPatterns.gstin.pattern.test(formData.gstin)) {
            newErrors.gstin = "Invalid GSTIN number format";
            isValid = false;
          }
          break;
        case "dl":
          if (!formData.rc_number) {
            newErrors.rc_number = "RC number is required";
            isValid = false;
          } else if (!validationPatterns.rc_number.pattern.test(formData.rc_number)) {
            newErrors.rc_number = "Invalid RC number format";
            isValid = false;
          }
          if (!formData.dob) {
            newErrors.dob = "Date of birth is required";
            isValid = false;
          }
          break;
          case "fssai":
            if (!formData.fssai_number) {
              newErrors.fssai_number = "FSSAI number is required";
              isValid = false;
            } else if (!validationPatterns.fssai_number.pattern.test(formData.fssai_number)) {
              newErrors.fssai_number = "Invalid FSSAI number (must be exactly 14 digits)";
              isValid = false;
            } else if (formData.fssai_number.length !== 14) {
              newErrors.fssai_number = "FSSAI number must be 14 digits";
              isValid = false;
            }
            break;
          case "shopact":
            if (!formData.shopact_number) {
              newErrors.shopact_number = "Shopact number is required";
              isValid = false;
            } else if (!validationPatterns.shopact_number.pattern.test(formData.shopact_number)) {
              newErrors.shopact_number = "Invalid Shopact number format (should be like 34/156/CE/0058/2023)";
              isValid = false;
            }
            if (!formData.state_code) {
              newErrors.state_code = "State is required";
              isValid = false;
            }
            break;
        case "udyam":
          if (!formData.udyam_number) {
            newErrors.udyam_number = "Udyam number is required";
            isValid = false;
          } else if (!validationPatterns.udyam_number.pattern.test(formData.udyam_number)) {
            newErrors.udyam_number = "Invalid Udyam number format";
            isValid = false;
          }
          break;
        case "voter":
          if (!formData.epic_number) {
            newErrors.epic_number = "Voter number is required";
            isValid = false;
          } else if (!validationPatterns.epic_number.pattern.test(formData.epic_number)) {
            newErrors.epic_number = "Invalid Voter number format";
            isValid = false;
          }
          break;
        case "passport":
          if (!formData.passport_number) {
            newErrors.passport_number = "Passport number is required";
            isValid = false;
          } else if (!validationPatterns.passport_number.pattern.test(formData.passport_number)) {
            newErrors.passport_number = "Invalid Passport number format";
            isValid = false;
          }
          if (!formData.dob) {
            newErrors.dob = "Date of birth is required";
            isValid = false;
          }
          break;
        case "pan-aadhaar-link":
          if (!formData.pan_number) {
            newErrors.pan_number = "PAN number is required";
            isValid = false;
          } else if (!validationPatterns.pan_number.pattern.test(formData.pan_number)) {
            newErrors.pan_number = "Invalid PAN number format";
            isValid = false;
          }
          if (!formData.aadhaar_number) {
            newErrors.aadhaar_number = "Aadhaar number is required";
            isValid = false;
          } else if (!validationPatterns.aadhaar_number.pattern.test(formData.aadhaar_number)) {
            newErrors.aadhaar_number = "Invalid Aadhaar number (must be 12 digits)";
            isValid = false;
          }
          break;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const getInputFieldForType = (type: string) => {
    switch (type) {
      case "pan": return "pan_number";
      case "aadhar": return "aadhaar_number";
      case "cin": return "cin";
      case "gst": return "gstin";
      case "dl": return "rc_number";
      case "fssai": return "fssai_number";
      case "shopact": return "shopact_number";
      case "udyam": return "udyam_number";
      case "voter": return "epic_number";
      case "passport": return "passport_number";
      default: return "inputValue";
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm(type)) {
      return;
    }

    setLoading(true);
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
          if (data.error === 'INSUFFICIENT_BALANCE' || data.sub_code === 'INSUFFICIENT_BALANCE') {
          setResults((prev) => ({ ...prev, [type]: data }));
          return;
        }
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
    setErrors({});

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
    setErrors({});
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
            maxLength={validationPatterns.aadhaar_number.maxLength}
            error={errors.aadhaar_number}
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
              maxLength={validationPatterns.otp.maxLength}
              error={errors.otp}
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
            maxLength={validationPatterns.pan_number.maxLength}
            error={errors.pan_number}
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
            maxLength={validationPatterns.cin.maxLength}
            error={errors.cin}
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
            maxLength={validationPatterns.gstin.maxLength}
            error={errors.gstin}
            required
          />
        );
      case "dl":
        return (
          <>
            <InputGroup
              label="RC Number"
              name="rc_number"
              value={formData.rc_number || ""}
              placeholder="Enter RC Number"
              type="text"
              handleChange={handleChange}
              maxLength={validationPatterns.rc_number.maxLength}
              error={errors.rc_number}
              required
            />
            <InputGroup
              label="Date of Birth"
              name="dob"
              value={formData.dob || ""}
              placeholder="YYYY-MM-DD"
              type="date"
              handleChange={handleChange}
              max={today}
              error={errors.dob}
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
            maxLength={validationPatterns.fssai_number.maxLength}
            error={errors.fssai_number}
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
              maxLength={validationPatterns.shopact_number.maxLength}
              error={errors.shopact_number}
              required
            />
            <Select
              label="State Code"
              name="state_code"
              value={formData.state_code || ""}
              items={stateOptions}
              placeholder="Select State"
              handleChange={handleChange}
              error={errors.state_code}
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
            maxLength={validationPatterns.udyam_number.maxLength}
            error={errors.udyam_number}
            required
          />
        );
      case "voter":
        return (
          <InputGroup
            label="Voter Number"
            name="epic_number"
            value={formData.epic_number || ""}
            placeholder="Enter Voter Number"
            type="text"
            handleChange={handleChange}
            maxLength={validationPatterns.epic_number.maxLength}
            error={errors.epic_number}
            required
          />
        );
      case "passport":
        return (
          <>
            <InputGroup
              label="File Number"
              name="passport_number"
              value={formData.passport_number || ""}
              placeholder="Enter File Number"
              type="text"
              handleChange={handleChange}
              maxLength={validationPatterns.passport_number.maxLength}
              error={errors.passport_number}
              required
            />
            <InputGroup
              label="Date of Birth"
              name="dob"
              value={formData.dob || ""}
              placeholder="YYYY-MM-DD"
              type="date"
              handleChange={handleChange}
              max={today}
              error={errors.dob}
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
              maxLength={validationPatterns.pan_number.maxLength}
              error={errors.pan_number}
              required
            />
            <InputGroup
              label="Aadhaar Number"
              name="aadhaar_number"
              value={formData.aadhaar_number || ""}
              placeholder="Enter Aadhaar Number"
              type="text"
              handleChange={handleChange}
              maxLength={validationPatterns.aadhaar_number.maxLength}
              error={errors.aadhaar_number}
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
                  `cursor-pointer rounded px-4 py-2 text-left border-blue-100 ${
                    selected
                      ? "bg-blue-100 font-medium text-blue-900 border-blue-100"
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
                    ekycFormInput={{
                      panNumber: formData.pan_number,
                      aadhaarNumber: formData.aadhaar_number,
                      inputValue: formData[getInputFieldForType(type.id)]
                    }}
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