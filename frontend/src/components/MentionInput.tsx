import { useState, useRef, useEffect } from "react";
import { Input, Textarea, makeStyles, tokens, Body1 } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        position: "relative",
        width: "100%",
    },
    suggestions: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        marginTop: tokens.spacingVerticalXXS,
        background: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        boxShadow: tokens.shadow16,
        zIndex: 1000,
        maxHeight: "200px",
        overflowY: "auto",
    },
    suggestionItem: {
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        cursor: "pointer",
        "&:hover, &:focus": {
            background: tokens.colorNeutralBackground1Hover,
        },
    },
});

export interface MentionUser {
    id: number;
    name: string;
}

interface MentionInputProps {
    value: string;
    onChange: (value: string) => void;
    users: MentionUser[];
    placeholder?: string;
    multiline?: boolean;
}

/**
 * Text input with @ mention suggestions. Type '@' followed by a name to
 * see suggestions.
 *
 * Spec ref: F3.23.
 */
export function MentionInput({
    value,
    onChange,
    users,
    placeholder,
    multiline = false,
}: MentionInputProps) {
    const styles = useStyles();
    const [query, setQuery] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionStart, setMentionStart] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    const filtered = users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        const lastAt = value.lastIndexOf("@");
        if (lastAt !== -1 && lastAt === value.length - 1) {
            setMentionStart(lastAt);
            setQuery("");
            setShowSuggestions(true);
        } else if (mentionStart !== null && lastAt === mentionStart) {
            const q = value.slice(mentionStart + 1);
            setQuery(q);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
            setMentionStart(null);
        }
    }, [value, mentionStart]);

    const handleSelect = (user: MentionUser) => {
        if (mentionStart === null) return;
        const before = value.slice(0, mentionStart);
        const after = value.slice(mentionStart + query.length + 1);
        const next = `${before}@${user.name} ${after}`;
        onChange(next);
        setShowSuggestions(false);
        setMentionStart(null);
        setQuery("");
        inputRef.current?.focus();
    };

    const commonProps = {
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange(e.target.value),
        placeholder,
        ref: inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>,
        className: styles.root,
    };

    return (
        <div className={styles.root}>
            {multiline ? (
                <Textarea {...commonProps} ref={inputRef as React.RefObject<HTMLTextAreaElement>} />
            ) : (
                <Input {...commonProps} ref={inputRef as React.RefObject<HTMLInputElement>} />
            )}
            {showSuggestions && filtered.length > 0 && (
                <div className={styles.suggestions}>
                    {filtered.map((user) => (
                        <div
                            key={user.id}
                            className={styles.suggestionItem}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelect(user)}
                            onKeyDown={(e) => e.key === "Enter" && handleSelect(user)}
                        >
                            <Body1>@{user.name}</Body1>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MentionInput;
