"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { useProjects } from "@/context/project-context"

interface ProjectChatProps {
  projectId: string
}

export function ProjectChat({ projectId }: ProjectChatProps) {
  const { getProjectById, addMessageToProject } = useProjects()
  const project = getProjectById(projectId)
  const [message, setMessage] = useState("")

  if (!project) return null

  const handleSendMessage = () => {
    if (!message.trim()) return

    addMessageToProject(projectId, {
      id: `msg-${Date.now()}`,
      sender: "Project Manager",
      content: message,
      timestamp: new Date().toISOString(),
      isAdmin: false,
    })

    setMessage("")
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-2">
        {project.messages && project.messages.length > 0 ? (
          project.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.isAdmin ? "bg-slate-700 text-white" : "bg-[#60a5fa] text-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{msg.sender}</span>
                  <span className="text-xs opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-700 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 bg-slate-700 rounded-md border border-slate-600 focus:outline-none focus:ring-1 focus:ring-[#60a5fa]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            className="px-3 py-2 bg-[#60a5fa] text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
