import React from 'react';
import { Router } from './Routes';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Router />
    </BrowserRouter>
);
