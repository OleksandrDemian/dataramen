import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './pages/Router.tsx';
import './css/index.css';
import 'react-tooltip/dist/react-tooltip.css';
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "./data/queryClient.ts";
import {AppLayout} from "./widgets/AppLayout";
import {BrowserRouter} from "react-router-dom";
import {Toaster} from "react-hot-toast";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster />
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Router/>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
