import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useUser } from './UserContext';

const Navbar: React.FC = () => {
    const { user, logout } = useUser();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    Stamp Marketplace
                </Typography>
                <Button color="inherit" component={Link} to="/">
                    Home
                </Button>
                <Button color="inherit" component={Link} to="/marketplace">
                    Marketplace
                </Button>
                <Button color="inherit" component={Link} to="/mystamps">
                    My Stamps
                </Button>
                <Button color="inherit" component={Link} to="/create-stamp">
                    Create Stamp
                </Button>
                <Button color="inherit" component={Link} to="/purchased-stamps">
                    Purchased Stamps
                </Button>
                {user ? (
                    <>
                        <Typography variant="h6" style={{ marginLeft: '20px' }}>
                            {user.username}
                        </Typography>
                        <Button color="inherit" onClick={logout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Button color="inherit" component={Link} to="/login">
                            Login
                        </Button>
                        <Button color="inherit" component={Link} to="/register">
                            Register
                        </Button>
                    </>
                )}
                <Button color="inherit" component={Link} to="/admin">
                    Admin
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;

