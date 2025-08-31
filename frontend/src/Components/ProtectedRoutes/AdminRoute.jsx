import React from 'react';
import CheckPermission from '../../config/checkPermission.config.jsx';

const AdminRoute = ({ children }) => {
    return (
        <CheckPermission allowedBy="admin">
            {children}
        </CheckPermission>
    );
};

export default AdminRoute; 