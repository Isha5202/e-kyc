'use client';

import { Tab } from '@headlessui/react';
import React, { useState } from 'react';
import InputGroup from '@/components/FormElements/InputGroup';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';

const ekycTypes = [
  { key: 'pan', label: 'PAN Verification', maxLength: 10, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, placeholder: 'Enter 10-char PAN' },
  { key: 'aadhar', label: 'Aadhar Verification', maxLength: 12, pattern: /^[0-9]{12}$/, placeholder: 'Enter 12-digit Aadhar' },
  { key: 'cin', label: 'CIN Verification', maxLength: 21, pattern: /^[A-Z0-9]{21}$/, placeholder: 'Enter CIN' },
  { key: 'gst', label: 'GST Verification', maxLength: 15, pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, placeholder: 'Enter GSTIN' },
  { key: 'dl', label: 'Driving License', maxLength: 16, pattern: /^[A-Z]{2}[0-9]{13}$/, placeholder: 'Enter Driving License' },
  { key: 'fssai', label: 'Food License (FSSAI)', maxLength: 14, pattern: /^[0-9]{14}$/, placeholder: 'Enter FSSAI Number' },
  { key: 'shopact', label: 'Shopact License', maxLength: 15, pattern: /^[A-Z0-9]{10,15}$/, placeholder: 'Enter Shopact License' },
  { key: 'udyam', label: 'Udyam Aadhaar', maxLength: 19, pattern: /^U[DY]{1}[A-Z0-9]{16}$/, placeholder: 'Enter Udyam Aadhaar' },
  { key: 'voter', label: 'Voter ID', maxLength: 10, pattern: /^[A-Z]{3}[0-9]{7}$/, placeholder: 'Enter Voter ID' },
  { key: 'passport', label: 'Passport', maxLength: 8, pattern: /^[A-Z]{1}[0-9]{7}$/, placeholder: 'Enter Passport Number' },
  { key: 'linking', label: 'Pan-Aadhaar Linking Status', maxLength: 10, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, placeholder: 'Enter PAN Number' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const EKYCForm = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [result, setResult] = useState('');

  const selectedType = ekycTypes[selectedIndex];

  const handleVerify = () => {
    if (!selectedType.pattern.test(inputValue)) {
      alert(`Enter valid ${selectedType.label}`);
      return;
    }
    setShowOtpInput(true);
  };

  const handleSubmit = () => {
    setResult(`✅ ${selectedType.label} verified successfully`);
    setTimeout(() => {
      setInputValue('');
      setOtp('');
      setShowOtpInput(false);
      setResult('');
    }, 2000);
  };

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <ShowcaseSection title="E-KYC Verification" className="!p-6.5">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <div className="flex gap-6">
            {/* Tabs List (Vertical) */}
            <Tab.List className="flex flex-col gap-2 w-64">
              {ekycTypes.map((type) => (
                <Tab key={type.key} className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg px-4 py-2 text-left text-sm font-medium',
                    selected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  )
                }>
                  {type.label}
                </Tab>
              ))}
            </Tab.List>

            {/* Tab Panel (Form Panel) */}
            <Tab.Panels className="flex-1">
              {ekycTypes.map((type, idx) => (
                <Tab.Panel key={type.key}>
                  <form className="space-y-6">
                    <InputGroup
                      label={type.label}
                      type="text"
                      placeholder={type.placeholder}
                      value={selectedIndex === idx ? inputValue : ''}
                      maxLength={type.maxLength}
                      handleChange={(e) => setInputValue(e.target.value)}
                      className="w-full"
                    />

                    <button
                      type="button"
                      onClick={handleVerify}
                      className="h-[50px] rounded-lg bg-blue-600 px-12 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Verify
                    </button>

                    {showOtpInput && (
                      <>
                        <InputGroup
                          label="OTP"
                          type="text"
                          placeholder="Enter OTP"
                          value={otp}
                          handleChange={(e) => setOtp(e.target.value)}
                          className="w-full"
                        />
                        <button
                          type="button"
                          onClick={handleSubmit}
                          className="h-[50px] rounded-lg bg-green-600 px-8 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Submit
                        </button>
                      </>
                    )}

                    {result && (
                      <div className="text-green-600 font-semibold pt-2">{result}</div>
                    )}
                  </form>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </div>
        </Tab.Group>
      </ShowcaseSection>
    </div>
  );
};

export default EKYCForm;
