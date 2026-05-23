import { Navigate, useNavigate, useParams } from "react-router-dom";
import SideNavLayout from "src/components/layouts/SideNavLayout/SideNavLayout";
import EditBusinessProfileWrapper from "./EditBusinessProfileWrapper";

const EditBusinessProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id?.trim()) {
    return <Navigate to="/business-profile" replace />;
  }

  return (
    <SideNavLayout entityName="Edit business profile">
      <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-[#f6f8fc] px-4 py-6">
        <div className="mx-auto w-full max-w-5xl pb-8">
          <EditBusinessProfileWrapper
            businessId={id}
            onCancel={() => navigate("/business-profile")}
            onSuccess={() => navigate("/business-profile")}
          />
        </div>
      </div>
    </SideNavLayout>
  );
};

export default EditBusinessProfilePage;
