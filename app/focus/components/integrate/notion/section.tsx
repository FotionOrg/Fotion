"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"

export default function SectionIntegrateNotion({
  setNotionIntegration,
}: {
  setNotionIntegration: (notionIntegration: string) => void
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">Notion과 연동하려면 먼저 인증이 필요합니다</p>
      <Button
        onClick={() => {
          const width = 500
          const height = 600
          const left = window.screenX + (window.outerWidth - width) / 2
          const top = window.screenY + (window.outerHeight - height) / 2

          const popup = window.open(
            `/api/notion/auth`,
            "Notion Integration",
            `width=${width},height=${height},left=${left},top=${top}`,
          )

          // 팝업 창으로부터 메시지 수신
          window.addEventListener("message", (event) => {
            // 보안을 위해 origin 체크
            if (event.origin !== window.location.origin) return

            if (event.data.type === "NOTION_INTEGRATION_COMPLETE") {
              // notionIntegrationId 업데이트
              const { notionIntegrationId } = event.data
              setNotionIntegration(notionIntegrationId)
              toast.success("Notion 연동이 완료되었습니다")
              // 팝업 창 닫기
              popup?.close()
            }
          })
        }}
        className="flex items-center gap-2"
      >
        <div className="relative w-4 h-4">
          <Image src={"/images/notion.png"} fill alt="Notion Logo" className="object-contain" />
        </div>
        Notion 연동하기
      </Button>
    </div>
  )
}
