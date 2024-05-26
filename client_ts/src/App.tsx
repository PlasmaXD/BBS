import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import ThreadPage from './components/ThreadPage';
import MyStampsPage from './components/MyStampsPage';
import MarketplacePage from './components/MarketplacePage';
import CreateStampPage from './components/CreateStampPage';
import PurchasedStampsPage from './components/PurchasedStampsPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminPage from './components/AdminPage';
import Navbar from './components/Navbar';
import { UserProvider } from './components/UserContext';

const App: React.FC = () => {
    return (
        <UserProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/thread/:id" element={<ThreadPage />} />
                    <Route path="/mystamps" element={<MyStampsPage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/create-stamp" element={<CreateStampPage />} />
                    <Route path="/purchased-stamps" element={<PurchasedStampsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </Router>
        </UserProvider>
    );
};

export default App;
