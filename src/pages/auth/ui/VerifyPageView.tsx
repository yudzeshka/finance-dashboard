import { useNavigate } from "react-router-dom";

import type { UseVerifyResult } from "@/features/auth/verify/model/types";

export function VerifyPageView({ status, error }: UseVerifyResult) {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Email Verification</h1>

      <div className="page-center">
        {status === "verifying" && (
          <div>
            <p className="margin-bottom">Verifying your email...</p>
            <div className="spinner-verify" />
          </div>
        )}

        {status === "success" && (
          <div>
            <p className="verification-status">✓ Successfully verified!</p>
            <p>You'll be redirected to your profile page shortly...</p>
          </div>
        )}

        {status === "error" && (
          <div>
            <p className="verification-status error">Verification failed</p>
            {error ? <p className="margin-bottom">{error}</p> : null}

            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="auth-button secondary"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
