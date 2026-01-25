import React from "react";
import SearchIcon from "../../assets/search-outline.svg?react";
import st from "./index.module.css";
import clsx from "clsx";

export type TSearchInputProps = {
  containerClassName?: string;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export const SearchInput = ({ containerClassName, className, ...props }: TSearchInputProps) => {
  return (
    <label className={clsx(st.container, containerClassName)}>
      <SearchIcon width={16} height={16} />

      <input
        className={clsx("flex-1 outline-none", className)}
        {...props}
      />
    </label>
  );
};
