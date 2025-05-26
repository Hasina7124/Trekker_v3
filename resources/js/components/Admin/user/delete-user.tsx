import { useForm } from "@inertiajs/react";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import InputError from "../../input-error";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import HeadingSmall from "../../heading-small";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Alert } from "../../ui/alert";

interface DeleteUsersButtonProps {
    userIds: (string | number) [];
}

type DeleteForm = {
    userIds: (string | number) [];
    password: string;
}

export default function DeleteUser({userIds}: DeleteUsersButtonProps) {
    // Modal visibility
    const [open, setOpen] = useState(false);

    // Success message
    const [successMessage, setSuccessMessage] = useState("");

    // Reference the password input
    const passwordInput = useRef<HTMLInputElement>(null);

    // Manage form
    const { data, setData, delete : destroy, processing, reset, errors, clearErrors, recentlySuccessful } = useForm<Required<DeleteForm>>({
        userIds: [],
        password:"",
    });

    // Update userIds when props change
    useEffect(() => {
        setData("userIds", userIds);
    }, [userIds]);

    // Send the request
    const deleteUser : FormEventHandler = (e) => {
        // Pour ne pas raffraichir la page
        e.preventDefault();
        destroy(route('admin.user.delete'), {
            // Keep scrolling
            preserveScroll:true,
            onSuccess: () => {
                setSuccessMessage("User(s) deleted successfully");
                setOpen(false);
                closeModal();
            },
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    // Close Modal
    const closeModal = () => {
        clearErrors();
        reset();
    }

    return(
    <>
        {recentlySuccessful && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
                {successMessage}
            </div>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    disabled={!userIds || userIds.length === 0}
                >
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Are you sure to delete user(s)</DialogTitle>
                <DialogDescription>
                    This action cannot be reversed.
                </DialogDescription>
                <form onSubmit={deleteUser} className="gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password" className="sr-only">
                            Password
                        </Label>

                        <Input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            autoComplete="current-password"
                        />

                        <InputError message={errors.password} />
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={closeModal}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button variant="destructive" disabled={processing} asChild>
                            <button type="submit">Delete</button>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>
    )
}
