import api from "./api";

class AdminFinanceService {
  async getAnalytics() {
    const res = await api.get("/admin/finance/analytics");
    return res.data; // { success, data }
  }

  async getInvoices(params = {}) {
    const res = await api.get("/admin/finance/invoices", { params });
    return res.data;
  }

  async getRefunds(params = {}) {
    const res = await api.get("/admin/finance/refunds", { params });
    return res.data;
  }

  async getPayouts(params = {}) {
    const res = await api.get("/admin/finance/payouts", { params });
    return res.data;
  }

  async getReferrals(params = {}) {
    const res = await api.get("/admin/finance/referrals", { params });
    return res.data;
  }
}

const adminFinanceService = new AdminFinanceService();
export default adminFinanceService;
