import type { SyntheticEvent } from "react";
import { Tab, Tabs } from "@mui/material";
import { useNavigate } from "react-router-dom";

type Props = {
  profileId?: string;
  activeTab: "profile" | "services" | "products" | "seo";
};

const BusinessProfileViewTabs = ({ profileId, activeTab }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="mb-4 border-b border-slate-200">
      <Tabs
        value={activeTab}
        onChange={(_event: SyntheticEvent, value: Props["activeTab"]) => {
          if (!profileId) return;
          if (value === "profile") {
            navigate(`/business-profile/view/${profileId}`);
          } else if (value === "services") {
            navigate(`/business-profile/view/${profileId}/services`);
          } else if (value === "products") {
            navigate(`/business-profile/view/${profileId}/products`);
          } else if (value === "seo") {
            navigate(`/business-profile/view/${profileId}/seo`);
          }
        }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab value="profile" label="Profile Details" />
        <Tab value="services" label="Services" />
        <Tab value="products" label="Products" />
        <Tab value="seo" label="SEO & Languages" />
      </Tabs>
    </div>
  );
};

export default BusinessProfileViewTabs;
