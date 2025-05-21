"use server";
import {DropdownMenuItem} from "@radix-ui/react-dropdown-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {createClient} from "@/lib/be/superbase/server";
import {signOutAction} from "@/lib/be/superbase/sign-out";
import Link from "next/link";

export async function UserProfile() {
    const supabase = await createClient();
    const user = await supabase.auth.getUser().then((user) => user.data.user);
    
    if (!user) {
        return null
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="size-8">
                    <AvatarImage src={user.user_metadata.avatar_url} className="hover:cursor-pointer"/>
                    <AvatarFallback>{user.user_metadata.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="bottom"
                align="start"
                sideOffset={3}
                alignOffset={10}
            >
                <DropdownMenuItem className="pl-2 pt-1 pb-1">
                    <Link href="/profile" className="hover:cursor-pointer">
                        👬 Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem className="pl-2 pt-1 pb-1 hover:cursor-pointer" onClick={signOutAction}>
                    🔓 Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
