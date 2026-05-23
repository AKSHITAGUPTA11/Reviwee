import apiSlice from "./ApiSlice";
import { v4 as uuid } from "uuid";

const deviceId = localStorage.getItem("deviceId") || uuid();

export const UserServiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //Get All User
    getAllUserData: builder.query({
      providesTags: ["admin"],
      query: (body) => {
        return {
          url: "/admin",
          method: "POST",
          body,
        };
      },
    }),

    //Get User
    getAllUser: builder.query({
      providesTags: ["admin"],
      query: () => {
        return {
          url: "/admin",
          method: "POST",
        };
      },
    }),

    // add User
    addUser: builder.mutation({
      invalidatesTags: ["admin"],
      query: (body) => ({
        url: `/admin/signup`,
        method: "POST",
        headers: {
          "device-id": deviceId,
        },
        body,
      }),
    }),
    Login: builder.mutation({
      invalidatesTags: ["admin"],
      query: (body) => ({
        url: `/admin/login/super-admin`,
        method: "POST",
        headers: {
          "device-id": deviceId,
        },
        body,
      }),
    }),
    googleLogin: builder.mutation({
      query: (body) => {
        return {
          url: "/admin/login-with-google",
          method: "POST",
          headers: {
            "device-id": deviceId,
          },
          body,
        };
      },
      transformResponse: (response) => {
        return { ...response, data: { ...response?.data, deviceId } };
      },
    }),
    // update User
    updateUser: builder.mutation({
      invalidatesTags: ["admin"],
      query: ({ body, id }) => {
        return {
          url: `/admin/profile/${id}`,
          method: "PUT",
          body,
        };
      },
    }),

    //Get Single User
    getSingleUser: builder.query({
      providesTags: ["admin"],
      query: ({ id }: { id: string }) => {
        return {
          url: `/admin/${id}`,
          method: "GET",
        };
      },
    }),

    getAdminData: builder.query({
      providesTags: ["admin"],
      query: ({ id }: { id: string }) => {
        return {
          url: `/admin/${id}`,
          method: "GET",
        };
      },
    }),

    getUserData: builder.query({
      providesTags: ["admin"],
      query: ({ id }: { id: string }) => {
        return {
          url: `/admin/${id}`,
          method: "GET",
        };
      },
    }),

    // delete
    deleteUser: builder.mutation({
      invalidatesTags: ["admin"],
      query: (id) => {
        return {
          url: `/admin/${id}`,
          method: "DELETE",
        };
      },
    }),

    // change status
    changeStatusUserById: builder.mutation({
      invalidatesTags: ["admin"],
      query: ({ body, id }) => {
        return {
          url: `/admin/status-change/${id}`,
          method: "PUT",
          body,
        };
      },
    }),

    changePassword: builder.mutation({
      invalidatesTags: ["admin"],
      query: (body) => {
        return {
          url: "/admin/change-password",
          method: "PUT",
          headers: {
            "device-id": deviceId,
          },
          body,
        };
      },
    }),
    updateProfile: builder.mutation({
      invalidatesTags: ["admin"],
      query: (body) => {
        return {
          url: "/admin/profile-update",
          method: "PUT",
          headers: {
            "device-id": deviceId,
          },
          body,
        };
      },
    }),
    getProfile: builder.query({
      providesTags: ["admin"],
      query: () => {
        return {
          url: `/admin/profile`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useAddUserMutation,
  useUpdateUserMutation,
  useGetSingleUserQuery,
  useGetAllUserQuery,
  useDeleteUserMutation,
  useChangeStatusUserByIdMutation,
  useGetAllUserDataQuery,
  useGetUserDataQuery,
  useGetAdminDataQuery,
  useLoginMutation,
  useGoogleLoginMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useGetProfileQuery,
} = UserServiceApi;
