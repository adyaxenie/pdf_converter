import React from 'react';

const MyComponent = ({ message } : { message: String}) => {
    return (
    <div>
        {message} - lets go
    </div>
    )
};

export default MyComponent;
