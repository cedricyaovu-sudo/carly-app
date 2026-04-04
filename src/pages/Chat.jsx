import { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, MessageSquare, Globe, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

const Chat = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('global'); // 'global' or 'dms'
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversations, setConversations] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;
        const diffInSec = Math.floor(diffInMs / 1000);
        const diffInMin = Math.floor(diffInSec / 60);
        const diffInHr = Math.floor(diffInMin / 60);
        const diffInDay = Math.floor(diffInHr / 24);
        const diffInMo = Math.floor(diffInDay / 30);
        const diffInYr = Math.floor(diffInDay / 365);

        if (diffInYr > 0) return `${diffInYr}yr ago`;
        if (diffInMo > 0) return `${diffInMo}mo ago`;
        if (diffInDay > 0) return `${diffInDay}d ago`;
        if (diffInHr > 0) return `${diffInHr}h ago`;
        if (diffInMin > 0) return `${diffInMin}m ago`;
        return 'Just now';
    };

    useEffect(() => {
        if (activeTab === 'global') {
            fetchGlobalMessages();
            const subscription = supabase
                .channel('global-chat')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `is_global=eq.true` }, payload => {
                    setMessages(prev => {
                        // Avoid duplicates if the message was already added optimistically
                        if (prev.some(m => m.id === payload.new.id)) return prev;
                        return [...prev, payload.new];
                    });
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        } else {
            fetchConversations();
        }
    }, [activeTab]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchGlobalMessages = async () => {
        setLoading(true);
        console.log('Chat: Fetching global messages...');
        try {
            // Attempt with profiles join
            let { data, error } = await supabase
                .from('messages')
                .select('*, profiles:sender_id(full_name, avatar_url)')
                .eq('is_global', true)
                .order('created_at', { ascending: true })
                .limit(50);

            // If join fails, attempt simple fetch
            if (error) {
                console.warn('Profile join failed, falling back to simple query:', error);
                const { data: simpleData, error: simpleError } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('is_global', true)
                    .order('created_at', { ascending: true })
                    .limit(50);

                if (simpleError) throw simpleError;
                data = simpleData;
            }

            console.log(`Chat: Successfully fetched ${data?.length || 0} messages`);
            setMessages(data || []);
        } catch (err) {
            console.error('Final attempt to fetch messages failed:', err);
            if (messages.length === 0) {
                setMessages([
                    { id: 'welcome', sender_id: 'system', content: 'Welcome to the Carly Community! 🚗', is_global: true, created_at: new Date().toISOString(), profiles: { full_name: 'Carly Bot' } }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchConversations = async () => {
        // Mocking conversations for now as robust DM logic requires more complex queries
        setConversations([
            { id: '1', full_name: 'Alex Johnson', last_message: 'The car meet is at 7pm!', time: '2m ago', unread: 1, avatar_url: null },
            { id: '2', full_name: 'Sarah Williams', last_message: 'Thanks for the charging tip!', time: '1h ago', unread: 0, avatar_url: null },
            { id: '3', full_name: 'Houston Detailing', last_message: 'Your appointment is confirmed.', time: 'Yesterday', unread: 0, avatar_url: null }
        ]);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            sender_id: user.id,
            content: newMessage,
            is_global: activeTab === 'global',
            receiver_id: activeTab === 'dms' ? selectedContact?.id : null,
            created_at: new Date().toISOString()
        };

        // UI Optimistic Update with a temp ID
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { ...messageData, id: tempId, profiles: { full_name: 'You' } }]);
        setNewMessage('');

        try {
            console.log('Chat: Sending message...', messageData);

            // Perform the insert first
            const { data: insertedData, error: insertError } = await supabase
                .from('messages')
                .insert([messageData])
                .select()
                .single();

            if (insertError) {
                console.error('Chat: Insert failed:', insertError);
                throw insertError;
            }

            console.log('Chat: Message inserted successfully:', insertedData);

            // Fetch profile data for the newly inserted message
            const { data: profileData, error: profileError } = await supabase
                .from('messages')
                .select('*, profiles:sender_id(full_name, avatar_url)')
                .eq('id', insertedData.id)
                .single();

            if (profileError) {
                console.warn('Chat: Profile join failed after insert, using inserted data:', profileError);
                setMessages(prev => prev.map(m => m.id === tempId ? { ...insertedData, profiles: { full_name: 'You' } } : m));
            } else {
                setMessages(prev => prev.map(m => m.id === tempId ? profileData : m));
            }
        } catch (err) {
            console.error('Chat: Error in handleSendMessage:', err);
        }
    };

    const renderGlobalChat = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 'var(--spacing-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-sm)'
                }}
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            alignSelf: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.sender_id === user.id ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            marginBottom: '2px',
                            marginLeft: msg.sender_id === user.id ? '0' : '8px',
                            marginRight: msg.sender_id === user.id ? '8px' : '0',
                            flexDirection: msg.sender_id === user.id ? 'row-reverse' : 'row'
                        }}>
                            <span style={{ fontSize: '11px', color: isDarkMode ? '#94A3B8' : '#1A1A1A', fontWeight: '700' }}>
                                {msg.sender_id === user.id ? 'You' : (msg.profiles?.full_name || 'User')}
                            </span>
                            <span style={{ color: '#888', fontSize: '10px' }}>•</span>
                            <span style={{ fontSize: '11px', color: '#888' }}>
                                {formatTimeAgo(msg.created_at)}
                            </span>
                        </div>
                        <div style={{
                            background: msg.sender_id === user.id ? '#007AFF' : (isDarkMode ? '#333' : '#E9E9EB'),
                            color: msg.sender_id === user.id ? 'white' : (isDarkMode ? 'white' : 'black'),
                            padding: '10px 14px',
                            borderRadius: '18px',
                            fontSize: '14px',
                            lineHeight: '1.4',
                            borderBottomRightRadius: msg.sender_id === user.id ? '4px' : '18px',
                            borderBottomLeftRadius: msg.sender_id !== user.id ? '4px' : '18px'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            <form
                onSubmit={handleSendMessage}
                style={{
                    padding: 'var(--spacing-md)',
                    background: isDarkMode ? 'var(--color-surface)' : 'white',
                    borderTop: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    alignItems: 'center'
                }}
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '24px',
                        border: 'none',
                        background: isDarkMode ? '#1a1a1a' : '#f0f0f0',
                        color: 'inherit',
                        fontSize: '14px',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        background: '#007AFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );

    const renderDMs = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {selectedContact ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{
                        padding: 'var(--spacing-md)',
                        borderBottom: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <button
                            onClick={() => setSelectedContact(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        >
                            <ArrowLeft size={20} color="var(--color-text-heading)" />
                        </button>
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: '#eee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {selectedContact.avatar_url ? (
                                <img src={selectedContact.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" decoding="async" />
                            ) : (
                                <UserIcon size={20} color="#888" />
                            )}
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '16px' }}>{selectedContact.full_name}</span>
                    </div>
                    {renderGlobalChat()} {/* Reuse the chat UI for DM context */}
                </div>
            ) : (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ padding: 'var(--spacing-md)' }}>
                        <div style={{
                            background: isDarkMode ? '#333' : '#f0f0f0',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 12px',
                            marginBottom: 'var(--spacing-lg)'
                        }}>
                            <Search size={18} color="#888" style={{ marginRight: 10 }} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                style={{ background: 'none', border: 'none', outline: 'none', flex: 1, color: 'inherit' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedContact(conv)}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        background: '#eee',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <UserIcon size={24} color="#888" />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontWeight: '600' }}>{conv.full_name}</span>
                                            <span style={{ fontSize: '12px', color: '#888' }}>{conv.time}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#888', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {conv.last_message}
                                        </p>
                                    </div>
                                    {conv.unread > 0 && (
                                        <div style={{
                                            background: '#007AFF',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: 20,
                                            height: 20,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            alignSelf: 'center'
                                        }}>
                                            {conv.unread}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                display: 'flex',
                padding: '4px',
                background: isDarkMode ? '#1a1a1a' : '#f0f0f0',
                borderRadius: '12px',
                margin: '0 var(--spacing-md) var(--spacing-md)'
            }}>
                <button
                    onClick={() => setActiveTab('global')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: 'none',
                        borderRadius: '10px',
                        background: activeTab === 'global' ? (isDarkMode ? '#333' : 'white') : 'transparent',
                        color: activeTab === 'global' ? 'var(--color-text-heading)' : '#888',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: activeTab === 'global' ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'none'
                    }}
                >
                    <Globe size={18} /> Global
                </button>
                <button
                    onClick={() => setActiveTab('dms')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: 'none',
                        borderRadius: '10px',
                        background: activeTab === 'dms' ? (isDarkMode ? '#333' : 'white') : 'transparent',
                        color: activeTab === 'dms' ? 'var(--color-text-heading)' : '#888',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: activeTab === 'dms' ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'none'
                    }}
                >
                    <MessageSquare size={18} /> Messages
                </button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                {activeTab === 'global' ? renderGlobalChat() : renderDMs()}
            </div>
        </div>
    );
};

export default Chat;
