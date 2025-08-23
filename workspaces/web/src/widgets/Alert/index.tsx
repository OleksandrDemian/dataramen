import {HTMLAttributes} from "react";
import st from "./index.module.css";
import clsx from "clsx";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'info' | 'danger' | 'success' | 'warning' | 'dark';
  noRounded?: boolean;
};

export const Alert = ({ variant, noRounded, className, children, ...props }: AlertProps) => {
  return (
    <div className={clsx(
      st.alert,
      !noRounded && "rounded-lg",
      (variant === 'info' || !variant) && st.info,
      variant === 'danger' && st.danger,
      variant === 'dark' && st.dark,
      variant === 'warning' && st.warning,
      variant === 'success' && st.success,
      className,
    )} role="alert" {...props}>
      {children}
    </div>
  );
};
