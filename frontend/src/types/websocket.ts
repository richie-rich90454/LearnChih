export interface WebSocketPostMessage {
  id: number;
  threadId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}
