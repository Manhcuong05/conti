import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import type { Chat, ChatMessage, User } from '@shared/types'
import { api } from '@/lib/api-client'

export const HAS_TEMPLATE_DEMO = true

const glassCard = 'backdrop-blur-xl bg-white/10 dark:bg-black/20 border-white/20 shadow-2xl'

export function TemplateDemo() {
  const [users, setUsers] = useState<User[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedChatId, setSelectedChatId] = useState<string>('')

  const [newUserName, setNewUserName] = useState('')
  const [newChatTitle, setNewChatTitle] = useState('')
  const [text, setText] = useState('')

  const [loadingMessages, setLoadingMessages] = useState(false)

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const load = useCallback(async () => {
    const [uPage, cPage] = await Promise.all([
      api<{ items: User[]; next: string | null }>('/api/users'),
      api<{ items: Chat[]; next: string | null }>('/api/chats'),
    ])
    setUsers(uPage.items)
    setChats(cPage.items)

    setSelectedUserId((prev) => prev || uPage.items[0]?.id || '')
    setSelectedChatId((prev) => prev || cPage.items[0]?.id || '')
  }, [])

  const loadMessages = useCallback(async (chatId: string) => {
    setLoadingMessages(true)
    try {
      const list = await api<ChatMessage[]>(`/api/chats/${chatId}/messages`)
      setMessages(list)
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    load().catch(() => {})
  }, [load])

  useEffect(() => {
    if (!selectedChatId) return
    loadMessages(selectedChatId).catch(() => {})
  }, [selectedChatId, loadMessages])

  const createUser = async () => {
    const name = newUserName.trim()
    if (!name) return
    const u = await api<User>('/api/users', { method: 'POST', body: JSON.stringify({ name }) })
    setUsers((prev) => [...prev, u])
    setNewUserName('')
    setSelectedUserId((prev) => prev || u.id)
  }

  const createChat = async () => {
    const title = newChatTitle.trim()
    if (!title) return
    const c = await api<Chat>('/api/chats', { method: 'POST', body: JSON.stringify({ title }) })
    setChats((prev) => [...prev, c])
    setNewChatTitle('')
    setSelectedChatId((prev) => prev || c.id)
  }

  const send = async () => {
    const msg = text.trim()
    if (!selectedUserId || !selectedChatId || !msg) return

    const created = await api<ChatMessage>(`/api/chats/${selectedChatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ userId: selectedUserId, text: msg }),
    })

    setMessages((prev) => [...prev, created])
    setText('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className={glassCard}>
        <CardHeader>
          <CardTitle className="text-base">Entities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Users</div>
            <div className="flex gap-2">
              <Input placeholder="New user name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
              <Button onClick={createUser} variant="outline">Add</Button>
            </div>
            <div className="space-y-2">
              {users.length ? users.slice(0, 6).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUserId(u.id)}
                  className={`w-full text-left flex items-center justify-between border rounded px-3 py-2 transition-colors ${selectedUserId === u.id ? 'bg-white/10 dark:bg-white/5' : 'hover:bg-white/5 dark:hover:bg-white/5'}`}
                >
                  <span className="font-medium">{u.name}</span>
                  <span className="text-xs text-muted-foreground">{u.id.slice(0, 6)}…</span>
                </button>
              )) : (
                <div className="text-sm text-muted-foreground">No users yet.</div>
              )}
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="space-y-2">
            <div className="text-sm font-medium">Chats</div>
            <div className="flex gap-2">
              <Input placeholder="New chat title" value={newChatTitle} onChange={(e) => setNewChatTitle(e.target.value)} />
              <Button onClick={createChat} variant="outline">Add</Button>
            </div>
            <div className="space-y-2">
              {chats.length ? chats.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedChatId(c.id)}
                  className={`w-full text-left flex items-center justify-between border rounded px-3 py-2 transition-colors ${selectedChatId === c.id ? 'bg-white/10 dark:bg-white/5' : 'hover:bg-white/5 dark:hover:bg-white/5'}`}
                >
                  <span className="font-medium">{c.title}</span>
                  <span className="text-xs text-muted-foreground">{c.id.slice(0, 6)}…</span>
                </button>
              )) : (
                <div className="text-sm text-muted-foreground">No chats yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${glassCard} lg:col-span-2 flex flex-col`}>
        <CardHeader>
          <CardTitle className="text-base">Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedChatId} onValueChange={setSelectedChatId}>
              <SelectTrigger>
                <SelectValue placeholder="Select chat" />
              </SelectTrigger>
              <SelectContent>
                {chats.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 rounded-lg border bg-white/5 dark:bg-white/5 p-3 overflow-y-auto">
            {loadingMessages ? (
              <div className="text-sm text-muted-foreground">Loading messages…</div>
            ) : messages.length ? (
              <div className="space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className="text-sm">
                    <span className="font-medium">
                      {usersById.get(m.userId)?.name ?? 'Unknown'}:
                    </span>{' '}
                    <span>{m.text}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {new Date(m.ts).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No messages yet.</div>
            )}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send().catch(() => {})
            }}
          >
            <Textarea
              placeholder={selectedUserId && selectedChatId ? 'Write a message…' : 'Select a user and chat first'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!selectedUserId || !selectedChatId}
              className="min-h-[44px] max-h-28"
            />
            <Button type="submit" className="shrink-0" disabled={!selectedUserId || !selectedChatId || !text.trim()}>
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
