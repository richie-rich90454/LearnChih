import type { ChannelThread } from './thread';

export interface Channel {
  id: number;
  slug: string;
  name: string;
  description: string;
  threadCount: number;
  createdAt: string;
  threads?: ChannelThread[];
}
