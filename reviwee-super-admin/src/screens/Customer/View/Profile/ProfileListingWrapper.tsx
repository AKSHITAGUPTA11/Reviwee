import { useMemo, useState } from "react";
import type { columnTypes } from "src/components/UI/atoms/ATMTable/ATMTable";
import type { ProfileViewModel } from "src/models/Customer.model";
import { useGetAllProfileDataQuery } from "src/services/CustomerService";
import { useGetCustomerSubscriptionByIdQuery } from "src/services/CustomerSubscriptionService";
import ProfileDetailsDialog from "./ProfileDetailsDialog";
import ProfileList from "./ProfileList";

type Props = {
  customerId?: string;
};

const ProfileListingWrapper = ({ customerId }: Props) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedProfile, setSelectedProfile] = useState<ProfileViewModel | null>(null);

  const profilePayload = useMemo(
    () => ({
      params: ["businessDisplayName"],
      searchValue: "",
      dateFilter: { startDate: "", endDate: "", dateFilterKey: "" },
      rangeFilterBy: { rangeFilterKey: "", rangeInitial: "", rangeEnd: "" },
      orderBy: "createdAt",
      orderByValue: -1 as const,
      limit: rowsPerPage,
      page,
      filterBy: customerId
        ? [{ fieldName: "userId", value: [customerId] }]
        : [{ fieldName: "", value: [] }],
      isPaginationRequired: true,
    }),
    [page, rowsPerPage, customerId]
  );

  const { data: profileData, isLoading, isFetching } = useGetAllProfileDataQuery(profilePayload);
  const { data: customerSubscriptionData } = useGetCustomerSubscriptionByIdQuery(
    customerId ?? "",
    { skip: !customerId }
  );

  const columns: columnTypes[] = [
    {
      field: "businessDisplayName",
      headerName: "Business",
      flex: "flex-[1_1_0%]",
    },
    { field: "category", headerName: "Category", flex: "flex-[1_1_0%]" },
    { field: "subCategory", headerName: "Subcategory", flex: "flex-[1_1_0%]" },
    { field: "remainingCredits", headerName: "Remaining Credits", flex: "flex-[1_1_0%]" },
  ];

  const rows: ProfileViewModel[] = Array.isArray(profileData?.data)
    ? profileData.data.map((s: Record<string, unknown>) => {
        const address = s.address as Record<string, unknown> | undefined;
        const isActiveVal = s.isActive ?? s.is_active;
        const asNumber = (value: unknown) => {
          if (typeof value === "number") return value;
          if (typeof value === "string") {
            const parsed = Number(value);
            return Number.isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        };

        return {
          id: String(s.id ?? s._id ?? ""),
          userId: String(s.userId ?? s.user_id ?? ""),
          userName: String(s.userName ?? s.user_name ?? ""),
          displayName: String(s.displayName ?? s.display_name ?? s.planName ?? s.plan_name ?? ""),
          businessDisplayName: String(
            s.businessDisplayName ?? s.business_display_name ?? ""
          ),
          businessId: String(s.businessId ?? s.business_id ?? ""),
          businessDescription: String(
            s.businessDescription ?? s.business_description ?? ""
          ),
          googleBusinessLink: String(
            s.googleBusinessLink ?? s.google_business_link ?? ""
          ),
          ownerLabel: String(s.ownerLabel ?? s.owner_label ?? ""),
          categoryId: String(s.categoryId ?? s.category_id ?? ""),
          categoryName: String(s.categoryName ?? s.category_name ?? s.category ?? ""),
          category: String(s.categoryName ?? s.category_name ?? s.category ?? ""),
          subCategoryId: String(s.subCategoryId ?? s.sub_category_id ?? ""),
          subCategoryName: String(
            s.subCategoryName ?? s.sub_category_name ?? s.subCategory ?? s.sub_category ?? ""
          ),
          subCategory: String(
            s.subCategoryName ?? s.sub_category_name ?? s.subCategory ?? s.sub_category ?? ""
          ),
          addressLine: String(address?.address ?? s.addressLine ?? s.address_line ?? ""),
          businessAliases: Array.isArray(s.businessAliases)
            ? s.businessAliases.map((v) => String(v))
            : [],
          seoKeywords: Array.isArray(s.seoKeywords)
            ? s.seoKeywords.map((v) => String(v))
            : [],
          owner: Array.isArray(s.owner) ? s.owner.map((v) => String(v)) : [],
          staff: Array.isArray(s.staff) ? s.staff.map((v) => String(v)) : [],
          languages: Array.isArray(s.languages)
            ? s.languages.map((v) => String(v))
            : [],
          creditConfigId: String(s.creditConfigId ?? s.credit_config_id ?? ""),
          perRequestCredit: asNumber(s.perRequestCredit ?? s.per_request_credit),
          minWords: asNumber(s.minWords ?? s.min_words),
          maxWords: asNumber(s.maxWords ?? s.max_words),
          totalCredits: asNumber(s.totalCredits ?? s.total_credits),
          remainingCredits: asNumber(
            s.remainingCredits ?? s.remaining_credits ?? s.totalCredits ?? s.total_credits
          ),
          isActive: typeof isActiveVal === "boolean" ? isActiveVal : Boolean(isActiveVal),
        };
      })
    : [];

  const asNumber = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const subscriptionSource = (customerSubscriptionData?.data ??
    customerSubscriptionData ??
    {}) as Record<string, unknown>;

  const baseProfileDetails = rows[0];
  const profileSummaryDetails: ProfileViewModel | undefined =
    customerId && (subscriptionSource.id || subscriptionSource._id)
      ? {
          ...baseProfileDetails,
          id: String(subscriptionSource.id ?? subscriptionSource._id ?? customerId),
          remainingCredits: asNumber(
            subscriptionSource.remainingCredits ?? subscriptionSource.remaining_credits
          ),
          totalCredits: asNumber(
            subscriptionSource.credits ??
              subscriptionSource.totalCredits ??
              subscriptionSource.total_credits
          ),
          perRequestCredit: asNumber(
            subscriptionSource.perRequestCredit ??
              subscriptionSource.per_request_credit ??
              baseProfileDetails?.perRequestCredit
          ),
          minWords: asNumber(
            subscriptionSource.minWords ??
              subscriptionSource.min_words ??
              baseProfileDetails?.minWords
          ),
          maxWords: asNumber(
            subscriptionSource.maxWords ??
              subscriptionSource.max_words ??
              baseProfileDetails?.maxWords
          ),
        }
      : baseProfileDetails;

  const totalItems = profileData?.totalItem ?? profileData?.total ?? 0;

  return (
    <>
      <ProfileList
        columns={columns}
        rows={rows}
        profileDetails={profileSummaryDetails}
        onRowClick={(row) => setSelectedProfile(row)}
        paginationProps={{
          isTableLoading: isLoading || isFetching,
          totalItems,
          page,
          rowsPerPage,
          setPage,
          setRowsPerPage,
        }}
      />
      {selectedProfile && (
        <ProfileDetailsDialog
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </>
  );
};

export default ProfileListingWrapper;
