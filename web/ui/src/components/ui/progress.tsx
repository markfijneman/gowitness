import * as ProgressPrimitive from "@radix-ui/react-progress"
import React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, progress, ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative overflow-hidden bg-accent rounded-full h-2", className)}
        {...props}
        value={progress}
    >
        <ProgressPrimitive.Indicator
            className="bg-primary w-full h-full"
            style={{ transform: `translateX(-${100 - progress}%)` }}
        />
    </ProgressPrimitive.Root>

))

export { Progress }
