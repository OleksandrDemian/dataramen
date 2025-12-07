import toast from "react-hot-toast";

export const copyText = (text: string, showConfirmation: boolean = true) => {
  const copyPromise = navigator.clipboard.writeText(text);
  if(showConfirmation) {
    copyPromise.then(() => {
      toast.success(`Copied "${text}"`);
    });
  }
};
