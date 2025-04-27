'use client';

import React from 'react';

interface KYCResultCardProps {
  type: string;
  data: any;
}

const KYCResultCard: React.FC<KYCResultCardProps> = ({ type, data }) => {
  const extractResultData = (data: any) => {
    if (!data) return null;
    // Check common nesting patterns
    return data.result?.source_output || data.data?.result?.source_output || data.data || data;
  };


  const resultData = extractResultData(data);
// Check if sub_code is "INSUFFICIENT_BALANCE"
const isInsufficientBalance = resultData?.sub_code === "INSUFFICIENT_BALANCE";
if (isInsufficientBalance) {
  return (
    <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl">
      <h2 className="text-lg font-bold mb-4">Insufficient Balance</h2>
      <p>The operation could not be completed due to insufficient balance.</p>
    </div>
  );
}
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
          const photo = resultData.photo.startsWith('data:image')
            ? resultData.photo
            : `data:image/jpeg;base64,${resultData.photo}`;
          add('Photo', photo);
        }
        break;
  case 'cin':
    const companyData = resultData.company_master_data;
    add('CIN', companyData?.cin);
    add('Company Name', companyData?.company_name);
    add('Incorporation Date', companyData?.date_of_incorporation);
    add('Registered Address', companyData?.registered_address);
    add('Status', companyData?.['company_status(for_efiling)']);
    break;

  case 'gst':
    add('GSTIN', resultData.gstin);
    add('Legal Name', resultData.lgnm);
    add('Trade Name', resultData.tradeNam);
    add('Register Date', resultData.rgdt);
    add('Address', resultData.pradr?.addr
      ? `${resultData.pradr.addr.bno}, ${resultData.pradr.addr.bnm}, ${resultData.pradr.addr.loc}, ${resultData.pradr.addr.st}, ${resultData.pradr.addr.dst} - ${resultData.pradr.addr.pncd}`
      : 'N/A');
    add('Status', resultData.sts);
    break;
      case 'dl':
        const dlData = resultData?.[0]?.result?.source_output || resultData;
        add('DL Number', dlData.id_number);
        add('Name', dlData.name);
        add('DOB', dlData.dob);
        add('Address', dlData.address);
        add('Validity', dlData.validity);
        break;
        case 'fssai':
          const detail = resultData.details?.[0];
          add('License Number', resultData.fssai_number);
          add('Business Name', detail?.company_name);
          add('Address', detail?.address_premises);
          add('Validity', detail?.last_updated_on);
          add('Application Type', detail?.app_type_desc);
          add('Status', detail?.status_desc);
          break;
          case 'shopact':
            add('Acknowledgement Number', resultData.acknowledgement_number);
            add('Business Name', resultData.business_name);
            add('Certificate Number', resultData.certificate_number);
            add('State', resultData.state_name);
            break;
          
        case 'udyam': 
          const result = resultData?.[0]?.result?.source_output;
          const general = result?.general_details;
          add('Enterprise Name', general?.enterprise_name || 'N/A');
          add('Type', general?.enterprise_type || 'N/A');
          add('Major Activity', general?.major_activity || 'N/A');
          add('Organization Type', general?.organization_type || 'N/A');
          add('Social Category', general?.social_category || 'N/A');
          add('State', general?.state || 'N/A');
          add('Applied Date', general?.applied_date || 'N/A');
          break;       
        case 'voter':
          const voterData = resultData?.[0]?.result?.source_output || resultData;
          add('Voter ID', voterData?.id_number);
          add('Name', voterData?.name_on_card);
          add('DOB', voterData?.date_of_birth);
          add('Gender', voterData?.gender);
          break;
      case 'passport':
        add('Passport Number', resultData.file_number);
        add('Name', resultData.name);
        add('DOB', resultData.dob);
        add('Application Received Date:', resultData.application_received_date);
        add('Status:', resultData.status);
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

  const renderRow = (label: string, value: any | React.ReactNode) => (
    
    <tr key={label}>
      <td className="font-semibold pr-4 align-top w-[250px]">{label}</td>
      <td>{value || 'N/A'}</td>
    </tr>
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

  const renderPAN = () => (
    <>
    {console.log(resultData)}
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
    {console.log(resultData)}
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

  const renderCIN = () => {
    const companyData = resultData.company_master_data;
  
    return (
      <>
        {console.log(resultData)}
        {renderRow('CIN:', companyData?.cin)}
        {renderRow('Company Name:', companyData?.company_name)}
        {renderRow('Incorporation Date:', companyData?.date_of_incorporation)}
        {renderRow('Registered Address:', companyData?.registered_address)}
        {renderRow('Status:', companyData?.['company_status(for_efiling)'])}
      </>
    );
  };
  
  
  const renderGST = () => (
    <>
    {console.log(resultData)}
      {renderRow('GSTIN:', resultData.gstin)}
      {renderRow('Legal Name:', resultData.lgnm)}
      {renderRow('Trade Name:', resultData.tradeNam)}
      {renderRow('Register Date:', resultData.rgdt)}
      {renderRow('Address:', `${resultData.pradr.addr.bno}, ${resultData.pradr.addr.bnm}, ${resultData.pradr.addr.loc}, ${resultData.pradr.addr.st}, ${resultData.pradr.addr.dst} - ${resultData.pradr.addr.pncd}`)}
      {renderRow('Status:', resultData.sts)}
    </>
  );

  const renderDL = () => {
    const dlData = resultData?.[0]?.result?.source_output;
  
    return (
      <>
        {console.log('DL Data:', dlData)}
        {renderRow('DL Number:', dlData?.id_number || 'N/A')}
        {renderRow('Name:', dlData?.name || 'N/A')}
        {renderRow('DOB:', dlData?.dob || 'N/A')}
        {renderRow('Address:', dlData?.address || 'N/A')}
        {renderRow('Validity:', dlData?.nt_validity_to || 'N/A')}
      </>
    );
  };
  

  const renderFSSAI = () => {
    const detail = resultData.details?.[0]; // safely access first item in details array
  
    return (
      <>
      {console.log(resultData)}
        {renderRow('License Number:', resultData.fssai_number)}
        {renderRow('Business Name:', detail?.company_name)}
        {renderRow('Address:', detail?.address_premises)}
        {renderRow('Validity:', detail?.last_updated_on)}
        {renderRow('Application Type:', detail?.app_type_desc)}
        {renderRow('Status:', detail?.status_desc)}
      </>
    );
  };
  

  const renderShopact = () => (
    <>
      {console.log(resultData)}
      {renderRow('Acknowledgement Number:', resultData.acknowledgement_number)}
      {renderRow('Business Name:', resultData.business_name)}
      {renderRow('Certificate Number:', resultData.certificate_number)}
      {renderRow('State:', resultData.state_name)}
    </>
  );
  

  const renderUdyam = () => {
    const result =resultData?.[0]?.result?.source_output;
  
    const general = result.general_details;
    const unit = result.unit_details?.[0]; // Assuming only one unit

  
    return (
      <>
        {renderRow('Enterprise Name:', general?.enterprise_name)}
        
        {renderRow('Type:', general?.enterprise_type)}
        {renderRow('Major Activity:', general?.major_activity)}
        {renderRow('Organization Type:', general?.organization_type)}
        {renderRow('Social Category:', general?.social_category)}
        {renderRow('State:', general?.state)}
        {renderRow('Applied Date:', general?.applied_date)}
      </>
    );
  };
 
  const renderVoter = () => {
    const voterData = resultData?.[0]?.result?.source_output || resultData;
  
    return (
      <>
        {console.log('Voter Data:', voterData)}
        {renderRow('Voter ID:', voterData.id_number)}
        {renderRow('Name:', voterData.name_on_card)}
        {renderRow('DOB:', voterData.date_of_birth)}
        {renderRow('Gender:', voterData.gender)}
      </>
    );
  };
  
  const renderPassport = () => (
    <>
    {console.log(resultData)}
      {renderRow('Passport Number:', resultData.file_number)}
      {renderRow('Name:', resultData.name)}
      {renderRow('DOB:', resultData.dob)}
      {renderRow('Application Received Date:', resultData.application_received_date)}
      {renderRow('Status:', resultData.status)}
    </>
  );

  const renderPANLink = () => (
    <>
    {console.log(resultData)}
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
