import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import FindArtist from "./pages/FindArtist";
import ArtistProfile from "./pages/ArtistProfile";
import { LoginChoice, SignupChoice } from "./pages/AuthChoice";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardClient from "./pages/DashboardClient";
import DashboardArtist from "./pages/DashboardArtist";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import BackendTest from "./pages/BackendTest";

export default function App() {
  return <BrowserRouter><Layout><Routes><Route path="/" element={<Home/>}/><Route path="/artists" element={<FindArtist/>}/><Route path="/artist/:id" element={<ArtistProfile/>}/><Route path="/login" element={<LoginChoice/>}/><Route path="/login/client" element={<Login role="client"/>}/><Route path="/login/artist" element={<Login role="artist"/>}/><Route path="/signup" element={<SignupChoice/>}/><Route path="/signup/client" element={<Signup role="client"/>}/><Route path="/signup/artist" element={<Signup role="artist"/>}/><Route path="/dashboard/client" element={<ProtectedRoute role="client"><DashboardClient/></ProtectedRoute>}/><Route path="/dashboard/artist" element={<ProtectedRoute role="artist"><DashboardArtist/></ProtectedRoute>}/><Route path="/contact" element={<Contact/>}/><Route path="/help" element={<Help/>}/><Route path="/backend-test" element={<BackendTest/>}/><Route path="*" element={<Home/>}/></Routes></Layout></BrowserRouter>;
}
