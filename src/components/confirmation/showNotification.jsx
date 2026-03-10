import React from 'react';

const notificationAlert = React.createRef(); // Creating the ref here

const showNotification = (message, type) => {
    const options = {
        place: 'tr',
        message: (
            <div>
                {message}
            </div>
        ),
        type: type,
        autoDismiss: 3,
    };
    notificationAlert.current.notificationAlert(options);
};

export default showNotification;
