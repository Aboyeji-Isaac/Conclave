import { api } from '../lib/api';
import { isDevAuthBypass, previewRoom } from '../config/devPreview';
export async function listRooms() { if (isDevAuthBypass) return [previewRoom]; const { data } = await api.get('/rooms'); return data.data; }
export async function getRoom(roomId) { if (isDevAuthBypass) return { ...previewRoom, id: roomId }; const { data } = await api.get(`/rooms/${roomId}`); return data.data; }
