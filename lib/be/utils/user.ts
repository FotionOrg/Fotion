import { prisma } from "@/app/pkg/prisma";
import { getCurrentUser } from "../superbase/server";

export async function getDomainUserOrNull() {
    const user = await getCurrentUser()
    if (!user || !user.email) {
        return null
    }
    const domainUser = await prisma.user.findUnique({
        where: {
            email: user.email
        }
    })

    return domainUser
}
