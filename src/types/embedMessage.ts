import { EmbedEventName } from './events';

/**
 * A response from a method call from the embed
 */
export interface EmbedMessageReceivedMethod {
  // The method name
  method: string;
  // If the method call failed, the error message
  error?: string;
  // If the method call succeeded, the response
  response?: unknown;
}

/**
 * A subscribed event broadcasted by the embed
 */
export interface EmbedMessageReceivedEvent {
  // The event name
  event: EmbedEventName;
  // The event parameters
  parameters: unknown;
}

export type EmbedMessageReceived = EmbedMessageReceivedMethod | EmbedMessageReceivedEvent;
