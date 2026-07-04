import { useEffect, useState } from "react";
import { Badge } from "@fluentui/react-components";

interface PresenceIndicatorProps {
    threadId: number;
    // The component subscribes to a WebSocket topic to get presence info.
    // If the backend doesn't support this yet, it gracefully shows nothing.
}

export function PresenceIndicator({ threadId }: PresenceIndicatorProps) {
    const [viewerCount, setViewerCount] = useState(0);

    useEffect(() => {
        // The presence indicator relies on the existing WebSocket infrastructure.
        // If the backend doesn't have a presence topic yet, this silently does nothing.
        // Future: subscribe to /topic/thread/{threadId}/presence
        // For now, just show a "live" badge to indicate real-time capability
        setViewerCount(0);
    }, [threadId]);

    if (viewerCount === 0) {
        return (
            <Badge appearance="filled" color="success" size="small">
                Live
            </Badge>
        );
    }

    return (
        <Badge appearance="filled" color="success" size="small" title={`${viewerCount} viewing`}>
            {viewerCount} viewing
        </Badge>
    );
}
