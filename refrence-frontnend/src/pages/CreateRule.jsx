import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateRuleWizard from "../components/rule/wizard/CreateRuleWizard";
import CreateRuleLegacy from "./CreateRule.legacy";
import { getCookie, TOKEN_NAME } from "../utils/cookie";

export default function CreateRule({ viewOnly = false }) {
  const navigate = useNavigate();
  const { ruleId } = useParams();
  const token = getCookie(TOKEN_NAME);
  const useLegacyForm = viewOnly || Boolean(ruleId);

  useEffect(() => {
    if (!token) {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, token]);

  if (!token) return null;

  if (useLegacyForm) {
    return <CreateRuleLegacy viewOnly={viewOnly} />;
  }

  return (
    <CreateRuleWizard />
  );
}