import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Code2, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="auth-page-container">
      <div className="auth-header">
        <Link href="/" className="auth-brand-link">
          <div className="brand-icon-box">
            <Code2 size={20} />
          </div>
          <span className="brand-title">GitCode</span>
        </Link>
        <Link href="/" className="auth-back-link">
          <ArrowLeft size={14} />
          <span>Back to Explorer</span>
        </Link>
      </div>

      <div className="auth-card-wrapper">
        <SignIn />
      </div>
    </div>
  );
}
