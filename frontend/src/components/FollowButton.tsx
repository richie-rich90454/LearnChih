import { Button } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { useFollow } from "../hooks/useSocial";

interface FollowButtonProps {
    userId: number;
}

export function FollowButton({ userId }: FollowButtonProps) {
    const { t } = useTranslation();
    const { data, toggle, isPending, isLoading } = useFollow(userId);

    if (isLoading) {
        return (
            <Button appearance="subtle" disabled>
                {t("follow.loading")}
            </Button>
        );
    }

    const following = data?.following ?? false;

    return (
        <Button
            appearance={following ? "outline" : "primary"}
            onClick={() => toggle()}
            disabled={isPending}
            aria-pressed={following}
        >
            {following ? t("follow.following") : t("follow.follow")}
        </Button>
    );
}
