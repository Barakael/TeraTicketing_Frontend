import React, { useState, useEffect } from "react";
import { MessageCircle, Eye, EyeOff, Send, AlertCircle } from "lucide-react";
import { Comment } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { useTickets } from "../../contexts/TicketContext";
import Button from "../ui/Button";
import { formatDateTime } from "../../utils/dateUtils";
import { toast } from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";

interface TicketCommentsProps {
  ticketId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

const TicketComments: React.FC<TicketCommentsProps> = ({
  ticketId,
  comments = [],
  onCommentAdded,
}) => {
  const { user } = useAuth();
  const { addComment } = useTickets();
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [fetchingComments, setFetchingComments] = useState(false);

  // Fetch comments from API when component mounts
  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  const fetchComments = async () => {
    setFetchingComments(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/tickets/${ticketId}/comments`
      );
      const fetchedComments = response.data.data.comments || [];
      setLocalComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      // Fallback to passed comments if API fails
      setLocalComments(comments);
    } finally {
      setFetchingComments(false);
    }
  };

  // Safety check for comments - use local comments first, then fallback to passed comments
  const safeComments =
    localComments.length > 0
      ? localComments
      : Array.isArray(comments)
      ? comments
      : [];

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setLoading(true);
    try {
      await addComment(ticketId, {
        content: newComment,
        isInternal: isInternal,
        userId: user?.id || "",
        user: user || {
          id: "",
          name: "Unknown",
          email: "",
          role: "troubleshooter",
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      });

      setNewComment("");
      setIsInternal(false);

      // Refresh comments after adding
      await fetchComments();
      onCommentAdded();
      toast.success("Comment added successfully!");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const canViewInternalComments =
    user?.role === "admin" || user?.role === "department_leader";

  const filteredComments = safeComments.filter(
    (comment) => !comment.isInternal || canViewInternalComments
  );

  return (
    <div className="space-y-6">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comments ({filteredComments.length})
          </h3>
        </div>
        {canViewInternalComments && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Eye size={16} />
            <span>Internal comments visible</span>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {fetchingComments ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading comments...
            </p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Be the first to add a comment!
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {comment.user?.name
                    ? comment.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`p-3 rounded-lg ${
                    comment.isInternal
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                      : "bg-gray-50 dark:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.user?.name || "Unknown"}
                      </span>
                      {comment.isInternal && (
                        <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                          <AlertCircle size={12} />
                          <span className="text-xs font-medium">Internal</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-medium">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "U"}
            </span>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-4">
              {canViewInternalComments && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                    {isInternal ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>Internal Comment</span>
                  </div>
                </label>
              )}
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isInternal ? "Add an internal comment..." : "Add a comment..."
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {isInternal && canViewInternalComments && (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    This comment will only be visible to admins and department
                    leaders
                  </span>
                )}
              </div>
              <Button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                size="sm"
                icon={<Send size={14} />}
              >
                {loading ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketComments;
