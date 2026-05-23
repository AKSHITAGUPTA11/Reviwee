import React from "react";

export const handleValidNumber2 = (event: React.ChangeEvent<HTMLInputElement>): boolean => {
  const PinRegExp = /^[0-9]*$/;
  return PinRegExp.test(event.target.value);
};

export const handleValidDecimalNumber = (event: React.ChangeEvent<HTMLInputElement>): boolean => {
  const DecimalRegExp = /^\d*\.?\d*$/;
  return DecimalRegExp.test(event.target.value);
};
