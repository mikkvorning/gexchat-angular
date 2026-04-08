export type OnlineStatus = 'online' | 'offline' | 'away';

export interface BaseUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  status: OnlineStatus;
}

export interface CurrentUser extends BaseUser {
  isGuest: boolean;
  createdAt: Date;
  chats: string[];
  blocked: string[];
  privacy: {
    showStatus: boolean;
    showLastSeen: boolean;
    showActivity: boolean;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    muteUntil?: Date | null;
  };
  friends: {
    list: string[];
    pending: string[];
  };
}
