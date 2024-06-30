import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import ChatItem from './ChatItem';

const socket = io.connect("http://localhost:5000");

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/messages/getmessages');
        const responseData = await response.json();
        setMessages(responseData.messages);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();

    socket.on('receive-message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    socket.on('message-deleted', (messageId) => {
      setMessages(prevMessages => prevMessages.filter(message => message._id !== messageId));
    })

    socket.on('message-edited', (messageId, newMessage) => {
      setMessages(prevMessages => prevMessages.map(message => message._id === messageId ? newMessage : message));
    })

    return () => {
      socket.off('receive-message');
      socket.off('message-deleted');
      socket.off('message-edited');
    };
  }, []);

  const sendMessage = async () => {
    const userId = JSON.parse(sessionStorage.getItem("userData")).userId
    const userName = JSON.parse(sessionStorage.getItem("userData")).name

    if (!userId || !userName) {
      console.error("User is not authenticated");
      return;
    }

    setInputMessage('');

    const newMessage = {
      sender: userId,
      name: userName,
      message: inputMessage,
      timeStamp: Date.now()
    };

    try { 
      const response = await fetch('http://localhost:5000/api/messages/createmessage', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMessage)
      });

      if (!response.ok) {
        throw new Error("Failed to create message");
      }

      const data = await response.json();

      socket.emit('send-message', data.createdMessage);
    } catch (err) {
      console.error(err);
    }

  };

  const deleteMessage = async (messageId) => {

    try {
      const response = await fetch(`http://localhost:5000/api/messages/deletemessage/${messageId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }
      setMessages(prevMessages => prevMessages.filter(message => message._id !== messageId));

      socket.emit('delete-message', messageId);
    } catch (err) {
      console.error(err);
    }
  } 

  const editMessage = async (messageId) => {
    let newMessage = prompt("Enter new message");
    try {
      const response = await fetch(`http://localhost:5000/api/messages/updatemessage/${messageId}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({message: newMessage})
      });
      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      const responseData = await response.json();
      setMessages(prevMessages => prevMessages.map(message => message._id === messageId ? responseData.createdMessage : message));
      socket.emit('edit-message', messageId, responseData.createdMessage);
    } catch(err) {console.log(err); }
  }

  return (
    <div className="center">
      <div className="chat">
        <div>
          <div className="contact bar">
            <div className="pic stark"></div>
            <div className="name">ChatChord - Chatting Room for friends</div>
            <div className="seen">Chat with Friends in real time with Socket.io</div>
          </div>
          <div id="chat" className="messages">
            <div className="time">Today at {new Date().getHours() + ":" + new Date().getMinutes()}</div>
            <ChatItem messages={messages} onDeleteMessage={deleteMessage} onEditMessage={editMessage} />
          </div>
        </div>

        <div className="input">
          <i className="fas fa-camera"></i>
          <i className="far fa-laugh-beam"></i>
          <input
            type="text"
            placeholder="Type your message here!"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <div onClick={sendMessage} className="circle">
            <i className="fa fa-paper-plane"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
