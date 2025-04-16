'use client';

import React from 'react';

interface KYCResultCardProps {
  type: string;
  data: any;
}

const KYCResultCard: React.FC<KYCResultCardProps> = ({ type, data }) => {
  const resultData = data?.data;

  if (!resultData) {
    return <div className="text-red-500 font-semibold">⚠️ No data found for {type.toUpperCase()}.</div>;
  }

  const renderPAN = () => (
    <>
      <div> <strong>PAN Number:</strong> {resultData.pan_number || 'N/A'}</div>
      <div> <strong>Full Name:</strong> {resultData.full_name || 'N/A'}</div>
      <div> <strong>Gender:</strong> {resultData.gender || 'N/A'}</div>
      <div><strong>Date of Birth:</strong> {resultData.dob || 'N/A'}</div>
      <div> <strong>Masked Aadhaar:</strong> {resultData.masked_aadhaar || 'N/A'}</div>
      <div> <strong>Aadhaar Linked:</strong> {resultData.aadhaar_linked ? 'Yes' : 'No'}</div>
      <div><strong>Category:</strong> {resultData.category || 'N/A'}</div>
    </>
  );

  const renderAadhaar = () => (
    <>
      <div><strong>Aadhaar Number:</strong> {resultData.aadhaar_number || 'N/A'}</div>
      <div> <strong>Name:</strong> {resultData.name || 'N/A'}</div>
      <div> <strong>DOB:</strong> {resultData.dob || 'N/A'}</div>
      <div> <strong>Gender:</strong> {resultData.gender || 'N/A'}</div>
      <div> <strong>Address:</strong> {resultData.address?.full || 'N/A'}</div>
    </>
  );

  const renderCIN = () => (
    <>
      <div> <strong>CIN:</strong> {resultData.cin || 'N/A'}</div>
      <div> <strong>Company Name:</strong> {resultData.company_name || 'N/A'}</div>
      <div> <strong>Incorporation Date:</strong> {resultData.date_of_incorporation || 'N/A'}</div>
      <div> <strong>Registered Address:</strong> {resultData.registered_address || 'N/A'}</div>
      <div> <strong>Status:</strong> {resultData.company_status || 'N/A'}</div>
    </>
  );

  const renderGST = () => (
    <>
      <div> <strong>GSTIN:</strong> {resultData.gstin || 'N/A'}</div>
      <div> <strong>Legal Name:</strong> {resultData.legal_name || 'N/A'}</div>
      <div> <strong>Trade Name:</strong> {resultData.trade_name || 'N/A'}</div>
      <div> <strong>Address:</strong> {resultData.address || 'N/A'}</div>
      <div> <strong>Status:</strong> {resultData.status || 'N/A'}</div>
    </>
  );

  const renderDL = () => (
    <>
      <div> <strong>DL Number:</strong> {resultData.dl_number || 'N/A'}</div>
      <div> <strong>Name:</strong> {resultData.name || 'N/A'}</div>
      <div> <strong>DOB:</strong> {resultData.dob || 'N/A'}</div>
      <div> <strong>Address:</strong> {resultData.address || 'N/A'}</div>
      <div> <strong>Validity:</strong> {resultData.validity || 'N/A'}</div>
    </>
  );

  const renderFSSAI = () => (
    <>
      <div> <strong>License Number:</strong> {resultData.license_number || 'N/A'}</div>
      <div> <strong>Business Name:</strong> {resultData.business_name || 'N/A'}</div>
      <div><strong>Address:</strong> {resultData.address || 'N/A'}</div>
      <div> <strong>Validity:</strong> {resultData.valid_upto || 'N/A'}</div>
    </>
  );

  const renderShopact = () => (
    <>
      <div> <strong>License Number:</strong> {resultData.license_number || 'N/A'}</div>
      <div> <strong>Owner Name:</strong> {resultData.owner_name || 'N/A'}</div>
      <div> <strong>Business Address:</strong> {resultData.address || 'N/A'}</div>
    </>
  );

  const renderUdyam = () => (
    <>
      <div> <strong>Udyam Number:</strong> {resultData.udyam_number || 'N/A'}</div>
      <div> <strong>Enterprise Name:</strong> {resultData.enterprise_name || 'N/A'}</div>
      <div> <strong>Address:</strong> {resultData.address || 'N/A'}</div>
      <div> <strong>Type:</strong> {resultData.enterprise_type || 'N/A'}</div>
    </>
  );

  const renderVoter = () => (
    <>
      <div> <strong>Voter ID:</strong> {resultData.voter_id || 'N/A'}</div>
      <div> <strong>Name:</strong> {resultData.name || 'N/A'}</div>
      <div> <strong>DOB:</strong> {resultData.dob || 'N/A'}</div>
      <div> <strong>Gender:</strong> {resultData.gender || 'N/A'}</div>
      <div> <strong>Address:</strong> {resultData.address || 'N/A'}</div>
    </>
  );

  const renderPassport = () => (
    <>
      <div> <strong>Passport Number:</strong> {resultData.passport_number || 'N/A'}</div>
      <div> <strong>Name:</strong> {resultData.name || 'N/A'}</div>
      <div> <strong>DOB:</strong> {resultData.dob || 'N/A'}</div>
      <div> <strong>Address:</strong> {resultData.address || 'N/A'}</div>
    </>
  );

  const renderPANLink = () => (
    <>
      <div> <strong>PAN Number:</strong> {resultData.pan_number || 'N/A'}</div>
      <div> <strong>Linking Status:</strong> {resultData.linked_status || 'N/A'}</div>
      <div> <strong>Last Updated:</strong> {resultData.last_updated || 'N/A'}</div>
    </>
  );

  const renderGeneric = () => (
    <>
      {Object.entries(resultData).map(([key, value]) => (
        <div key={key}>
           <strong>{key.replace(/_/g, ' ')}:</strong>{' '}
          {typeof value === 'object' ? JSON.stringify(value) : value?.toString() || 'N/A'}
        </div>
      ))}
    </>
  );

  const renderContentByType = () => {
    switch (type) {
      case 'pan':
        return renderPAN();
      case 'aadhaar':
        return renderAadhaar();
      case 'cin':
        return renderCIN();
      case 'gst':
        return renderGST();
      case 'dl':
        return renderDL();
      case 'fssai':
        return renderFSSAI();
      case 'shopact':
        return renderShopact();
      case 'udyam':
        return renderUdyam();
      case 'voter':
        return renderVoter();
      case 'passport':
        return renderPassport();
      case 'pan_aadhaar':
        return renderPANLink();
      default:
        return renderGeneric();
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-xl space-y-2 text-gray-800">
      <h2 className="text-lg font-bold mb-2">
        ✅ {(type || 'UNKNOWN').replace(/_/g, ' ').toUpperCase()} Verification Result
      </h2>
      {renderContentByType()}
    </div>
  );
};

export default KYCResultCard;
