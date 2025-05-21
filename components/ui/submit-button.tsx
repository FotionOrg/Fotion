import { Loader2 } from "lucide-react"
import { Button } from "./button"

export default function SubmitButton({
    children,
    isSubmitting,
    className,
    loaderClassName,
    type = "submit",
}: {
    children: React.ReactNode
    isSubmitting: boolean
    className?: string
    loaderClassName?: string
    type?: "submit" | "button"
}) {
    return <Button type={type} className={className} disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className={loaderClassName ?? "w-4 h-4 animate-spin"} /> : children}
    </Button>
}