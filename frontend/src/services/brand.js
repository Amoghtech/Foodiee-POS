import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const brandApi = createApi({
    reducerPath: "brandApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.REACT_APP_BACKEND_URL + "/api/brands",
        prepareHeaders: function(headers, {getState}){
            const token = localStorage.getItem("token");
            if (token) {
              headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    endpoints: (builder) => ({
        //get all brands 
        getAllBrands: builder.query({
            query: (tenantId) => '/getAllBrands/' + tenantId,
        }),
        //get all brands 
        getBrand: builder.query({
            query: (brandId) => '/getBrand/' + brandId,
        }),
        //create Brand
        createBrand: builder.mutation({
            query: (data) => ({
                url: "createBrand",
                method: "POST",
                body: data,
            }),
        }),
        //update brand
        updateBrand: builder.mutation({
            query: (data) => ({
                url: "updateBrand",
                method: "PATCH",
                body: data,
            }),
        }),
        //delete brand
        deleteBrand: builder.mutation({
            query: (data) => ({
                url: "deleteBrand",
                method: "DELETE",
                body: data,
            }),
        })
    })
})

export const {useGetAllBrandsQuery, useCreateBrandMutation} = brandApi