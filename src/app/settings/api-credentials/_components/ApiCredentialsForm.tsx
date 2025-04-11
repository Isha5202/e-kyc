// src/app/settings/api-credentials/_components/ApiCredentialsForm.tsx

import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export default function ApiCredentialsForm() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <ShowcaseSection title="API Credentials" className="!p-6.5">
        <form className="space-y-6">
          <InputGroup label="API Key" type="text" placeholder="Enter your API key" />
          <InputGroup label="API Secret" type="password" placeholder="Enter your API secret" />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            Save
          </button>
        </form>
      </ShowcaseSection>
    </div>
  );
}
