import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`block w-full px-3 py-2 border rounded focus:outline-none focus:ring resize-none ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";