import apiService from "./apiService";
import { authHeaders } from "../utils/helper";
import { normalizeRuleReportsConfig } from "../utils/ruleReportsConfig";

const authConfig = (token = "") => (token ? { headers: authHeaders(token) } : {});

export const ruleService = {
  getRuleReportsConfig: async (storeId, token = "") => {
    const resolvedStoreId = Number(storeId);
    if (!resolvedStoreId) {
      throw new Error("Valid store_id is required");
    }
    const data = await apiService.get("amazon/rule/reports", {
      ...authConfig(token),
      params: {
        store_id: resolvedStoreId
      }
    });
    return normalizeRuleReportsConfig(data);
  },

  listRules: async (payload, token = "") =>
    apiService.post("amazon/rule/list", payload, authConfig(token)),

  getRuleDetails: async (payload, token = "") =>
    apiService.post("amazon/rule/details", payload, authConfig(token)),

  createRule: async (payload, token = "") =>
    apiService.post("amazon/rule/create", payload, authConfig(token)),

  updateRule: async (payload, token = "") =>
    apiService.post("amazon/rule/update", payload, authConfig(token)),

  deleteRule: async (payload, token = "") =>
    apiService.post("amazon/rule/delete", payload, authConfig(token)),

  executeRule: async (payload, token = "") =>
    apiService.post("amazon/rule/execute-rule", payload, authConfig(token)),

  listRuleCampaigns: async (payload, token = "") =>
    apiService.post("amazon/rule/campaign-rule-list", payload, authConfig(token)),

  listRuleProducts: async (payload, token = "") =>
    apiService.post("amazon/rule/product-rule-list", payload, authConfig(token)),

  listRuleUpdateProducts: async (payload, token = "") =>
    apiService.post("amazon/rule/update-product-rule-list", payload, authConfig(token))
};

export const getRuleReportsConfig = ruleService.getRuleReportsConfig;
export const listRules = ruleService.listRules;
export const getRuleDetails = ruleService.getRuleDetails;
export const createRule = ruleService.createRule;
export const updateRule = ruleService.updateRule;
export const deleteRule = ruleService.deleteRule;
export const executeRule = ruleService.executeRule;
export const listRuleCampaigns = ruleService.listRuleCampaigns;
export const listRuleProducts = ruleService.listRuleProducts;
export const listRuleUpdateProducts = ruleService.listRuleUpdateProducts;

export default ruleService;