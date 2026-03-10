import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import NotificationAlert from 'react-notification-alert';

const ContactForm = styled.form`
    max-width: 400px;
    margin: 0 auto;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 5px;
`;

const Input = styled.input`
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const Textarea = styled.textarea`
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const Button = styled.button`
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const ContactScreen = () => {
    const notificationAlert = useRef(null);
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');

    const showNotification = (message, type) => {
        const options = {
            place: 'tr',
            message: <div>{message}</div>,
            type: type,
            autoDismiss: 3,
        };
        notificationAlert.current.notificationAlert(options);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission, e.g., send data to backend
       // console.log('Form submitted:', { email, mobile, message });
        // Reset form fields
        setEmail('');
        setMobile('');
        setMessage('');
        setName('');
        // Show notification
        showNotification('email send successfully', 'success');
    };
    const isMobile = window.innerWidth <= 768
    return (
  
        <div style={{width: isMobile ?"80%":"80%",marginLeft:isMobile ?"10%":"10%",marginTop:"25px"}}>
         
            <ContactForm onSubmit={handleSubmit}>
            <div style={{ display: 'flex',flexDirection: 'column',alignItems: 'center',justifyContent: 'center',}}> 
             <h2 >Contact Us</h2>
             </div>
                <FormGroup>
                    <Label>Email:</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                    <Label>Nom de restaurant:</Label>
                    <Input type="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </FormGroup>      
                <FormGroup>
                    <Label>Mobile:</Label>
                    <Input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                    <Label>Message:</Label>
                    <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
                </FormGroup>
                <div style={{ display: 'flex',flexDirection: 'column',alignItems: 'center',justifyContent: 'center',}}>  
                 <Button type="submit"  style={{    backgroundColor: "#29335c"}}>Envoyer</Button>
                 </div>
            </ContactForm>
            <NotificationAlert ref={notificationAlert} />
        </div>
    );
};

export default ContactScreen;
