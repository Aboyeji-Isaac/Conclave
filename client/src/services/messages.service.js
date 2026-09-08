import { api } from '../lib/api';
import { isDevAuthBypass, previewMessages } from '../config/devPreview';
export async function listMessages(roomId, before) { if (isDevAuthBypass) return { messages: [...previewMessages].reverse().map((message) => ({ ...message, room_id: roomId })), nextCursor: null }; const { data } = await api.get(`/messages/room/${roomId}`, { params: before ? { before } : undefined }); return data.data; }
