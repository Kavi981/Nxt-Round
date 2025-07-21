import React, { useState } from 'react';
import { MessageCircle, User, Calendar, Edit3, Trash2, Save, X } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
}

interface CommentSectionProps {
  questionId: string;
  comments: Comment[];
  onCommentUpdate: (comments: Comment[]) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ questionId, comments, onCommentUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editForm, setEditForm] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/comments', {
        content: newComment,
        question: questionId
      });
      
      onCommentUpdate([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      onCommentUpdate(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditForm(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editForm.trim()) return;

    try {
      const response = await api.put(`/comments/${commentId}`, { content: editForm });
      onCommentUpdate(comments.map(comment => 
        comment._id === commentId ? response.data : comment
      ));
      setEditingComment(null);
      setEditForm('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditForm('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <MessageCircle className="w-5 h-5 mr-2" />
        Discussion ({comments.length})
      </h2>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add to the discussion..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-center">
          <p className="text-gray-600">
            <a href="/login" className="text-blue-600 hover:text-blue-700">Login</a> to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No comments yet. Start the discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const canEdit = user && (user.id === comment.author._id || user.role === 'admin');

            return (
              <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {editingComment === comment._id ? (
                        <textarea
                          value={editForm}
                          onChange={(e) => setEditForm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      ) : (
                        comment.content
                      )}
                    </p>

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {comment.author.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-4 h-4 rounded-full"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span>{comment.author.name}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex items-center space-x-2 ml-4">
                      {editingComment === comment._id ? (
                        <>
                          <button 
                            onClick={() => handleSaveEdit(comment._id)}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-700 p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleEditComment(comment)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentSection;