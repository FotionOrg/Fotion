"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"

export default function SectionIntegrateLinear({
    setLinearIntegration,
}: {
    setLinearIntegration: (linearIntegration: string) => void
}) {
    return (
        <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
                To integrate Linear, you need to authenticate first.
            </p>
            <Button
                onClick={() => {
                    const width = 500
                    const height = 600
                    const left =
                        window.screenX + (window.outerWidth - width) / 2
                    const top =
                        window.screenY + (window.outerHeight - height) / 2

                    const popup = window.open(
                        `/api/linear/auth`,
                        "Linear Integration",
                        `width=${width},height=${height},left=${left},top=${top}`,
                    )

                    window.addEventListener("message", (event) => {
                        if (event.origin !== window.location.origin) return

                        if (event.data.type === "LINEAR_INTEGRATION_COMPLETE") {
                            const { linearIntegrationId } = event.data
                            setLinearIntegration(linearIntegrationId)
                            toast.success("Complete Linear Integration")
                            // 팝업 창 닫기
                            popup?.close()
                        }
                    })
                }}
                className="flex items-center gap-2"
            >
                <div className="relative w-4 h-4">
                    <Image
                        src={"/images/linear.png"}
                        fill
                        alt="Linear Logo"
                        className="object-contain"
                    />
                </div>
                Integrate Linear
            </Button>
        </div>
    )
}
