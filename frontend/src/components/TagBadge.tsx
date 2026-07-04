import { Badge, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        cursor: "pointer",
    },
    list: {
        display: "flex",
        gap: tokens.spacingHorizontalXS,
        flexWrap: "wrap",
        marginTop: tokens.spacingVerticalXS,
    },
});

export interface Tag {
    id: number;
    name: string;
    color?: string;
}

interface TagBadgeProps {
    tag: Tag;
    onClick?: (tag: Tag) => void;
}

export function TagBadge({ tag, onClick }: TagBadgeProps) {
    const styles = useStyles();
    return (
        <Badge
            className={styles.root}
            appearance="outline"
            size="small"
            style={{ backgroundColor: tag.color }}
            onClick={() => onClick?.(tag)}
        >
            {tag.name}
        </Badge>
    );
}

interface TagListProps {
    tags: Tag[];
    onTagClick?: (tag: Tag) => void;
}

export function TagList({ tags, onTagClick }: TagListProps) {
    const styles = useStyles();
    if (!tags.length) return null;
    return (
        <div className={styles.list}>
            {tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} onClick={onTagClick} />
            ))}
        </div>
    );
}

export default TagBadge;
