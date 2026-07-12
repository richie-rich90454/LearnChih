import { useState } from "react";
import { Tab, TabList, TabValue } from "@fluentui/react-components";
import {
    Send24Regular,
    Delete24Regular,
    Link24Regular,
    CalendarClock24Regular,
    ArrowCounterclockwise24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useWebhookCatalogStore } from "@/store/webhookCatalogStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import styles from "./WebhookCatalog.module.css";

export default function WebhookCatalog() {
    const { t } = useTranslation();
    const events = useWebhookCatalogStore((s) => s.events);
    const subscriptions = useWebhookCatalogStore((s) => s.subscriptions);
    const deliveries = useWebhookCatalogStore((s) => s.deliveries);
    const addSubscription = useWebhookCatalogStore((s) => s.addSubscription);
    const removeSubscription = useWebhookCatalogStore((s) => s.removeSubscription);
    const testFire = useWebhookCatalogStore((s) => s.testFire);
    const retryDelivery = useWebhookCatalogStore((s) => s.retryDelivery);

    const [url, setUrl] = useState("");
    const [eventId, setEventId] = useState(events[0]?.id ?? "");
    const [tab, setTab] = useState<TabValue>("catalog");

    const handleAdd = () => {
        if (!url.trim() || !eventId) return;
        addSubscription(url.trim(), eventId);
        setUrl("");
    };

    const eventName = (id: string) => events.find((e) => e.id === id)?.name ?? id;

    return (
        <div className={styles.page}>
            <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value)}>
                <Tab id="catalog" value="catalog">
                    {t("webhookCatalog.catalogTab", "Catalog")}
                </Tab>
                <Tab id="deliveries" value="deliveries">
                    {t("webhookCatalog.deliveriesTab", "Delivery logs")}
                </Tab>
            </TabList>

            {tab === "catalog" && (
                <div className={styles.grid}>
                    <Card padding="md" className={styles.column}>
                        <h2 className={styles.columnTitle}>
                            {t("webhookCatalog.eventsHeading", "Event catalog")}
                        </h2>
                        <ul className={styles.eventList}>
                            {events.map((event) => (
                                <li key={event.id}>
                                    <Card padding="sm" className={styles.eventCard}>
                                        <div className={styles.eventHead}>
                                            <code className={styles.eventName}>
                                                {event.name}
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="small"
                                                icon={<Send24Regular />}
                                                onClick={() => testFire(event.id)}
                                            >
                                                {t("webhookCatalog.testFire", "Test fire")}
                                            </Button>
                                        </div>
                                        <p className={styles.eventDesc}>
                                            {event.description}
                                        </p>
                                        <div className={styles.schemaBox}>
                                            <span className={styles.schemaLabel}>
                                                {t("webhookCatalog.payloadSchema", "Payload schema")}
                                            </span>
                                            <pre className={styles.schemaPre}>
                                                {JSON.stringify(event.payloadSchema, null, 2)}
                                            </pre>
                                        </div>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card padding="md" className={styles.column}>
                        <h2 className={styles.columnTitle}>
                            {t("webhookCatalog.subscriptionsHeading", "Subscriptions")}
                        </h2>
                        <div className={styles.addForm}>
                            <Input
                                label={t("webhookCatalog.urlLabel", "Endpoint URL")}
                                placeholder={t("webhookCatalog.urlPlaceholder", "https://example.com/webhooks")}
                                value={url}
                                onChange={(_, d) => setUrl(d.value)}
                            />
                            <div className={styles.eventPicker}>
                                <span className={styles.pickerLabel}>
                                    {t("webhookCatalog.eventLabel", "Event")}
                                </span>
                                <select
                                    className={styles.select}
                                    value={eventId}
                                    onChange={(e) => setEventId(e.target.value)}
                                >
                                    {events.map((event) => (
                                        <option key={event.id} value={event.id}>
                                            {event.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                variant="primary"
                                icon={<Link24Regular />}
                                onClick={handleAdd}
                                disabled={!url.trim() || !eventId}
                            >
                                {t("webhookCatalog.addSubscription", "Add subscription")}
                            </Button>
                        </div>

                        {subscriptions.length === 0 ? (
                            <p className={styles.empty}>
                                {t("webhookCatalog.noSubscriptions", "No subscriptions yet.")}
                            </p>
                        ) : (
                            <ul className={styles.subList}>
                                {subscriptions.map((sub) => (
                                    <li key={sub.id} className={styles.subItem}>
                                        <div className={styles.subMeta}>
                                            <code className={styles.subUrl}>{sub.url}</code>
                                            <Badge variant={sub.active ? "success" : "neutral"} size="small">
                                                {sub.active
                                                    ? t("webhookCatalog.active", "Active")
                                                    : t("webhookCatalog.inactive", "Inactive")}
                                            </Badge>
                                            <span className={styles.subEvent}>
                                                {eventName(sub.eventId)}
                                            </span>
                                        </div>
                                        <div className={styles.subActions}>
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                icon={<Send24Regular />}
                                                onClick={() => testFire(sub.eventId)}
                                            >
                                                {t("webhookCatalog.testFire", "Test fire")}
                                            </Button>
                                            <Button
                                                variant="subtle"
                                                size="small"
                                                icon={<Delete24Regular />}
                                                onClick={() => removeSubscription(sub.id)}
                                            >
                                                {t("webhookCatalog.remove", "Remove")}
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            )}

            {tab === "deliveries" && (
                <Card padding="md" className={styles.column}>
                    <h2 className={styles.columnTitle}>
                        {t("webhookCatalog.deliveriesTab", "Delivery logs")}
                    </h2>
                    {deliveries.length === 0 ? (
                        <p className={styles.empty}>
                            {t("webhookCatalog.noSubscriptions", "No deliveries yet.")}
                        </p>
                    ) : (
                        <ul className={styles.deliveryList}>
                            {deliveries.map((delivery) => (
                                <li key={delivery.id} className={styles.deliveryItem}>
                                    <CalendarClock24Regular className={styles.deliveryIcon} />
                                    <div className={styles.deliveryMeta}>
                                        <span className={styles.deliveryEvent}>
                                            {eventName(delivery.eventId)}
                                        </span>
                                        <span className={styles.deliveryTime}>
                                            {new Date(delivery.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <Badge
                                        variant={delivery.status >= 200 && delivery.status < 300 ? "success" : "danger"}
                                        size="small"
                                    >
                                        {delivery.status}
                                    </Badge>
                                    <code className={styles.deliveryPreview}>
                                        {delivery.responsePreview}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="small"
                                        icon={<ArrowCounterclockwise24Regular />}
                                        onClick={() => retryDelivery(delivery.id)}
                                    >
                                        {t("webhookDeliveries.retry", "Retry")}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}
        </div>
    );
}
