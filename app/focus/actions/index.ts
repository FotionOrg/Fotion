'use server'
import { getDomainUserOrNull } from "@/lib/be/utils/user";
import { z } from "zod";
import { prisma } from "../../pkg/prisma";
import { formSchema, projectSchema } from "../type";



export async function createProject(data: z.infer<typeof formSchema>) {
    const user = await getDomainUserOrNull()
    if (!user) {
        return {
            error: "User not found"
        }
    }

    const project = await prisma.project.create({
        data: {
            name: data.name,
            sourceType: data.type,
            userId: user.id,
            notionDatabaseId: data.type === "NOTION" ? data.databaseId : undefined,
            notionIntegrationId: data.type === "NOTION" ? data.notionIntegrationId : undefined,
            notionPropertyConfig: data.type === "NOTION" ? {
                titlePropertyId: data.titlePropertyId,
                estimatedMinutesPropertyId: data.estimatedMinutesPropertyId,
                focusedMinutesPropertyId: data.focusedMinutesPropertyId,
            } : undefined,
            linearIntegrationId: data.type === "LINEAR" ? data.linearIntegrationId : undefined,
        }
    })

    return project
}



export async function getProjects(userId: string): Promise<z.infer<typeof projectSchema>[]> {
    const projects = await prisma.project.findMany({
        where: {
            userId: userId,
        }
    })

    return projects.map((project) => {
        if (project.sourceType === "NOTION") {
            return {
                id: project.id,
                name: project.name,
                sourceType: "NOTION",
                databaseId: project.notionDatabaseId!,
            };
        } else if (project.sourceType === "LINEAR") {
            return {
                id: project.id,
                name: project.name,
                sourceType: "LINEAR",
            };
        } else {
            return {
                id: project.id,
                name: project.name,
                sourceType: "SCRATCH",
            };
        }
    });
}

export async function getNotionIntegration(userId: string) {
    const notionIntegration = await prisma.notionIntegartion.findUnique({
        where: {
            userId: userId,
        }
    })

    return notionIntegration
}

export async function getLinearIntegration(userId: string) {
    const linearIntegration = await prisma.linearIntegration.findUnique({
        where: {
            userId: userId,
        }
    })

    return linearIntegration
}