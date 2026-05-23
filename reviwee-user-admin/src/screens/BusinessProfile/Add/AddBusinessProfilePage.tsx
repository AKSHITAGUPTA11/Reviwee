import { useLocation, useNavigate } from "react-router-dom";
import SideNavLayout from "src/components/layouts/SideNavLayout/SideNavLayout";
import AddBusinessProfileWrapper from "./AddBusinessProfileWrapper";

const AddBusinessProfilePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const googlePrefill = (state as { googlePrefill?: Record<string, string> } | null)
    ?.googlePrefill;

  return (
    <SideNavLayout entityName="Add business profile">
      <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-[#f6f8fc] px-4 py-6">
        <div className="mx-auto w-full max-w-5xl pb-8">
          <AddBusinessProfileWrapper
            onCancel={() => navigate("/business-profile")}
            onSuccess={() => navigate("/business-profile")}
            prefill={googlePrefill}
          />
        </div>
      </div>
    </SideNavLayout>
  );
};

export default AddBusinessProfilePage;
