"use client";
import { useState, useEffect, useRef } from "react";

interface Comment {
  id: string;
  username: string;
  content: string;
  createdAt: string;
  labelId?: string;
}

interface SpaceChatProps {
  assetId: string;
  labelId?: string;
  onNewComment?: (comment: Comment) => void;
}

export default function SpaceChat({ assetId, labelId, onNewComment }: SpaceChatProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [username, setUsername] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
  }, [assetId, labelId]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const fetchComments = async () => {
    try {
      const url = labelId 
        ? `/api/comments?labelId=${labelId}`
        : `/api/comments?assetId=${assetId}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setComments(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch comments:', response.status);
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !username.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: labelId ? null : assetId,
          labelId: labelId || null,
          username,
          content: newComment
        })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [...prev, comment]);
        setNewComment("");
        onNewComment?.(comment);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div className="glass-effect-strong rounded-2xl cosmic-glow">
      {/* Chat Header */}
      <div 
        className="p-6 border-b border-purple-500/30 cursor-pointer hover:bg-purple-500/10 transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            🚀 Space Community Discussion
            <span className="text-sm glass-effect px-3 py-1 rounded-full border border-purple-500/30">
              {comments.length} messages
            </span>
          </h3>
          <div className="text-purple-300 text-2xl transition-transform duration-300">
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-6 space-y-4">
            {comments.length === 0 ? (
              <div className="text-center text-gray-300 py-12">
                <div className="text-6xl mb-4">🌌</div>
                <p className="text-lg">No discussions yet. Start the conversation!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold cosmic-glow">
                    {comment.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-purple-300 text-lg">{comment.username}</span>
                      <span className="text-sm text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="glass-effect rounded-xl p-4 text-white">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-6 border-t border-purple-500/30">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your space explorer name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 glass-effect border border-purple-500/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                required
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Share your discovery with the space community..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-4 py-3 glass-effect border border-purple-500/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                  required
                />
                <button
                  type="submit"
                  className="space-button px-6 py-3 text-white rounded-xl font-medium cosmic-glow"
                >
                  🚀 Send
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
