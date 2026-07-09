import { useTranslation } from "react-i18next";
import { Button as FluentButton } from "@fluentui/react-components";
import { PersonAdd24Regular } from "@fluentui/react-icons";
import {
    useFriends,
    useSentRequests,
    useIncomingRequests,
    useSendFriendRequest,
    useAcceptFriendRequest,
} from "@/hooks/useFriends";

interface AddFriendButtonProps {
    userId: number;
}

/**
 * Add-friend / friendship-status button (F38). Shown on other users'
 * profiles. Reflects the current friendship state: add, pending (sent),
 * incoming (accept), or already friends.
 */
export function AddFriendButton({ userId }: AddFriendButtonProps) {
    const { t } = useTranslation();
    const friendsQuery = useFriends();
    const sentQuery = useSentRequests();
    const incomingQuery = useIncomingRequests();
    const sendRequest = useSendFriendRequest();
    const accept = useAcceptFriendRequest();

    const isFriend = friendsQuery.data?.some((f) => f.userId === userId);
    const sentRequest = sentQuery.data?.find((f) => f.userId === userId);
    const incomingRequest = incomingQuery.data?.find((f) => f.userId === userId);

    if (isFriend) {
        return (
            <FluentButton appearance="outline" disabled>
                {t("friends.friends")}
            </FluentButton>
        );
    }

    if (sentRequest) {
        return (
            <FluentButton appearance="outline" disabled>
                {t("friends.pending")}
            </FluentButton>
        );
    }

    if (incomingRequest) {
        return (
            <FluentButton
                appearance="primary"
                icon={<PersonAdd24Regular />}
                onClick={() => accept.mutate(incomingRequest.id)}
                disabled={accept.isPending}
            >
                {t("friends.accept")}
            </FluentButton>
        );
    }

    return (
        <FluentButton
            appearance="primary"
            icon={<PersonAdd24Regular />}
            onClick={() => sendRequest.mutate(userId)}
            disabled={sendRequest.isPending}
        >
            {t("friends.addFriend")}
        </FluentButton>
    );
}

export default AddFriendButton;
