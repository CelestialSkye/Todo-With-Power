import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, User, MessageSquare, X } from 'lucide-react';


const App = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello, I am the control devil makima' }
    ]);

    const [input, setInput] = useState('');

    const [isLoading, setIsLoading] = useState(false); 
    
    const [isOpen, setIsOpen] = useState(true); 

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
    };

    useEffect(scrollToBottom, [messages]); 


    return (
        <div>Chat UI will be rendered here.</div>
    );
}

export default App;