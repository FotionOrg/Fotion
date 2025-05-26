"use client"
import { Select, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { responseSchema } from "@/app/api/notion/search/database/[title]/type"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { SelectContent } from "@/components/ui/select"
import SubmitButton from "@/components/ui/submit-button"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDebouncedCallback } from "use-debounce"
import { z } from "zod"
import { createProject } from "../../actions"
import { formSchema, projectSchema } from "../../type"

export default function FormNotionProject({
    projects,
    notionIntegrationId,
    afterSubmitFn,
}: {
    projects: z.infer<typeof projectSchema>[]
    notionIntegrationId: string
    afterSubmitFn: () => void
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "NOTION",
            notionIntegrationId: notionIntegrationId,
        },
    })


    const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])
    const [searchedDatabases, setSearchedDatabases] = useState<
        { id: string; name: string; properties: { id: string; name: string }[] }[]
    >([])

    function searchDatabases(query: string) {
        const url = "/api/notion/search/database/" + encodeURIComponent(query)
        fetch(url, {
            method: "GET",
        })
            .then(async (res) => {
                const data = await res.json()
                const parsed = responseSchema.parse(data)
                setSearchedDatabases(
                    parsed.filter(
                        (db) =>
                            !projects.some(
                                (p) => p.sourceType === "NOTION" && p.databaseId === db.id,
                            ),
                    ),
                )
            })
            .catch((err) => {
                console.error(err)
            })
    }
    const debouncedDatabaseSearch = useDebouncedCallback((value) => {
        searchDatabases(value)
    }, 500)

    const [selectedDatabase, setSelectedDatabase] = useState<{
        id: string
        name: string
        properties: { id: string; name: string }[]
    } | null>(null)

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
                        name="databaseId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel> Database </FormLabel>
                                <FormControl>
                                    <Command className="w-full" shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Search databases..."
                                            onValueChange={(value) => {
                                                if (value === "") {
                                                    setSearchedDatabases([])
                                                } else {
                                                    debouncedDatabaseSearch(value)
                                                }
                                            }}
                                        />
                                        {selectedDatabase && (
                                            <Card className="bg-primary/10 p-2 rounded-md text-sm relative flex">
                                                {selectedDatabase.name}

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                                    onClick={() => {
                                                        setSelectedDatabase(null)
                                                        form.setValue("databaseId", "")
                                                        form.setValue("name", "")
                                                    }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </Card>
                                        )}
                                        <CommandList className="bg-white border rounded shadow overflow-auto min-h-0 p-0">
                                            {searchedDatabases.length > 0 &&
                                                searchedDatabases
                                                    .filter(
                                                        (db) => db.id !== selectedDatabase?.id,
                                                    )
                                                    .map((database) => (
                                                        <CommandItem
                                                            key={database.id}
                                                            value={database.name}
                                                            onSelect={() => {
                                                                field.onChange(database.id)
                                                                form.setValue("name", database.name)
                                                                setSelectedDatabase(database)
                                                                setSearchedDatabases([])
                                                            }}
                                                            className="hover:bg-primary/10"
                                                        >
                                                            {database.name}
                                                        </CommandItem>
                                                    ))}
                                        </CommandList>
                                    </Command>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {selectedDatabase && (
                        <div className="flex flex-col gap-2">
                            <FormField
                                control={form.control}
                                name="estimatedMinutesPropertyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Estimated Duration(in minutes) Property
                                        </FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => {
                                                    // 같은 값을 다시 선택하면 선택 해제
                                                    if (value === field.value) {
                                                        field.onChange("")
                                                        setSelectedPropertyIds(
                                                            selectedPropertyIds.filter(
                                                                (id) => id !== value,
                                                            ),
                                                        )
                                                    } else {
                                                        field.onChange(value)
                                                        setSelectedPropertyIds([
                                                            ...selectedPropertyIds.filter(
                                                                (id) => id !== field.value,
                                                            ),
                                                            value,
                                                        ])
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Property" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selectedDatabase?.properties.map(
                                                        (property) => (
                                                            <SelectItem
                                                                key={property.id}
                                                                value={property.id}
                                                                disabled={selectedPropertyIds.includes(
                                                                    property.id,
                                                                )}
                                                            >
                                                                {property.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="focusedMinutesPropertyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Spent Minutes Property</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => {
                                                    // 같은 값을 다시 선택하면 선택 해제
                                                    if (value === field.value) {
                                                        field.onChange("")
                                                        setSelectedPropertyIds(
                                                            selectedPropertyIds.filter(
                                                                (id) => id !== value,
                                                            ),
                                                        )
                                                    } else {
                                                        field.onChange(value)
                                                        setSelectedPropertyIds([
                                                            ...selectedPropertyIds.filter(
                                                                (id) => id !== field.value,
                                                            ),
                                                            value,
                                                        ])
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Property" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selectedDatabase?.properties.map(
                                                        (property) => (
                                                            <SelectItem
                                                                key={property.id}
                                                                value={property.id}
                                                                disabled={selectedPropertyIds.includes(
                                                                    property.id,
                                                                )}
                                                            >
                                                                {property.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="titlePropertyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel> Title Property </FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => {
                                                    // 같은 값을 다시 선택하면 선택 해제
                                                    if (value === field.value) {
                                                        field.onChange("")
                                                        setSelectedPropertyIds(
                                                            selectedPropertyIds.filter(
                                                                (id) => id !== value,
                                                            ),
                                                        )
                                                    } else {
                                                        field.onChange(value)
                                                        setSelectedPropertyIds([
                                                            ...selectedPropertyIds.filter(
                                                                (id) => id !== field.value,
                                                            ),
                                                            value,
                                                        ])
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Property" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selectedDatabase?.properties.map(
                                                        (property) => (
                                                            <SelectItem
                                                                key={property.id}
                                                                value={property.id}
                                                                disabled={selectedPropertyIds.includes(
                                                                    property.id,
                                                                )}
                                                            >
                                                                {property.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}


                    <SubmitButton type="submit" className="w-full mt-4" isSubmitting={form.formState.isSubmitting}>
                        Create
                    </SubmitButton>
                </form>
            </Form>

        </div>
    )
}