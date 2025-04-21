//src\app\users\ekyc-verification\_components\KYCResultCard.tsx
'use client';

import React from 'react';

interface KYCResultCardProps {
  type: string;
  data: any;
}

const KYCResultCard: React.FC<KYCResultCardProps> = ({ type, data }) => {
  const resultData = data?.data;

  const downloadPDF = async () => {
    const displayedData: Record<string, any> = {};
  
    const add = (label: string, value: any) => {
      displayedData[label] = value ?? 'N/A';
    };
  
    switch (type) {
      case 'pan':
        add('PAN Number', resultData.pan_number);
        add('Full Name', resultData.full_name);
        add('Gender', resultData.gender);
        add('Date of Birth', resultData.dob);
        add('Masked Aadhaar', resultData.masked_aadhaar);
        add('Aadhaar Linked', resultData.aadhaar_linked ? 'Yes' : 'No');
        add('Category', resultData.category);
        break;
      case 'aadhar':
        add('Masked Number', resultData.maskedNumber);
        add('Name', resultData.name);
        add('DOB', resultData.dateOfBirth);
        add('Gender', resultData.gender);
        add('Address', resultData.address ? `${resultData.address.locality || ''}, ${resultData.address.district || ''}, ${resultData.address.state || ''} - ${resultData.address.pin || ''}` : 'N/A');
        if (resultData.photo) {
          // Include base64 image
          const photo = resultData.photo.startsWith('data:image')
            ? resultData.photo
            : `data:image/jpeg;base64,${resultData.photo}`;
          add('Photo', photo);
        }
        break;
      case 'cin':
        add('CIN', resultData.cin);
        add('Company Name', resultData.company_name);
        add('Incorporation Date', resultData.date_of_incorporation);
        add('Registered Address', resultData.registered_address);
        add('Status', resultData.company_status);
        break;
      case 'gst':
        add('GSTIN', resultData.gstin);
        add('Legal Name', resultData.legal_name);
        add('Trade Name', resultData.trade_name);
        add('Address', resultData.address);
        add('Status', resultData.status);
        break;
      case 'dl':
        add('DL Number', resultData.dl_number);
        add('Name', resultData.name);
        add('DOB', resultData.dob);
        add('Address', resultData.address);
        add('Validity', resultData.validity);
        break;
      case 'fssai':
        add('License Number', resultData.license_number);
        add('Business Name', resultData.business_name);
        add('Address', resultData.address);
        add('Validity', resultData.valid_upto);
        break;
      case 'shopact':
        add('License Number', resultData.license_number);
        add('Owner Name', resultData.owner_name);
        add('Business Address', resultData.address);
        break;
      case 'udyam':
        add('Udyam Number', resultData.udyam_number);
        add('Enterprise Name', resultData.enterprise_name);
        add('Address', resultData.address);
        add('Type', resultData.enterprise_type);
        break;
      case 'voter':
        add('Voter ID', resultData.voter_id);
        add('Name', resultData.name);
        add('DOB', resultData.dob);
        add('Gender', resultData.gender);
        add('Address', resultData.address);
        break;
      case 'passport':
        add('Passport Number', resultData.passport_number);
        add('Name', resultData.name);
        add('DOB', resultData.dob);
        add('Address', resultData.address);
        if (resultData.photo) {
          const photo = resultData.photo.startsWith('data:image')
            ? resultData.photo
            : `data:image/jpeg;base64,${resultData.photo}`;
          add('Photo', photo);
        }
        break;
      case 'pan-aadhaar-link':
        add('Message', resultData.message);
        break;
      default:
        Object.entries(resultData).forEach(([key, value]) => {
          add(key.replace(/_/g, ' '), typeof value === 'object' ? JSON.stringify(value) : value);
        });
    }
  
    try {
      const response = await fetch('/api/kyc/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: displayedData }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
  
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kyc_report_${type}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error during PDF download:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };
  
  
  if (!resultData) {
    return (
      <div className="text-red-500 font-semibold">
        No data found for {type.toUpperCase()}.
      </div>
    );
  }

  const renderRow = (label: string, value: string | React.ReactNode) => (
    <tr key={label}>
      <td className="font-semibold pr-4 align-top">{label}</td>
      <td>{value || 'N/A'}</td>
    </tr>
  );

  const renderPAN = () => (
    <>
      {renderRow('PAN Number:', resultData.pan_number)}
      {renderRow('Full Name:', resultData.full_name)}
      {renderRow('Gender:', resultData.gender)}
      {renderRow('Date of Birth:', resultData.dob)}
      {renderRow('Masked Aadhaar:', resultData.masked_aadhaar)}
      {renderRow('Aadhaar Linked:', resultData.aadhaar_linked ? 'Yes' : 'No')}
      {renderRow('Category:', resultData.category)}
    </>
  );

  const renderAadhaar = () => (
    <>
      {renderRow('Masked Number:', resultData.maskedNumber)}
      {renderRow('Name:', resultData.name)}
      {renderRow('DOB:', resultData.dateOfBirth)}
      {renderRow('Gender:', resultData.gender)}
      {renderRow(
        'Address:',
        resultData.address
          ? `${resultData.address.locality || ''}, ${resultData.address.district || ''}, ${resultData.address.state || ''} - ${resultData.address.pin || ''}`
          : 'N/A'
      )}
      {resultData.photo &&
        renderRow(
          'Photo:',
          <img
            src={`data:image/jpeg;base64,${resultData.photo}`}
            alt="Aadhaar Holder"
            className="mt-2 rounded-md shadow w-32 h-32 object-cover"
          />
        )}
    </>
  );

  const renderCIN = () => (
    <>
      {renderRow('CIN:', resultData.cin)}
      {renderRow('Company Name:', resultData.company_name)}
      {renderRow('Incorporation Date:', resultData.date_of_incorporation)}
      {renderRow('Registered Address:', resultData.registered_address)}
      {renderRow('Status:', resultData.company_status)}
    </>
  );

  const renderGST = () => (
    <>
      {renderRow('GSTIN:', resultData.gstin)}
      {renderRow('Legal Name:', resultData.legal_name)}
      {renderRow('Trade Name:', resultData.trade_name)}
      {renderRow('Address:', resultData.address)}
      {renderRow('Status:', resultData.status)}
    </>
  );

  const renderDL = () => (
    <>
      {renderRow('DL Number:', resultData.dl_number)}
      {renderRow('Name:', resultData.name)}
      {renderRow('DOB:', resultData.dob)}
      {renderRow('Address:', resultData.address)}
      {renderRow('Validity:', resultData.validity)}
    </>
  );

  const renderFSSAI = () => (
    <>
      {renderRow('License Number:', resultData.license_number)}
      {renderRow('Business Name:', resultData.business_name)}
      {renderRow('Address:', resultData.address)}
      {renderRow('Validity:', resultData.valid_upto)}
    </>
  );

  const renderShopact = () => (
    <>
      {renderRow('License Number:', resultData.license_number)}
      {renderRow('Owner Name:', resultData.owner_name)}
      {renderRow('Business Address:', resultData.address)}
    </>
  );

  const renderUdyam = () => (
    <>
      {renderRow('Udyam Number:', resultData.udyam_number)}
      {renderRow('Enterprise Name:', resultData.enterprise_name)}
      {renderRow('Address:', resultData.address)}
      {renderRow('Type:', resultData.enterprise_type)}
    </>
  );

  const renderVoter = () => (
    <>
      {renderRow('Voter ID:', resultData.voter_id)}
      {renderRow('Name:', resultData.name)}
      {renderRow('DOB:', resultData.dob)}
      {renderRow('Gender:', resultData.gender)}
      {renderRow('Address:', resultData.address)}
    </>
  );

  const renderPassport = () => (
    <>
      {renderRow('Passport Number:', resultData.passport_number)}
      {renderRow('Name:', resultData.name)}
      {renderRow('DOB:', resultData.dob)}
      {renderRow('Address:', resultData.address)}
      {resultData.photo &&
        renderRow(
          'Photo:',
          <img
            src={`data:image/jpeg;base64,${resultData.photo}`}
            alt="Passport Holder"
            className="mt-2 rounded-md shadow w-32 h-32 object-cover"
          />
        )}
    </>
  );

  const renderPANLink = () => (
    <>
      {renderRow('Message:', resultData.message)}
    </>
  );

  const renderGeneric = () => (
    <>
      {Object.entries(resultData).map(([key, value]) =>
        renderRow(
          key.replace(/_/g, ' ') + ':',
          typeof value === 'object' ? JSON.stringify(value, null, 2) : value?.toString()
        )
      )}
    </>
  );

  const renderContentByType = () => {
    switch (type) {
      case 'pan': return renderPAN();
      case 'aadhar': return renderAadhaar();
      case 'cin': return renderCIN();
      case 'gst': return renderGST();
      case 'dl': return renderDL();
      case 'fssai': return renderFSSAI();
      case 'shopact': return renderShopact();
      case 'udyam': return renderUdyam();
      case 'voter': return renderVoter();
      case 'passport': return renderPassport();
      case 'pan-aadhaar-link': return renderPANLink();
      default: return renderGeneric();
    }
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-xl text-gray-800 w-[700px]">
      <h2 className="text-lg font-bold mb-4">
        {(type || 'UNKNOWN').replace(/_/g, ' ').toUpperCase()} Verification Result
      </h2>
      <table className="w-full text-left table-auto mb-4">
        <tbody>{renderContentByType()}</tbody>
      </table>
      <button
        onClick={downloadPDF}
        className="mt-4 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition"
      >
        Download as PDF
      </button>
    </div>
  );
};

export default KYCResultCard;
