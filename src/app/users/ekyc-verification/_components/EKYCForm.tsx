"use client";

import { useState } from "react";
import { Tab } from "@headlessui/react";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import KYCResultCard from "./KYCResultCard";

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

export default function EKYCForm() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);

  const [aadhaarStep, setAadhaarStep] = useState(1);
  const [txnId, setTxnId] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [otp, setOtp] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
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
          body: JSON.stringify({ type, ...formData }),
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
    setSelectedIndex(index);
    setFormData({});
    setAadhaarStep(1);
    setOtp("");
    setTxnId("");
    setReferenceId("");
  };

  const renderFormFields = (type: string) => {
    if (type === "aadhar") {
      if (aadhaarStep === 1) {
        return (
          <InputGroup
            label="Aadhaar Number"
            name="aadhaar_number"
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
              placeholder="Enter DL Number"
              type="text"
              handleChange={handleChange}
              required
            />
            <InputGroup
              label="Date of Birth"
              name="dob"
              placeholder="YYYY-MM-DD"
              type="text"
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
              placeholder="Enter Shopact Number"
              type="text"
              handleChange={handleChange}
              required
            />
            <InputGroup
              label="State Code"
              name="state_code"
              placeholder="Enter State Code (e.g., MH)"
              type="text"
              handleChange={handleChange}
              required
            />
          </>
        );
      case "udyam":
        return (
          <InputGroup
            label="Udyam Aadhaar"
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
              placeholder="Enter Passport Number"
              type="text"
              handleChange={handleChange}
              required
            />
            <InputGroup
              label="Date of Birth"
              name="dob"
              placeholder="YYYY-MM-DD"
              type="text"
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
              placeholder="Enter PAN Number"
              type="text"
              handleChange={handleChange}
              required
            />
            <InputGroup
              label="Aadhaar Number"
              name="aadhaar_number"
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

  // const renderResult = (data: any): JSX.Element => {
  //   if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
  //     return <p>{String(data)}</p>;
  //   }

  //   if (Array.isArray(data)) {
  //     return (
  //       <ul className="list-disc list-inside pl-4">
  //         {data.map((item, index) => (
  //           <li key={index}>{renderResult(item)}</li>
  //         ))}
  //       </ul>
  //     );
  //   }

  //   if (typeof data === "object" && data !== null) {
  //     return (
  //       <ul className="list-disc list-inside pl-4">
  //         {Object.entries(data).map(([key, value]) => (
  //           <li key={key}>
  //             <strong>{key}:</strong> {renderResult(value)}
  //           </li>
  //         ))}
  //       </ul>
  //     );
  //   }

  //   return <p>Unsupported data type</p>;
  // };

  return (
    <ShowcaseSection title="E-KYC Verification">
      <Tab.Group selectedIndex={selectedIndex} onChange={handleTabChange}>
        <div className="flex">
          {/* Tab List */}
          <Tab.List className="w-64 flex flex-col gap-1 border-r border-gray-200 pr-4">
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

          {/* Tab Panels */}
          <Tab.Panels className="flex-1 px-6">
            {ekycTypes.map((type) => (
              <Tab.Panel key={type.id}>
                <form onSubmit={(e) => handleSubmit(e, type.id)} className="space-y-4">
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
                </form>

                {results[type.id] && (
                  <KYCResultCard type={ekycTypes[selectedIndex].id} data={results[ekycTypes[selectedIndex].id]} />

                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </div>
      </Tab.Group>
    </ShowcaseSection>
  );
}
