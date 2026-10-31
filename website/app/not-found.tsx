import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="subpage">
      <section className="section missing">
        <div className="wrap">
          <p className="kicker">404</p>
          <h1>This page is not on the map.</h1>
          <p>The address does not match a section of the site.</p>
          <Link href="/" className="btn btn-acid">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
