import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AddNewNotionIntegrationDialog() {
    
    

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Add New Project</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Add a new project to your account.
                </DialogDescription>

            </DialogContent>
        </Dialog>
    )
}

