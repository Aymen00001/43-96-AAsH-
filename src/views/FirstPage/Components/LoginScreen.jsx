import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import NotificationAlert from 'react-notification-alert';
import AuthService from 'Service/Auth';
import Cookies from 'js-cookie';
import ReactLoading from 'react-loading'; // Import ReactLoading component

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

const Button = styled.button`
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const LoginScreen = () => {
    const notificationAlert = useRef(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // State variable to manage loading state

    const showNotification = (message, type) => {
        const options = {
            place: 'tr',
            message: <div>{message}</div>,
            type: type,
            autoDismiss: 3,
        };
        notificationAlert.current.notificationAlert(options);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email === "") { showNotification("Veuillez remplir l'email.", 'danger'); }
        else if (password === "") { showNotification("Veuillez remplir le mot de passe", 'danger'); }
        else {
            try {
                setLoading(true); // Set loading state to true
                const response = await AuthService.signIn(email, password);
                 // Set loading state to false after request completes
                if (response.success === false) { showNotification('Email ou le mot de passe incorrect', 'danger');    setLoading(false);}
                else if (response.success === true) {
                    showNotification('connect successfully', 'success');

                    Cookies.set('access_token', response.data.access_token,{ expires: 7 });
                    Cookies.set('isLoggedIn', 'isLoggedIn',{ expires: 7 });
                    Cookies.set('idCRM', response.data.idCRM,{ expires: 7 });
                    Cookies.set('Name', response.data.Nom,{ expires: 7 });
                    console.log(response);
                    Cookies.set('Setting', response.data.Setting,{ expires: 7 });
                     
                    window.location.reload();

                 
                   
                }
            } catch (error) {
                setLoading(false);
                console.error('Erreur de connexion. Veuillez réessayer', 'danger');
            }
        }
    };

    const isMobile = window.innerWidth <= 768;

    return (
        <div style={{ width: isMobile ? "80%" : "80%", marginLeft: isMobile ? "10%" : "10%", marginTop: "25px" }}>
            <ContactForm onSubmit={handleSubmit}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <h2>Login</h2>
                </div>
                <FormGroup>
                    <Label>Login</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                    <Label>Password:</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </FormGroup>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }}>
                    {/* Render ReactLoading component conditionally based on loading state */}
                    {loading ? (
                        <ReactLoading type={'spin'} color={'#29335c'} height={30} width={30} />
                    ) : (
                        <Button type="submit" style={{ backgroundColor: "#29335c" }}>Login</Button>
                    )}
                </div>
            </ContactForm>
            <NotificationAlert ref={notificationAlert} />
        </div>
    );
};

export default LoginScreen;
