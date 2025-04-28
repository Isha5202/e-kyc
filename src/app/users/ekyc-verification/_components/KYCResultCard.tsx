"use client";

import React, { useState } from "react";

interface KYCResultCardProps {
  type: string;
  data: any;
}
const typeMapping: { [key: string]: string } = {
  pan: "PAN",
  aadhar: "Aadhaar",
  cin: "CIN",
  gst: "GST",
  dl: "Driving License",
  fssai: "FSSAI",
  shopact: "Shop Act",
  udyam: "Udyam Registration",
  voter: "Voter ID",
  passport: "Passport",
  "pan-aadhaar-link": "PAN-Aadhaar Link",
};

const KYCResultCard: React.FC<KYCResultCardProps> = ({ type, data }) => {
  const [loading, setLoading] = useState(false);
  const extractResultData = (data: any) => {
    if (!data) return null;
    // Check common nesting patterns
    return (
      data.result?.source_output ||
      data.data?.result?.source_output ||
      data.data ||
      data
    );
  };

  const resultData = extractResultData(data);
  // Check if sub_code is "INSUFFICIENT_BALANCE"
  const isInsufficientBalance = resultData?.sub_code === "INSUFFICIENT_BALANCE";
  if (isInsufficientBalance) {
    return (
      <div className="mt-4 rounded-xl bg-red-100 p-4 text-red-700">
        <h2 className="mb-4 text-lg font-bold">Insufficient Balance</h2>
        <p>The operation could not be completed due to insufficient balance.</p>
      </div>
    );
  }
  const downloadPDF = async () => {
    setLoading(true);
    const displayedData: Record<string, any> = {};

    const add = (label: string, value: any) => {
      displayedData[label] = value ?? "N/A";
    };
    const typeName = typeMapping[type] || type;
    switch (type) {
      case "pan":
        add("PAN Number", resultData.pan_number);
        add("Full Name", resultData.full_name);
        add("Gender", resultData.gender);
        add("Date of Birth", resultData.dob);
        add("Masked Aadhaar", resultData.masked_aadhaar);
        add("Aadhaar Linked", resultData.aadhaar_linked ? "Yes" : "No");
        add("Category", resultData.category);
        break;
      case "aadhar":
        add("Masked Number", resultData.maskedNumber);
        add("Name", resultData.name);
        add("DOB", resultData.dateOfBirth);
        add("Gender", resultData.gender);

        if (resultData.address) {
          const addressParts = [
            resultData.address.house,
            resultData.address.street,
            resultData.address.landmark,
            resultData.address.locality,
            resultData.address.vtc,
            resultData.address.subDistrict,
            resultData.address.district,
            resultData.address.state,
            resultData.address.pin ? `- ${resultData.address.pin}` : "",
          ].filter(Boolean); // removes empty strings

          const fullAddress = addressParts.join(" "); // join with single space
          add("Address", fullAddress || "N/A");
        } else {
          add("Address", "N/A");
        }

        if (resultData.photo) {
          const photo = resultData.photo.startsWith("data:image")
            ? resultData.photo
            : `data:image/jpeg;base64,${resultData.photo}`;
          add("Photo", photo);
        }
        break;

      case "cin":
        const companyData = resultData.company_master_data;
        add("CIN Number", companyData?.cin);
        add("Company Name", companyData?.company_name);
        add("Incorporation Date", companyData?.date_of_incorporation);
        add("Registered Address", companyData?.registered_address);
        add("Status", companyData?.["company_status(for_efiling)"]);
        break;

      case "gst":
        add("GSTIN", resultData.gstin);
        add("Legal Name", resultData.lgnm);
        add("Trade Name", resultData.tradeNam);
        add("Register Date", resultData.rgdt);
        add(
          "Address",
          resultData.pradr?.addr
            ? `${resultData.pradr.addr.bno}, ${resultData.pradr.addr.bnm}, ${resultData.pradr.addr.loc}, ${resultData.pradr.addr.st}, ${resultData.pradr.addr.dst} - ${resultData.pradr.addr.pncd}`
            : "N/A",
        );
        add("Status", resultData.sts);
        break;
      case "dl":
        const dlData = resultData?.[0]?.result?.source_output || resultData;
        add("Driving License Number", dlData.id_number);
        add("Name", dlData.name);
        add("DOB", dlData.dob);
        add("Address", dlData.address);
        add("Validity", dlData.validity);
        break;
      case "fssai":
        const detail = resultData.details?.[0];
        add("License Number", resultData.fssai_number);
        add("Business Name", detail?.company_name);
        add("Address", detail?.address_premises);
        add("Validity", detail?.last_updated_on);
        add("Application Type", detail?.app_type_desc);
        add("Status", detail?.status_desc);
        break;
      case "shopact":
        add("Acknowledgement Number", resultData.acknowledgement_number);
        add("Business Name", resultData.business_name);
        add("Certificate Number", resultData.certificate_number);
        add("State", resultData.state_name);
        break;

      case "udyam":
        const result = resultData?.[0]?.result?.source_output;
        const general = result?.general_details;
        add("Enterprise Name", general?.enterprise_name || "N/A");
        add("Type", general?.enterprise_type || "N/A");
        add("Major Activity", general?.major_activity || "N/A");
        add("Organization Type", general?.organization_type || "N/A");
        add("Social Category", general?.social_category || "N/A");
        add("State", general?.state || "N/A");
        add("Applied Date", general?.applied_date || "N/A");
        break;
      case "voter":
        const voterData = resultData?.[0]?.result?.source_output || resultData;
        add("Voter ID", voterData?.id_number);
        add("Name", voterData?.name_on_card);
        add("DOB", voterData?.date_of_birth);
        add("Gender", voterData?.gender);
        break;
      case "passport":
        add("File Number", resultData.file_number);
        add("Name", resultData.name);
        add("DOB", resultData.dob);
        add("Application Received Date:", resultData.application_received_date);
        add("Status:", resultData.status);
        break;
      case "pan-aadhaar-link":
        add("Message", resultData.message);
        break;
      default:
        Object.entries(resultData).forEach(([key, value]) => {
          add(
            key.replace(/_/g, " "),
            typeof value === "object" ? JSON.stringify(value) : value,
          );
        });
    }

    try {
      const response = await fetch("/api/kyc/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: displayedData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kyc_report_${type}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error during PDF download:", error);
      alert("There was an error generating the PDF. Please try again.");
    }finally {
      setLoading(false); // stop loading after completion (success or fail)
    }
  };
  const typeName = typeMapping[type] || type;
  if (!resultData) {
    return (
      <div className="font-semibold text-red-500">
        No data found for {typeName}.
      </div>
    );
  }
  const renderRow = (label: string, value: any | React.ReactNode) => (
    <tr key={label}>
      <td className="w-[250px] pr-4 align-top font-semibold">{label}</td>
      <td>{value || "N/A"}</td>
    </tr>
  );

  const renderContentByType = () => {
    switch (type) {
      case "pan":
        return renderPAN();
      case "aadhar":
        return renderAadhaar();
      case "cin":
        return renderCIN();
      case "gst":
        return renderGST();
      case "dl":
        return renderDL();
      case "fssai":
        return renderFSSAI();
      case "shopact":
        return renderShopact();
      case "udyam":
        return renderUdyam();
      case "voter":
        return renderVoter();
      case "passport":
        return renderPassport();
      case "pan-aadhaar-link":
        return renderPANLink();
      default:
        return renderGeneric();
    }
  };

  const renderPAN = () => (
    <>
      {console.log(resultData)}
      {renderRow("PAN Number:", resultData.pan_number)}
      {renderRow("Full Name:", resultData.full_name)}
      {renderRow("Gender:", resultData.gender)}
      {renderRow("Date of Birth:", resultData.dob)}
      {renderRow("Masked Aadhaar:", resultData.masked_aadhaar)}
      {renderRow("Aadhaar Linked:", resultData.aadhaar_linked ? "Yes" : "No")}
      {renderRow("Category:", resultData.category)}
    </>
  );

  const renderAadhaar = () => {
    const addressParts = [
      resultData.address?.house,
      resultData.address?.street,
      resultData.address?.landmark,
      resultData.address?.locality,
      resultData.address?.subDistrict,
      resultData.address?.district,
      resultData.address?.state,
      resultData.address?.pin ? `- ${resultData.address.pin}` : null,
    ]
      .filter((part) => part && part.trim() !== "")
      .join(" "); // 👈 JOIN WITH SPACE

    return (
      <>
        {console.log(resultData)}
        {renderRow("Masked Number:", resultData.maskedNumber)}
        {renderRow("Name:", resultData.name)}
        {renderRow("DOB:", resultData.dateOfBirth)}
        {renderRow("Gender:", resultData.gender)}
        {renderRow("Address:", addressParts || "N/A")}
        {resultData.photo &&
          renderRow(
            "Photo:",
            <img
              src={`data:image/jpeg;base64,${resultData.photo}`}
              alt="Aadhaar Holder"
              className="mt-2 h-32 w-32 rounded-md object-cover shadow"
            />,
          )}
      </>
    );
  };

  const renderCIN = () => {
    const companyData = resultData.company_master_data;

    return (
      <>
        {console.log(resultData)}
        {renderRow("CIN Number:", companyData?.cin)}
        {renderRow("Company Name:", companyData?.company_name)}
        {renderRow("Incorporation Date:", companyData?.date_of_incorporation)}
        {renderRow("Registered Address:", companyData?.registered_address)}
        {renderRow("Status:", companyData?.["company_status(for_efiling)"])}
      </>
    );
  };

  const renderGST = () => (
    <>
      {console.log(resultData)}
      {renderRow("GSTIN:", resultData.gstin)}
      {renderRow("Legal Name:", resultData.lgnm)}
      {renderRow("Trade Name:", resultData.tradeNam)}
      {renderRow("Register Date:", resultData.rgdt)}
      {renderRow(
        "Address:",
        `${resultData.pradr.addr.bno}, ${resultData.pradr.addr.bnm}, ${resultData.pradr.addr.loc}, ${resultData.pradr.addr.st}, ${resultData.pradr.addr.dst} - ${resultData.pradr.addr.pncd}`,
      )}
      {renderRow("Status:", resultData.sts)}
    </>
  );

  const renderDL = () => {
    const dlData = resultData?.[0]?.result?.source_output;

    return (
      <>
        {console.log("DL Data:", dlData)}
        {renderRow("Driving License Number:", dlData?.id_number || "N/A")}
        {renderRow("Name:", dlData?.name || "N/A")}
        {renderRow("DOB:", dlData?.dob || "N/A")}
        {renderRow("Address:", dlData?.address || "N/A")}
        {renderRow("Validity:", dlData?.nt_validity_to || "N/A")}
      </>
    );
  };

  const renderFSSAI = () => {
    const detail = resultData.details?.[0]; // safely access first item in details array

    return (
      <>
        {console.log(resultData)}
        {renderRow("License Number:", resultData.fssai_number)}
        {renderRow("Business Name:", detail?.company_name)}
        {renderRow("Address:", detail?.address_premises)}
        {renderRow("Validity:", detail?.last_updated_on)}
        {renderRow("Application Type:", detail?.app_type_desc)}
        {renderRow("Status:", detail?.status_desc)}
      </>
    );
  };

  const renderShopact = () => (
    <>
      {console.log(resultData)}
      {renderRow("Acknowledgement Number:", resultData.acknowledgement_number)}
      {renderRow("Business Name:", resultData.business_name)}
      {renderRow("Certificate Number:", resultData.certificate_number)}
      {renderRow("State:", resultData.state_name)}
    </>
  );

  const renderUdyam = () => {
    const result = resultData?.[0]?.result?.source_output;

    const general = result.general_details;
    const unit = result.unit_details?.[0]; // Assuming only one unit

    return (
      <>
        {renderRow("Enterprise Name:", general?.enterprise_name)}

        {renderRow("Type:", general?.enterprise_type)}
        {renderRow("Major Activity:", general?.major_activity)}
        {renderRow("Organization Type:", general?.organization_type)}
        {renderRow("Social Category:", general?.social_category)}
        {renderRow("State:", general?.state)}
        {renderRow("Applied Date:", general?.applied_date)}
      </>
    );
  };

  const renderVoter = () => {
    const voterData = resultData?.[0]?.result?.source_output || resultData;

    return (
      <>
        {console.log("Voter Data:", voterData)}
        {renderRow("Voter ID:", voterData.id_number)}
        {renderRow("Name:", voterData.name_on_card)}
        {renderRow("DOB:", voterData.date_of_birth)}
        {renderRow("Gender:", voterData.gender)}
      </>
    );
  };

  const renderPassport = () => (
    <>
      {console.log(resultData)}
      {renderRow("File Number:", resultData.file_number)}
      {renderRow("Name:", resultData.name)}
      {renderRow("DOB:", resultData.dob)}
      {renderRow(
        "Application Received Date:",
        resultData.application_received_date,
      )}
      {renderRow("Status:", resultData.status)}
    </>
  );

  const renderPANLink = () => (
    <>
      {console.log(resultData)}
      {renderRow("Message:", resultData.message)}
    </>
  );

  const renderGeneric = () => (
    <>
      {Object.entries(resultData).map(([key, value]) =>
        renderRow(
          key.replace(/_/g, " ") + ":",
          typeof value === "object"
            ? JSON.stringify(value, null, 2)
            : value?.toString(),
        ),
      )}
    </>
  );

  return (
    <div className="mt-4 w-[700px] rounded-xl bg-white p-4 text-gray-800">
<h2 className="mb-4 text-lg font-bold">
        {typeName} Verification Result
      </h2>
      <table className="mb-4 w-full table-auto text-left">
        <tbody>{renderContentByType()}</tbody>
      </table>
      <button
        onClick={downloadPDF}
        disabled={loading} //  disable button during loading
        className={`mt-4 rounded px-4 py-2 text-white transition ${
          loading ? "bg-blue-400" : "bg-blue-900 hover:bg-blue-800"
        }`}
      >
       {loading ? "Downloading..." : "Download as PDF"}
      </button>
    </div>
  );
};

export default KYCResultCard;
