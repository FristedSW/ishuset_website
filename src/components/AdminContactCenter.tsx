import React, { useEffect, useState } from 'react';
import { contactAPI, ContactMessage } from '../services/api';

export default function AdminContactCenter() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await contactAPI.getAll();
      setMessages(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await contactAPI.updateStatus(id, status);
      fetchMessages();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Slet denne besked?')) return;
    try {
      await contactAPI.delete(id);
      fetchMessages();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Ny';
      case 'read': return 'Læst';
      case 'replied': return 'Besvaret';
      default: return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Kontakt Beskeder</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      {loading && <div>Indlæser...</div>}
      
      {!loading && messages.length === 0 && (
        <div className="text-gray-500">Ingen beskeder endnu.</div>
      )}

      <div className="space-y-4">
        {messages.map(message => (
          <div key={message.id} className="bg-white rounded shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{message.name}</h3>
                <div className="text-sm text-gray-500">{message.email}</div>
                {message.phone && (
                  <div className="text-sm text-gray-500">{message.phone}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(message.status)}`}>
                  {getStatusText(message.status)}
                </span>
                <div className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            
            {message.service && (
              <div className="mb-2">
                <span className="text-sm font-medium">Service: </span>
                <span className="text-sm">{message.service}</span>
              </div>
            )}
            
            <div className="mb-3">
              <p className="text-gray-700">{message.message}</p>
            </div>
            
            <div className="flex gap-2">
              <select
                value={message.status}
                onChange={(e) => handleStatusUpdate(message.id, e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="new">Ny</option>
                <option value="read">Læst</option>
                <option value="replied">Besvaret</option>
              </select>
              
              <button
                onClick={() => handleDelete(message.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Slet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 