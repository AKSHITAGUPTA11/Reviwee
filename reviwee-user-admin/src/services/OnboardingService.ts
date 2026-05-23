import apiSlice from "./ApiSlice";

export type BusinessOnboardingPayload = {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  businessName: string;
  businessCategory: string;
  businessLocation: string;
  businessWebsite?: string;
  googleBusinessLink: string;
  placeId: string;
  reviewChannel: string;
};

type ApiStatusResponse = {
  status?: boolean;
  message?: string;
};

export const OnboardingServiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitBusinessOnboarding: builder.mutation<
      ApiStatusResponse,
      BusinessOnboardingPayload
    >({
      invalidatesTags: ["onboarding"],
      query: (body) => ({
        url: "/admin/business-onboarding",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSubmitBusinessOnboardingMutation } = OnboardingServiceApi;
