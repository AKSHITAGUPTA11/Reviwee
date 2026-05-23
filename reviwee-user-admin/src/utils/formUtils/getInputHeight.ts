export type Size = "small" | "medium" | "large" | number;

export const getInputHeight = (size: Size, inNumber?: boolean) => {
  if (typeof size === "number") {
    return inNumber ? size : `h-[${size}px]`;
  } else {
    switch (size) {
      case "small":
        return inNumber ? 42 : "h-[42px]";

      case "medium":
        return inNumber ? 45 : "h-[45px]";

      case "large":
        return inNumber ? 55 : "h-[55px]";

      default:
        return inNumber ? 42 : "h-[42px]";
    }
  }
};
