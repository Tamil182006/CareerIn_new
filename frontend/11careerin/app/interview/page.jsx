'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthGuard } from '../lib/authGuard';
import { sendInterviewMessage } from '../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function InterviewPage() {
  const { user, token, loading } = useAuthGuard();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [finalScoreRendered, setFinalScoreRendered] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  
  const bottomRef = useRef(null);

  // Sync initial target role to their global goal if it exists
  useEffect(() => {
    if (user?.goal && !targetRole) {
      setTargetRole(user.goal);
    }
  }, [user]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleStartInterview = async () => {
    if (!targetRole) {
      toast.error("Please select or type a target role first!");
      return;
    }
    setInterviewStarted(true);
    setIsTyping(true);
    try {
      const response = await sendInterviewMessage(token, { 
        history: [], 
        currentAnswer: "", 
        goalOverride: targetRole 
      });
      setMessages([{ role: 'ai', text: response.reply }]);
    } catch (err) {
      toast.error('Failed to connect to the AI Recruiter.');
      setInterviewStarted(false);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newAnswer = inputText.trim();
    setInputText(""); // Clear box immediately

    // Add user message to UI
    const currentHistory = [...messages, { role: 'user', text: newAnswer }];
    setMessages(currentHistory);
    setIsTyping(true);

    try {
      const response = await sendInterviewMessage(token, { 
        history: messages, // Send history so far
        currentAnswer: newAnswer,
        goalOverride: targetRole
      });

      const replyText = response.reply;
      
      // Check if it's the final score block
      if (replyText.includes("FINAL_SCORE:") || replyText.includes("FINAL SCORE")) {
        setFinalScoreRendered(true);
      }

      setMessages([...currentHistory, { role: 'ai', text: replyText }]);

    } catch (err) {
      toast.error('Network error communicating with AI.');
      // Revert optimism if failed
      setMessages(currentHistory.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 pb-4 px-4">
      
      {/* Breadcrumb Navigation Flow */}
      <div className="max-w-4xl w-full">
        <nav className="text-sm font-semibold text-slate-400 mb-6 flex items-center gap-2">
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
          <span className="text-slate-300">/</span>
          <span className="text-indigo-600 font-bold">Mock Interview</span>
        </nav>
      </div>

      {/* Header */}
      <div className="max-w-4xl w-full bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-3xl">🎤</span> Mock Interview 
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Role: <span className="text-indigo-600 font-bold">{targetRole || 'Not Selected'}</span>
          </p>
        </div>
        {!interviewStarted && (
          <button 
            onClick={handleStartInterview} 
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            Start Interview 🚀
          </button>
        )}
      </div>

      {/* Main Chat Box */}
      {interviewStarted && (
        <div className="max-w-4xl w-full flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[70vh]">
          
          {/* Chat History Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 relative">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-br-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {/* Handle formatting for FINAL_SCORE specially if needed */}
                  {msg.role === 'ai' && msg.text.includes('FINAL_SCORE:') ? (
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-indigo-700 uppercase">Interview Concluded</h3>
                       <p className="whitespace-pre-wrap">{msg.text.replace('FINAL_SCORE:', 'Final Score:')}</p>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex w-full justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-none bg-white border border-slate-200 p-4 shadow-sm flex gap-2 items-center">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping || finalScoreRendered}
                placeholder={
                  finalScoreRendered 
                    ? "Interview completed. Restart page to try again." 
                    : isTyping 
                      ? "Recruiter is typing..." 
                      : "Type your answer here..."
                }
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all disabled:opacity-50 font-medium text-slate-800"
              />
              <button 
                type="submit"
                disabled={isTyping || !inputText.trim() || finalScoreRendered}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl px-6 font-bold transition-colors flex items-center justify-center shadow-sm"
              >
                Send
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Placeholder State / Selection Screen */}
      {!interviewStarted && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-lg w-full">
          <div className="text-6xl mb-4 grayscale opacity-80">🤖</div>
          <h2 className="text-3xl font-bold text-slate-900">AI Hiring Manager</h2>
          <p className="text-slate-600 font-medium leading-relaxed">
            We will ask you exactly 5 technical questions customized solely based on your parsed resume matrix. Pick the specific role you want to practice for today.
          </p>

          <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-4 text-left">
             <label className="block text-sm font-bold text-slate-700 mb-2">Select Target Role</label>
             <select 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800 mb-6"
             >
                <option value="">-- Choose a Role --</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Product Manager">Product Manager</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                <option value="Cloud Architect">Cloud Architect</option>
             </select>

             <button 
               onClick={handleStartInterview} 
               disabled={!targetRole}
               className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-sm text-lg flex items-center justify-center gap-2"
             >
               Start Interview 🚀
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
