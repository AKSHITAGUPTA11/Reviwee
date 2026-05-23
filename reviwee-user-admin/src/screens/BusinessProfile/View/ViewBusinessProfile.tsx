import { useEffect, useState } from "react";
import { Formik, type FormikHelpers } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Switch } from "@mui/material";
import { MdContentCopy, MdOpenInNew } from "react-icons/md";
import SideNavLayout from "../../../components/layouts/SideNavLayout/SideNavLayout";
import BusinessProfileQRCode from "../../../components/BusinessProfileQRCode/BusinessProfileQRCode";
import type { BusinessProfileFormValues } from "../../../models/BusinessProfile.model";
import {
  useGetBusinessProfileByIdQuery,
  useChangeStatusMemberByIdMutation,
  useUpdateBusinessProfileByIdMutation,
} from "../../../services/BusinessProfileService";
import {
  getApiMessage,
  showToast,
} from "../../../utils/validations/showToaster";
import BusinessProfileForm from "../Layouts/BusinessProfileForm";
import { mapApiToBusinessProfileFormValues } from "../utils/mapApiToBusinessProfileFormValues";
import { businessProfileFormValidationSchema } from "../utils/businessProfileFormValidation";
import BusinessProfileViewTabs from "./BusinessProfileViewTabs";
import usecreditScore from "../../../hooks/useCreditScoreOptions";

const genderShort = (g?: string) => (g === "FEMALE" ? "F" : "M");

const formatOwnerLine = (o: {
  name?: string;
  gender?: string;
  aliases?: string[];
}) => {
  const base = `${o.name ?? ""} (${genderShort(o.gender)})`;
  const aliases = Array.isArray(o.aliases)
    ? o.aliases.map((a) => String(a).trim()).filter(Boolean)
    : [];
  if (!aliases.length) return base;
  return `${base} — ${aliases.join(", ")}`;
};

const formatStaffLine = (s: { name?: string; gender?: string }) =>
  `${s.name ?? ""} (${genderShort(s.gender)})`;

const getMemberId = (member: unknown): string => {
  const m = member as Record<string, unknown> | undefined;
  const id = m?.id ?? m?._id;
  return typeof id === "string" && id.trim() ? id : "";
};

const getMemberIsActive = (member: unknown): boolean => {
  const m = member as Record<string, unknown> | undefined;
  if (typeof m?.isActive === "boolean") return m.isActive;

  const status =
    (m?.status ?? m?.memberStatus ?? m?.memberState ?? undefined) as
    | string
    | undefined;
  if (!status) return false;

  const s = String(status).trim().toLowerCase();
  return s === "active" || s.includes("active");
};

const getMemberDescription = (member: unknown): string => {
  const m = member as { description?: unknown } | undefined;
  return typeof m?.description === "string" ? m.description : "";
};

const emptyFormValues: BusinessProfileFormValues = {
  categoryId: "",
  subCategoryId: "",
  businessDisplayName: "",
  googleBusinessLink: "",
  creditConfigId: '',
  businessAliases: [],
  tags: [],
  businessDescription: "",
  address: {
    address: "",
    localLocationAliases: [],
  },
  owner: [],
  staff: [],
};

const toOptionalNumber = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
};

const LongTextCard = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) => (
  <div className="rounded-lg bg-slate-50 p-3 md:col-span-2">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-2 max-h-72 overflow-y-auto text-sm font-medium whitespace-pre-wrap wrap-break-word text-slate-800">
      {value?.trim() ? value : "-"}
    </p>
  </div>
);

const MemberDescriptionSection = ({ text }: { text: string }) => (
  <div className="mt-3 border-t border-slate-200 pt-3">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      Description
    </p>
    <p className="mt-1.5 max-h-64 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-slate-700">
      {text.trim() ? text : "—"}
    </p>
  </div>
);

const InfoCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | undefined;
}) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-sm font-medium text-slate-800 wrap-break-word">
      {value === undefined || value === null || value === ""
        ? "-"
        : typeof value === "boolean"
          ? value
            ? "Yes"
            : "No"
          : String(value)}
    </p>
  </div>
);

const ProfileCreditsHeader = ({
  totalCredits,
  remainingCredits,
}: {
  totalCredits?: number;
  remainingCredits?: number;
}) => {
  if (totalCredits == null && remainingCredits == null) return null;

  const used =
    typeof totalCredits === "number" && typeof remainingCredits === "number"
      ? Math.max(0, totalCredits - remainingCredits)
      : null;

  const pctUsed =
    typeof totalCredits === "number" &&
      typeof remainingCredits === "number" &&
      totalCredits > 0
      ? Math.min(
        100,
        Math.max(0, ((totalCredits - remainingCredits) / totalCredits) * 100)
      )
      : null;

  return (
    <div
      className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
      role="region"
      aria-label="Credit balance"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 via-emerald-500 to-cyan-500"
        aria-hidden
      />
      <div className="px-4 pb-4 pt-5">
        <p className="mb-3 text-xs font-medium text-slate-500">
          Credit balance
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
            <p className="text-[11px] font-medium text-slate-500">Total</p>
            <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-slate-900">
              {totalCredits != null ? totalCredits : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-teal-50/80 px-3 py-2.5 ring-1 ring-teal-100/90">
            <p className="text-[11px] font-medium text-teal-800/80">
              Remaining
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-teal-700">
              {remainingCredits != null ? remainingCredits : "—"}
            </p>
          </div>
        </div>
        {pctUsed != null && used != null && totalCredits != null && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="mb-2 flex items-baseline justify-between gap-2 text-xs">
              <span className="font-medium text-slate-600">Credits used</span>
              <span className="shrink-0 text-right tabular-nums text-slate-500">
                {used} of {totalCredits}{" "}
                <span className="text-slate-400">({Math.round(pctUsed)}%)</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-linear-to-r from-teal-500 to-emerald-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                style={{ width: `${pctUsed}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ViewBusinessProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isFetching } = useGetBusinessProfileByIdQuery(
    id ?? "",
    { skip: !id }
  );
  const [updateBusinessProfileById] = useUpdateBusinessProfileByIdMutation();
  const [changeStatusMemberById] = useChangeStatusMemberByIdMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [formInitialValues, setFormInitialValues] =
    useState<BusinessProfileFormValues>(emptyFormValues);
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(
    null
  );

  const item = data?.data || data || {};
  const { credit: creditConfigs, isDataLoading: isCreditLoading } =
    usecreditScore();

  useEffect(() => {
    if (isLoading || isFetching) return;
    const source = (data?.data || data || {}) as Record<string, unknown>;
    setFormInitialValues(mapApiToBusinessProfileFormValues(source));
  }, [data, isFetching, isLoading]);

  if (isLoading || isFetching) {
    return (
      <SideNavLayout>
        <div className="flex min-h-[200px] items-center justify-center p-4">
          <CircularProgress />
        </div>
      </SideNavLayout>
    );
  }

  const address = item?.address || {};
  const googleBusinessLink = item?.googleBusinessLink || "";
  const totalCredits = toOptionalNumber(item.totalCredits);
  const remainingCredits = toOptionalNumber(item.remainingCredits);
  const reviewLengthLabel = (() => {
    const creditConfigId = String(item?.creditConfigId ?? "");
    if (!creditConfigId) return "-";

    // If credits are still loading, keep the current value visible.
    if (isCreditLoading) return creditConfigId;

    const match = (Array.isArray(creditConfigs) ? creditConfigs : []).find(
      (c: any) => String(c?._id ?? "") === creditConfigId,
    );
    if (!match) return creditConfigId;

    const min = match.minWords ?? "";
    const max = match.maxWords ?? "";
    const creditNum = match.credit;
    const creditPart =
      creditNum == null || creditNum === ""
        ? ""
        : `${creditNum} ${creditNum === 1 ? "credit use" : "credits use"}`;

    return `${min} - ${max}${creditPart ? ` (${creditPart})` : ""}`;
  })();

  const handleOpenGoogleBusinessLink = () => {
    if (!googleBusinessLink) return;
    window.open(googleBusinessLink, "_blank", "noopener,noreferrer");
  };

  const handleCopyGoogleBusinessLink = async () => {
    if (!googleBusinessLink) return;
    try {
      await navigator.clipboard.writeText(googleBusinessLink);
      showToast("success", "Google business link copied");
    } catch {
      const input = document.createElement("input");
      input.value = googleBusinessLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      showToast("success", "Google business link copied");
    }
  };

  const handleSubmit = async (
    values: BusinessProfileFormValues,
    { setSubmitting }: FormikHelpers<BusinessProfileFormValues>
  ) => {
    if (!id) {
      setSubmitting(false);
      return;
    }

    const response = await updateBusinessProfileById({
      id,
      body: values,
    });

    if ("error" in response) {
      showToast(
        "error",
        getApiMessage(response, "Unable to update business profile")
      );
      setSubmitting(false);
      return;
    }

    showToast(
      "success",
      getApiMessage(response.data, "Business profile updated")
    );
    setIsEditing(false);
    setSubmitting(false);
  };

  const handleToggleMemberStatus = async (
    memberType: "owner" | "staff",
    member: unknown
  ) => {
    const memberId = getMemberId(member);
    if (!memberId) return;
    if (loadingMemberId === memberId) return;
    if (!id) return;

    setLoadingMemberId(memberId);
    try {
      const response = await changeStatusMemberById({
        profileId: id,
        body: { type: memberType, memberId },
      });

      if ("error" in response) {
        showToast(
          "error",
          getApiMessage(response, "Unable to update member status")
        );
        return;
      }

      showToast(
        "success",
        getApiMessage(response.data, "Member status updated")
      );
    } finally {
      setLoadingMemberId(null);
    }
  };

  return (
    <SideNavLayout>
      <div className="p-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 min-h-[calc(100vh-140px)]">
          <div className="mb-4 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="min-w-0 text-xl font-semibold text-slate-900">
                View Business Profile
              </h1>
              <button
                type="button"
                onClick={() => navigate("/business-profile")}
                className="shrink-0 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Back
              </button>
            </div>
            <ProfileCreditsHeader
              totalCredits={totalCredits}
              remainingCredits={remainingCredits}
            />
          </div>

          <BusinessProfileViewTabs profileId={id} activeTab="profile" />

          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-700">
                Basic Information
              </h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-md bg-(--primary-main) px-3 py-1.5 text-xs font-semibold text-white hover:bg-(--primary-hover)"
                >
                  Edit
                </button>
              ) : null}
            </div>

            {isEditing ? (
              <div className="mb-6">
                <Formik
                  enableReinitialize
                  initialValues={formInitialValues}
                  validationSchema={businessProfileFormValidationSchema}
                  onSubmit={handleSubmit}
                >
                  {(formikProps) => (
                    <BusinessProfileForm
                      formikProps={formikProps}
                      onClose={() => setIsEditing(false)}
                      formType="EDIT"
                      embedded
                    />
                  )}
                </Formik>
              </div>
            ) : (
              <div className="mb-6 grid gap-3 md:grid-cols-2">
                <InfoCard
                  label="Business Display Name"
                  value={item.businessDisplayName}
                />
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Google Business Link</p>
                  {googleBusinessLink ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleOpenGoogleBusinessLink}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <MdOpenInNew size={14} />
                        Open Link
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyGoogleBusinessLink}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <MdContentCopy size={14} />
                        Copy Link
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-slate-800">-</p>
                  )}
                </div>
                <InfoCard label="Category" value={item.categoryName} />
                <InfoCard label="Subcategory" value={item.subCategoryName} />
                <InfoCard
                  label="Reviews length"
                  value={reviewLengthLabel}
                />
                <InfoCard label="User Name" value={item.userName} />
                <InfoCard label="Business ID" value={item.businessId} />
                <InfoCard
                  label="Status"
                  value={item.isActive ? "Active" : "Inactive"}
                />
                <InfoCard
                  label="Business aliases"
                  value={
                    Array.isArray(item.businessAliases) && item.businessAliases.length > 0
                      ? item.businessAliases.join(", ")
                      : undefined
                  }
                />
                <InfoCard
                  label="Tags"
                  value={
                    Array.isArray(item.tags) && item.tags.length > 0
                      ? item.tags.join(", ")
                      : undefined
                  }
                />
                <LongTextCard
                  label="Business description"
                  value={item.businessDescription}
                />
              </div>
            )}

            {item.businessId && (
              <>
                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  QR Code
                </h3>
                <div className="mb-6 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="mb-3 text-xs text-slate-500">
                      Scan or download this QR code to share your business
                      profile
                    </p>
                    <BusinessProfileQRCode
                      businessId={item.businessId}
                      businessDisplayName={item.businessDisplayName}
                      size={180}
                      showDownload
                    />
                  </div>
                </div>
              </>
            )}

            {!isEditing && (
              <>
                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  Owner
                </h3>
                <div className="mb-6">
                  {Array.isArray(item.owner) && item.owner.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {item.owner.map((o: unknown, idx: number) => {
                        const memberId = getMemberId(o);
                        const isActive = getMemberIsActive(o);
                        const desc = getMemberDescription(o);

                        return (
                          <div
                            key={memberId || idx}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-sm font-semibold text-slate-900">
                                {formatOwnerLine(o as {
                                  name?: string;
                                  gender?: string;
                                  aliases?: string[];
                                })}
                              </p>
                              <Switch
                                size="small"
                                checked={isActive}
                                disabled={
                                  !memberId || loadingMemberId === memberId
                                }
                                onChange={() =>
                                  handleToggleMemberStatus("owner", o)
                                }
                              />
                            </div>
                            <MemberDescriptionSection text={desc} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                      —
                    </p>
                  )}
                </div>

                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  Staff
                </h3>
                <div className="mb-6">
                  {Array.isArray(item.staff) && item.staff.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {item.staff.map((s: unknown, idx: number) => {
                        const memberId = getMemberId(s);
                        const isActive = getMemberIsActive(s);
                        const desc = getMemberDescription(s);

                        return (
                          <div
                            key={memberId || idx}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-sm font-semibold text-slate-900">
                                {formatStaffLine(s as {
                                  name?: string;
                                  gender?: string;
                                })}
                              </p>
                              <Switch
                                size="small"
                                checked={isActive}
                                disabled={
                                  !memberId || loadingMemberId === memberId
                                }
                                onChange={() =>
                                  handleToggleMemberStatus("staff", s)
                                }
                              />
                            </div>
                            <MemberDescriptionSection text={desc} />
                          </div>
                        );
                      })}
                    </div>
                  ) : Array.isArray(item.employees) &&
                    item.employees.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {item.employees.map((s: unknown, idx: number) => {
                        const memberId = getMemberId(s);
                        const isActive = getMemberIsActive(s);
                        const desc = getMemberDescription(s);

                        return (
                          <div
                            key={memberId || idx}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-sm font-semibold text-slate-900">
                                {formatStaffLine(s as {
                                  name?: string;
                                  gender?: string;
                                })}
                              </p>
                              <Switch
                                size="small"
                                checked={isActive}
                                disabled={
                                  !memberId || loadingMemberId === memberId
                                }
                                onChange={() =>
                                  handleToggleMemberStatus("staff", s)
                                }
                              />
                            </div>
                            <MemberDescriptionSection text={desc} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                      —
                    </p>
                  )}
                </div>

                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  Address
                </h3>
                <div className="mb-6 grid gap-3 md:grid-cols-2">
                  <InfoCard label="Address" value={address.address} />
                  <InfoCard
                    label="Local location aliases"
                    value={
                      Array.isArray(address.localLocationAliases) &&
                        address.localLocationAliases.length > 0
                        ? address.localLocationAliases.join(", ")
                        : undefined
                    }
                  />
                </div>
              </>
            )}


          </>
        </div>
      </div>
    </SideNavLayout>
  );
};

export default ViewBusinessProfile;
