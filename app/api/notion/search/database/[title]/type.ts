import { z } from "zod";

export const responseSchema = z.array(z.object({
    id: z.string(),
    name: z.string(),
    properties: z.array(z.object({
        name: z.string(),
        id: z.string(),
    })),
}))