import { useEffect } from "react";
import { toast } from 'sonner';

const useFeedback = (successMessage: string | null, errorMessage: string | null) => {
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
        }
        if (errorMessage) {
            toast.error(errorMessage);
        }
    }, [successMessage, errorMessage]);
};

export default useFeedback;
