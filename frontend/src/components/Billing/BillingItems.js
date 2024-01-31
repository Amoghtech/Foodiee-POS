import React from "react";
import { FaCaretRight } from "react-icons/fa";
import DishBillingCard from "./DishBillingCard";

const BillingItems = ({ dishes }) => {
  dishes = [
    {
      name: "Samosa",
      price: 10,
    },
    {
      name: "Samosa",
      price: 10,
    },
    {
      name: "Samosa",
      price: 10,
    },
    {
      name: "Samosa",
      price: 10,
    },
    {
      name: "Samosa",
      price: 10,
      quantity: 1,
    },
    {
      name: "Samosa",
      price: 10,
    },
    {
      name: "Samosa",
      price: 10,
    },
    {
      name: "Samosa",
      price: 10,
    },
    {
      name: "Samosa",
      price: 10,
    },
    {
      name: "Samosa",
      price: 10,
    },
    {
      name: "Samosa",
      price: 10,
    },
    {
      name: "Samosa",
      price: 10,
    },
  ];
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between text-orange-400">
        <p>Dishes</p>
        <button className="flex items-center justify-between text-secondary-500">
          <p>View All</p>
          <FaCaretRight className="w-6 h-6" />
        </button>
      </div>
      {dishes?.length ? (
        <div className="flex items-center gap-2 flex-wrap">
          {dishes.map((dish, index) => {
            return (
              <DishBillingCard
                key={index}
                id={index}
                price={dish.price}
                quantity={dish.quantity}
                currency={dish.currency}
              />
            );
          })}
        </div>
      ) : (
        <div>
          <p className="text-secondary-200">No Items Found</p>
        </div>
      )}
    </div>
  );
};

export default BillingItems;
