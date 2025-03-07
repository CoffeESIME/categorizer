import type React from "react";
import NextLink from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/utils";

const linkVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-primary hover:underline underline-offset-4",
        button:
          "bg-primary text-primary-foreground hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-[0px] active:translate-x-[0px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-[0px] active:translate-x-[0px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        outline:
          "border-2 border-input bg-background hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-[0px] active:translate-x-[0px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-[0px] active:translate-x-[0px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href: string;
}

const ButtonLink = ({
  className,
  variant,
  size,
  href,
  children,
  ...props
}: LinkProps) => {
  return (
    <NextLink
      href={href}
      className={cn(linkVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </NextLink>
  );
};

export { ButtonLink, linkVariants };
