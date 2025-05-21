import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import SubmitButton from "@/components/ui/submit-button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createProject } from "../../actions"
import { formSchema } from "../../type"

export default function FormCreateScratchProject({
    afterSubmitFn,
}: {
    afterSubmitFn: () => void
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "scratch",
            name: "",
        },
    })

    const onValidate = (errors: any) => {
        if (Object.keys(errors).length > 0) {
            console.error(errors)
        }
    }

    async function handleSubmit(data: z.infer<typeof formSchema>) {
        const project = await createProject(data)
        if (project) {
            afterSubmitFn()
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit, onValidate)}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel> Name </FormLabel>
                                <FormControl>
                                    <Input placeholder="Project Name" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <SubmitButton type="submit" className="w-full mt-4" isSubmitting={form.formState.isSubmitting}>
                        Create
                    </SubmitButton>
                </form>
            </Form>
        </div>
    )
}