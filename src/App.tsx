import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CTFsPage from './pages/CTFsPage';
import UpcomingPage from './pages/UpcomingPage';
import BlogPage from './pages/BlogPage';
import PostPage from './pages/PostPage';

export default function App() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ctfs" element={<CTFsPage />} />
          <Route path="/upcoming" element={<UpcomingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<PostPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
