import { KafkaMessage } from "kafkajs";
import { KAFKA_TOPIC } from "@traceo/types";
import { handleIncidentEvent } from "./process-event-handler";
import { logger } from "..";
import { ExceptionHandlers } from "@traceo-sdk/node";
import { handleLogsEvent } from "./process-logs-handler";
import { Core } from "../types";
import { handleRuntimeEvent } from "./process-runtime-handler";
import { handleMetricsEvent } from "./process-metrics-handler";
import { handleBrowserPerformance } from "./process-browser-perfs-handler";

type EventHandlerType = {
    core: Core,
    topic: KAFKA_TOPIC,
    message: KafkaMessage
}

const handlers: Record<KAFKA_TOPIC, (core: Core, message: string) => Promise<void>> = {
    [KAFKA_TOPIC.INCIDENT_EVENT]: handleIncidentEvent,
    [KAFKA_TOPIC.LOGS_EVENT]: handleLogsEvent,
    [KAFKA_TOPIC.RUNTIME_EVENT]: handleRuntimeEvent,
    [KAFKA_TOPIC.METRICS_EVENT]: handleMetricsEvent,
    [KAFKA_TOPIC.BROWSER_PERFS_EVENT]: handleBrowserPerformance
};

export const eventHandler = async ({
    core,
    message,
    topic
}: EventHandlerType): Promise<void> => {
    const db = core.db;
    const kafkaMessage = message.value.toString();

    if (!db) {
        ExceptionHandlers.catchException(`❌ Database instance has not been initialized inside Core. Cannot process incoming events.`)
        return;
    }

    const handler = handlers[topic];

    if (!handler) {
        const message = `❌ Cannot find handler for this topic: ${topic}`;
        logger.error(message);

        // feed to itself
        ExceptionHandlers.catchException(new Error(message));

        return;
    }

    await handler(core, kafkaMessage);
}
