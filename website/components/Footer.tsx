import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-row">
        <p>
          © {new Date().getFullYear()} {profile.name}
          <span>Data engineer</span>
        </p>
        <a href="#main">Back to top</a>
      </div>
    </footer>
  );
}
