"use client";
export default function Home() {
    return (
        <>
            <main className="flex-1 flex flex-col px-2 items-center justify-center">
                <h1 className="text-5xl font-bold pb-2">
                    Chirpify, Learn English by <span style={{color: "#0EF397"}}>Thinking</span>
                </h1>
                <h2 className="font-medium text-2xl mb-4 pb-4" style={{color: "#7B7B7B"}}>
                    A new way to learn through exploration and active engagement.
                </h2>
                
                <h2 className="font-medium text-2xl mb-4">
                    Try your first lesson for free!
                </h2>
            </main>
        </>
    );
}
