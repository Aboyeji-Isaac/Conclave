import { useParams } from 'react-router-dom';

// This is the core screen: chat timeline plus the three differentiator
// tabs (Decisions / Tasks / Digest) that live alongside it — see PKB §3.
// TODO:
//  - fetch room + messages on mount, join the Socket.IO room
//  - listen for receive-message / typing / decision:created / task:updated
//  - render a tab strip: Chat | Decisions | Tasks | Digest
export default function Room() {
  const { roomId } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Room {roomId}</h1>
      <div className="flex gap-4 mt-4 text-sm text-gray-500 border-b pb-2">
        <span>Chat</span>
        <span>Decisions</span>
        <span>Tasks</span>
        <span>Digest</span>
      </div>
      <p className="text-gray-500 text-sm mt-4">TODO: build chat timeline + tabs.</p>
    </div>
  );
}
