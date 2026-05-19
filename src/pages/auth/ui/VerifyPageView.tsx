import { useNavigate } from "react-router-dom";

import type { UseVerifyResult } from "@/features/auth/verify/model/types";

export function VerifyPageView({ status, error, urlParams }: UseVerifyResult) {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Email Verification</h1>

      <div className="page-center">
        {status === "verifying" && (
          <div>
            <p className="margin-bottom">Verifying your email...</p>
            <div className="spinner-verify" />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
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
            <p className="margin-bottom">{error}</p>

            {Object.keys(urlParams).length > 0 && (
              <div className="debug-panel">
                <p className="debug-title">URL Parameters:</p>
                {Object.entries(urlParams).map(([key, value]) => (
                  <div key={key} className="debug-item">
                    <span className="debug-key">{key}:</span>{" "}
                    <span className="debug-value">{value}</span>
                  </div>
                ))}
              </div>
            )}

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
