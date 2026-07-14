import { useEffect, useState } from "react";
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import dialogStyles from "./ui/Dialog.module.css";
import styles from "./KeyboardCheatsheet.module.css";

interface ShortcutItem {
    keys: string;
    descriptionKey: string;
}

interface ShortcutCategory {
    titleKey: string;
    items: ShortcutItem[];
}

const SHORTCUTS: ShortcutCategory[] = [
    {
        titleKey: "cheatsheet.categories.help",
        items: [
            {
                keys: "?",
                descriptionKey: "cheatsheet.items.toggleCheatsheet",
            },
            {
                keys: "Esc",
                descriptionKey: "cheatsheet.items.close",
            },
        ],
    },
    {
        titleKey: "cheatsheet.categories.commands",
        items: [
            {
                keys: "Cmd/Ctrl+K",
                descriptionKey: "cheatsheet.items.commandPalette",
            },
            {
                keys: "/",
                descriptionKey: "cheatsheet.items.focusSearch",
            },
        ],
    },
    {
        titleKey: "cheatsheet.categories.navigation",
        items: [
            {
                keys: "g h",
                descriptionKey: "cheatsheet.items.goHome",
            },
            {
                keys: "g r",
                descriptionKey: "cheatsheet.items.goResources",
            },
            {
                keys: "g c",
                descriptionKey: "cheatsheet.items.goChannels",
            },
        ],
    },
    {
        titleKey: "cheatsheet.categories.actions",
        items: [
            {
                keys: "b",
                descriptionKey: "cheatsheet.items.bookmark",
            },
        ],
    },
];

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (INPUT_TAGS.has(target.tagName)) return true;
    if (target.isContentEditable) return true;
    return false;
}

/**
 * Keyboard-shortcut cheatsheet overlay (F61). Opens on `?` (Shift+/) when
 * the user is not typing in an input/textarea/contenteditable and no
 * non-Shift modifier is held. Renders as a Fluent modal Dialog so focus
 * trap, portal, and Esc-to-close are handled by Fluent.
 */
export function KeyboardCheatsheet() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            // Toggle cheatsheet on `?` (Shift+/). Ignore when typing in an
            // input/textarea/contenteditable, and when any modifier other
            // than Shift is held (so Cmd+? / Ctrl+? browser shortcuts pass
            // through unchanged).
            if (
                e.key === "?" &&
                !e.metaKey &&
                !e.ctrlKey &&
                !e.altKey
            ) {
                if (isTypingTarget(e.target)) return;
                e.preventDefault();
                setOpen((prev) => !prev);
                return;
            }
            if (e.key === "Escape" && open) {
                setOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    return (
        <Dialog
            open={open}
            onOpenChange={(_e, data) => setOpen(data.open)}
            modalType="modal"
        >
            <DialogSurface
                className={dialogStyles.surface}
                aria-label={t("cheatsheet.title")}
            >
                <DialogBody className={dialogStyles.body}>
                    <DialogTitle className={dialogStyles.title}>
                        {t("cheatsheet.title")}
                    </DialogTitle>
                    <DialogContent className={styles.content}>
                        <div className={styles.grid}>
                            {SHORTCUTS.map((category) => (
                                <section
                                    key={category.titleKey}
                                    className={styles.category}
                                    aria-label={t(category.titleKey)}
                                >
                                    <h3 className={styles.categoryTitle}>
                                        {t(category.titleKey)}
                                    </h3>
                                    <ul className={styles.list}>
                                        {category.items.map((item) => (
                                            <li
                                                key={item.keys}
                                                className={styles.row}
                                            >
                                                <span className={styles.description}>
                                                    {t(item.descriptionKey)}
                                                </span>
                                                <kbd className={styles.kbd}>
                                                    {item.keys}
                                                </kbd>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default KeyboardCheatsheet;
