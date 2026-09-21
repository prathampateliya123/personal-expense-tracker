import apiService from "./apiService";
import axiosInstance from "../lib/axiosInstance";

export const reportService = {
  getSummary: ({ period = "monthly", year, month } = {}) => {
    const params = new URLSearchParams();
    params.set("period", period);
    if (year != null) params.set("year", String(year));
    if (month != null) params.set("month", String(month));
    return apiService.get(`/reports/summary?${params.toString()}`);
  },

  downloadCsv: async ({
    period = "monthly",
    year,
    month,
    section = "all",
  } = {}) => {
    const params = new URLSearchParams();
    params.set("period", period);
    params.set("section", section);
    if (year != null) params.set("year", String(year));
    if (month != null) params.set("month", String(month));

    const response = await axiosInstance.get(
      `/reports/export.csv?${params.toString()}`,
      { responseType: "blob" }
    );

    const disposition = response.headers["content-disposition"] || "";
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const filename = match?.[1] || `report-${period}.csv`;

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { filename };
  },
};

export default reportService;
