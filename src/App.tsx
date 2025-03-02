
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import Index from "./pages/Index";
import Devices from "./pages/Devices";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import UploadData from "./pages/UploadData";
import PredictDowntime from "./pages/PredictDowntime";
import NetworkStatus from "./pages/NetworkStatus";
import ViewAlerts from "./pages/ViewAlerts";
import TrainModel from "./pages/TrainModel";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AddDevice from "./pages/AddDevice";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* All routes wrapped in AuthLayout - will show mock data when not logged in */}
              <Route path="/" element={
                <AuthLayout>
                  <Index />
                </AuthLayout>
              } />
              <Route path="/devices" element={
                <AuthLayout>
                  <Devices />
                </AuthLayout>
              } />
              <Route path="/add-device" element={
                <AuthLayout>
                  <AddDevice />
                </AuthLayout>
              } />
              <Route path="/analytics" element={
                <AuthLayout>
                  <Analytics />
                </AuthLayout>
              } />
              <Route path="/network-status" element={
                <AuthLayout>
                  <NetworkStatus />
                </AuthLayout>
              } />
              <Route path="/alerts" element={
                <AuthLayout>
                  <ViewAlerts />
                </AuthLayout>
              } />
              <Route path="/settings" element={
                <AuthLayout>
                  <Settings />
                </AuthLayout>
              } />
              <Route path="/upload" element={
                <AuthLayout>
                  <UploadData />
                </AuthLayout>
              } />
              <Route path="/predict" element={
                <AuthLayout>
                  <PredictDowntime />
                </AuthLayout>
              } />
              <Route path="/train" element={
                <AuthLayout>
                  <TrainModel />
                </AuthLayout>
              } />
              
              {/* Fallback routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
