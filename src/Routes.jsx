import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Player } from './scenes/Player';
import { Admin } from './scenes/Admin';

export const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Player />} />
            <Route path="/admin" element={<Admin />} />
        </Routes>
    );
};