import React, { useState } from 'react'

const ChatItem = (props) => {
    const [hoveredMessageId, setHoveredMessageId] = useState(null);

    const handleMouseEnter = (id) => {
        setHoveredMessageId(id);
    }

    const handleMouseLeave = () => {
        setHoveredMessageId(null);
    }

    const handleEdit = (messageId) => {
        props.onEditMessage(messageId);
    }
    const handleDelete = (messageId) => {
        let isConfirm = window.confirm("Do you want to delete?") 
        if(isConfirm) props.onDeleteMessage(messageId);
    };
    const userId = JSON.parse(sessionStorage.getItem("userData")).userId

    return (
        <div>
            {props.messages && props.messages.map(message =>
                <div
                    key={message._id}
                    onMouseEnter={() => handleMouseEnter(message._id)}
                    onMouseLeave={handleMouseLeave} >
                    
                    <h6 className='sender-name' style={{display: message.sender === userId ? "none" : "block"}}>
                        {message.name.toLowerCase()}</h6>

                    <div className={`${message.sender === userId ? "sender-parent" : "receiver-parent"}`}
                    style={{margin: message.sender === userId ? "1rem 0 1rem 1rem" : "0 1rem 0.5rem 0"}}>
                        {hoveredMessageId === message._id && message.sender === userId && (
                        <div className="threeDots">
                            {/* <i className="fa fa-info-circle" style={{color:"#333"}}></i> */}
                            <i className="fa fa-pencil-alt" style={{ color: "#333", margin: "0 4px" }}
                                onClick={() => handleEdit(message._id)}></i>
                            <i className="fa fa-trash-alt" style={{ color: "#333", margin: "0 4px" }}
                                onClick={() => {handleDelete(message._id)}}></i>
                        </div>
                        )}
                        <div className={`message ${message.sender === userId ? "parker" : "stark"}`}>
                            {message.message}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatItem;
