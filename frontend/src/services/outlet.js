import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const outletApi = createApi({
  reducerPath: "outletApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL + "/api/outlets",
    prepareHeaders: function (headers, { getState }) {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    //get all outlets
    getAllOutlets: builder.query({
      query: (query) => {
        const params = new URLSearchParams();
        Object.keys(query).forEach((key) => {
          params.append(key, query[key]);
        });
        return `/getOutlets?${params}`;
      },
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.outlets.map(({ _id }) => ({ type: "Outlet", id: _id })),
              "Outlet",
            ]
          : ["Outlet"],
    }),
    //get outlet
    getOutlet: builder.query({
      query: (outletId) => "/getOutlet/" + outletId,
      providesTags: (result, error, arg) => [{ type: "Outlet", id: arg._id }],
    }),
    //create Outlet
    createOutlet: builder.mutation({
      query: (data) => ({
        url: "createOutlet",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Outlet"],
    }),
    //update brand
    updateOutlet: builder.mutation({
      query: (data) => ({
        url: "updateOutlet",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Outlet", id: arg.entityId },
      ],
    }),
    //delete brand
    deleteOutlet: builder.mutation({
      query: (data) => ({
        url: "deleteOutlet",
        method: "DELETE",
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateOutletMutation,
  useDeleteOutletMutation,
  useGetAllOutletsQuery,
  useGetOutletQuery,
  useUpdateOutletMutation,
  useLazyGetAllOutletsQuery,
  useLazyGetOutletQuery,
} = outletApi;
