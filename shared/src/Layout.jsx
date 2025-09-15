// shared/Layout.jsx
import Navbar from "./components/Navbar"; // ensure Navbar is exposed
import Footer from "./components/Footer";
export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main style={{ minHeight: "80vh", padding: "1rem" }}>
        {children}
      </main>
     <Footer/>
    </div>
  );
}
