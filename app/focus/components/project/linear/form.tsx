"use client"

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import SubmitButton from "@/components/ui/submit-button"
import useCreateProjectHandler from "@/hooks/focus/use-create-project-handler"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { formSchema, projectSchema } from "../../../type"

export default function FormLinearProject({
  linearIntegrationId,
  afterSubmitFn,
}: {
  projects: z.infer<typeof projectSchema>[]
  linearIntegrationId: string
  afterSubmitFn: () => void
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "LINEAR",
      linearIntegrationId: linearIntegrationId,
      name: "",
    },
  })

  const onValidate = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      console.error(errors)
    }
  }

  const handleSubmit = useCreateProjectHandler(afterSubmitFn)

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit, onValidate)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Project Name </FormLabel>
                <FormControl>
                  <Input {...field} />
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
