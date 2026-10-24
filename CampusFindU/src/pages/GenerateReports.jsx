import { useState } from "react";
import axios from "axios";
import Toast from "../utils/toast";
import SearchableSelect from "../components/SearchableSelect";

export default function GenerateReports() {
  const [reportType, setReportType] = useState("Lost Items Summary");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [format, setFormat] = useState("PDF");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCSV = (data, filename) => {
    if (data.length === 0) {
      return Toast.fire(
        "Empty",
        "No records found for this date range.",
        "info",
      );
    }
    const headers = Object.keys(data[0]).join(",");
    const rows = data
      .map((obj) =>
        Object.values(obj)
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const generatePDF = (data, title) => {
    if (data.length === 0) {
      return Toast.fire(
        "Empty",
        "No records found for this date range.",
        "info",
      );
    }
    const headers = Object.keys(data[0]);
    let html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h2 { color: #0A4222; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0A4222; color: white; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <p>Date Generated: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead><tr>${headers
              .map((h) => `<th>${h}</th>`)
              .join("")}</tr></thead>
            <tbody>
              ${data
                .map(
                  (row) =>
                    `<tr>${headers
                      .map((h) => `<td>${row[h] || ""}</td>`)
                      .join("")}</tr>`,
                )
                .join("")}
            </tbody>
          </table>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let cleanData = [];

      if (reportType === "Claims Report") {
        const [claimsRes, itemsRes] = await Promise.all([
          axios.get("https://campusfindu-backend.onrender.com/api/claims"),
          axios.get("https://campusfindu-backend.onrender.com/api/found-items"),
        ]);
        let data = claimsRes.data;

        if (dateFrom) {
          data = data.filter(
            (item) => new Date(item.created_at) >= new Date(dateFrom),
          );
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          data = data.filter((item) => new Date(item.created_at) <= to);
        }

        const itemsMap = new Map((itemsRes.data || []).map((i) => [i.id, i]));

        cleanData = data.map((claim) => {
          const foundItem = itemsMap.get(claim.found_item_id) || {};
          return {
            ID: claim.id,
            Title: foundItem.title || claim.title || "N/A",
            Category: foundItem.category || claim.category || "N/A",
            Location: foundItem.location_name || claim.location_name || "N/A",
            Status: claim.status,
            Date: new Date(claim.created_at).toLocaleDateString(),
          };
        });
      } else {
        const endpoint =
          reportType === "Lost Items Summary"
            ? "/api/lost-items"
            : "/api/found-items";

        const response = await axios.get(
          `https://campusfindu-backend.onrender.com${endpoint}`,
        );
        let data = response.data;

        if (dateFrom) {
          data = data.filter(
            (item) => new Date(item.created_at) >= new Date(dateFrom),
          );
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          data = data.filter((item) => new Date(item.created_at) <= to);
        }

        cleanData = data.map((item) => {
          const { id, title, category, status, created_at, location_name } =
            item;
          return {
            ID: id,
            Title: title || "N/A",
            Category: category || "N/A",
            Location: location_name || "N/A",
            Status: status,
            Date: new Date(created_at).toLocaleDateString(),
          };
        });
      }

      if (format === "Excel (CSV)") {
        generateCSV(cleanData, reportType.replace(/\s+/g, "_"));
      } else {
        generatePDF(cleanData, reportType);
      }
    } catch (error) {
      console.error(error);
      Toast.fire("Error", "Failed to generate report. Check network.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-lg font-sans bg-white border border-gray-200 rounded-xl shadow-sm p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Generate Reports</h2>

      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Report Type
          </label>
          <SearchableSelect
            id="reportType"
            name="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              "Lost Items Summary",
              "Found Items Summary",
              "Claims Report",
            ]}
            placeholder="Select report type"
            searchPlaceholder="Search report type..."
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mmsu-green bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green transition shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green transition shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Format
          </label>
          <SearchableSelect
            id="format"
            name="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={["PDF", "Excel (CSV)"]}
            placeholder="Select format"
            searchPlaceholder="Search format..."
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mmsu-green bg-white"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-mmsu-green text-white font-bold px-8 py-3 rounded-lg hover:bg-mmsu-light-green shadow-md mt-4 transition disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Report"}
        </button>
      </div>
    </div>
  );
}
