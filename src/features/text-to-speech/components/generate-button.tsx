"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function GenerateButton({
  size,
  disabled,
  isSubmitting,
  className,
}: {
  size?: "default" | "sm";
  disabled: boolean;
  isSubmitting: boolean;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      size={size}
      className={className}
      disabled={disabled}
    >
      {isSubmitting ? (
        <>
          <Spinner className="size-3" />
          Generating...
        </>
      ): (
        "Generate speech"
      )}
    </Button>
  );
};
