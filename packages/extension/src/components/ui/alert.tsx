import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-md border px-3 py-2.5 text-sm [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-3 [&>svg~*]:pl-6',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        info: 'border-l-[3px] border-l-primary border-y-0 border-r-0 rounded-l-none bg-accent text-accent-foreground [&>svg]:text-primary',
        warning: 'border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-500',
        destructive: 'border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = 'Alert'

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  )
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription }
