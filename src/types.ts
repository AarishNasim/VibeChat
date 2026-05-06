export interface Video {
  id: string;
  url: string;
  user: {
    name: string;
    avatar: string;
  };
  description: string;
  likes: number;
  comments: number;
  shares: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  lastMessage: string;
  unread: boolean;
}

export type AppView = 'home' | 'discover' | 'chat' | 'profile';
