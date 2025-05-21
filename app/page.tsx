"use client"

import AddNewProjectDialog from "./(project)/add-new-project"

export default function Home() {
  return (
    <>
      <main className="flex-1 flex flex-col px-2 items-center justify-center">
        <h1 className="text-5xl font-bold pb-2">Keep Focus With Fotion</h1>
        <AddNewProjectDialog />
      </main>
    </>
  )
}
