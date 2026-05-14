import { Link } from "react-router-dom";
import logoSvg from "../assets/logo.svg";

export default function Logo({ style = {}, suffix = "" }) {
  return (
    <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
      <img src={logoSvg} alt="MOVEACRE" style={{ height: 28 }} />
      {suffix && (
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#555", letterSpacing: "0.05em" }}>
          {suffix}
        </span>
      )}
    </Link>
  );
}
