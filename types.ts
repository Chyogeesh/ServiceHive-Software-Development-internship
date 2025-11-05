export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  userId: string;
  createdAt: string;
}

export interface SwappableSlot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  ownerName: string;
  ownerId: string;
}

export interface SwapRequest {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  offerTitle: string;
  requestTitle: string;
  offerOwner?: string;
  requestOwner?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
