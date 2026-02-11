// components/ChatButton.jsx
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatButton({ sessionId, role }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user?.uid || !sessionId) return;

        const messagesRef = collection(db, "questions", sessionId, "messages");

        const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
            let count = 0;

            snapshot.forEach((doc) => {
                const msg = doc.data();

                // Count unread messages
                if (
                    msg.senderId !== user.uid &&
                    !(msg.readBy || []).includes(user.uid)
                ) {
                    count++;
                }
            });

            setUnreadCount(count);
        });

        return unsubscribe;
    }, [sessionId, user?.uid]);

    const handleClick = () => {
        navigate(`/${role}/chat/${sessionId}`);
    };

    return (
        <button
            onClick={handleClick}
            className="relative cursor-pointer p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition"
            aria-label="Chat"
        >
            <MessageCircle size={20} className="text-white" />

            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[11px] font-bold text-black">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
            )}
        </button>
    );
}