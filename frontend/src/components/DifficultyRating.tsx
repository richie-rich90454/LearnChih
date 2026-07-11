import { useTranslation } from "react-i18next";
import { Star24Regular, Star24Filled } from "@fluentui/react-icons";
import { useDifficultyRatingStore } from "@/store/difficultyRatingStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./DifficultyRating.module.css";

export interface DifficultyRatingProps {
    resourceId: number;
}

/**
 * 5-star difficulty self-rating widget for a resource (F22). Clicking a star
 * sets the rating for that resource; the filled stars reflect the saved value.
 * Shows a "You rated: X/5" caption once rated.
 *
 * Spec ref: F22.
 */
export function DifficultyRating({ resourceId }: DifficultyRatingProps) {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const rating = useDifficultyRatingStore((s) => s.getRating(resourceId));
    const setRating = useDifficultyRatingStore((s) => s.setRating);

    const handleClick = (value: number) => {
        setRating(resourceId, value);
    };

    const stars = [1, 2, 3, 4, 5];

    return (
        <div className={styles.container}>
            <p className={styles.label}>
                {t("difficultyRating.title", "Rate the difficulty")}
            </p>
            <div
                className={reduced ? styles.starsStatic : styles.stars}
                role="radiogroup"
                aria-label={t("difficultyRating.ariaLabel", "Difficulty rating")}
            >
                {stars.map((value) => {
                    const filled = value <= rating;
                    return (
                        <button
                            key={value}
                            type="button"
                            className={styles.starButton}
                            onClick={() => handleClick(value)}
                            aria-checked={rating === value}
                            aria-label={t("difficultyRating.starAria", {
                                defaultValue: "{{value}} out of 5",
                                value,
                            })}
                            role="radio"
                        >
                            {filled ? (
                                <Star24Filled className={styles.starFilled} />
                            ) : (
                                <Star24Regular className={styles.starEmpty} />
                            )}
                        </button>
                    );
                })}
            </div>
            {rating > 0 && (
                <p className={styles.rated}>
                    {t("difficultyRating.youRated", {
                        defaultValue: "You rated: {{rating}}/5",
                        rating,
                    })}
                </p>
            )}
        </div>
    );
}

export default DifficultyRating;
