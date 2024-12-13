import "./styles.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="main-container">
      <div className="inner-container">
        {children}
        <div className="fixed-dummy" />
      </div>
    </div>
  );
}
