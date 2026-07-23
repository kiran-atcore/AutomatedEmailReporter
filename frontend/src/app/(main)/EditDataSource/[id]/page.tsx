"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/axios";
import { useAlert } from "@/components/AlertModal";

export default function EditSourcePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingSql, setGeneratingSql] = useState(false);
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    connection_type: "api",
    endpoint: "",
    auth_token: "",
    config: { query: "", table_name: "" }
  });

  useEffect(() => {
    if (!id) return;
    const fetchSource = async () => {
      try {
        const response = await api.get(`/reports/datasources/${id}/`);
        setFormData({
          name: response.data.name || "",
          connection_type: response.data.connection_type || "api",
          endpoint: response.data.endpoint || "",
          auth_token: response.data.auth_token || "",
          config: response.data.config || { query: "", table_name: "" }
        });
      } catch (err) {
        console.error("Failed to load data source", err);
        showAlert("Failed to load data source details.", "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchSource();
  }, [id]);

  const handleGenerateSql = async () => {
    if (!formData.endpoint || !aiPrompt) {
      showAlert("Please enter a connection string and a prompt first.", "Error");
      return;
    }
    setGeneratingSql(true);
    try {
      const response = await api.post("/reports/datasources/generate_sql/", {
        endpoint: formData.endpoint,
        prompt: aiPrompt
      });
      setFormData({...formData, config: { ...formData.config, query: response.data.query }});
      setAiMode(false); // Switch back to manual mode to show the generated query
    } catch (err: any) {
      console.error(err);
      showAlert(err.response?.data?.message || "Failed to generate SQL.", "Error");
    } finally {
      setGeneratingSql(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // First, test the connection
    try {
      await api.post("/reports/datasources/test_connection/", {
        endpoint: formData.endpoint,
        auth_token: formData.auth_token,
        connection_type: formData.connection_type,
        config: formData.config
      });
    } catch (testErr: any) {
      console.error("Connection test failed", testErr);
      let errorMsg = "Invalid Endpoint or Authentication.";
      if (testErr.response?.data?.message) {
        errorMsg = testErr.response.data.message;
      } else if (testErr.message === "Network Error") {
        errorMsg = "Network Error: Could not reach the backend server. Is it running?";
      } else if (testErr.message) {
        errorMsg = testErr.message;
      }
      showAlert(`Connection Test Failed: ${errorMsg}`, "Error");
      setSaving(false);
      return; // Stop saving if the test fails
    }

    try {
      await api.put(`/reports/datasources/${id}/`, formData);
      router.push("/DataSources");
    } catch (err) {
      console.error("Failed to update data source", err);
      showAlert("Failed to save changes.", "Error");
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      await api.post(`/reports/datasources/test_connection/`, formData);
      showAlert("Connection successful!", "Success");
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Invalid Endpoint or Authentication.";
      showAlert(`Connection failed. ${errorMsg}`, "Error");
    } finally {
      setTestingConnection(false);
    }
  };

  if (loading) {
    return <div className="container py-5 text-center">Loading...</div>;
  }

  return (
    <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="p-4 p-md-5 position-relative overflow-hidden"
              style={{ 
                background: "rgba(10, 10, 12, 0.6)", 
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                borderRadius: "24px"
              }}
            >
              {/* Background ambient glow */}
              <motion.div 
                className="position-absolute top-0 end-0"
                style={{ width: "300px", height: "300px", background: "var(--theme-accent)", filter: "blur(100px)", borderRadius: "50%", opacity: 0.1 }}
                animate={{ opacity: [0.05, 0.15, 0.05], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="mb-5 position-relative z-1 d-flex align-items-center gap-3">
                <Link href="/DataSources" className="premium-back-btn">
                  <i className="bi bi-arrow-left"></i>
                </Link>
                <div>
                  <h3 className="fw-bolder mb-1" style={{ fontFamily: "var(--font-righteous)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2rem", letterSpacing: "0.5px" }}>Edit Data Source</h3>
                  <p className="theme-text-muted mb-0" style={{ fontSize: "1.1rem" }}>Update connection settings and authentication.</p>
                </div>
              </div>

              <motion.div 
                className="position-relative z-1"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                initial="hidden"
                animate="show"
              >
                <form onSubmit={handleSubmit}>
                  <div className="row g-4 mb-4">
                    <div className="col-12">
                      <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }}>
                        <label className="premium-label">
                          <i className="bi bi-tag"></i> Source Name
                        </label>
                        <input 
                          type="text" 
                          className="form-control premium-input" 
                          placeholder="e.g., Production PostgreSQL" 
                          required 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </motion.div>
                    </div>

                    <div className="col-12">
                      <motion.div variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { type: "spring", delay: 0.1 } } }}>
                        <label className="premium-label">
                          <i className="bi bi-diagram-3"></i> Connection Type
                        </label>
                        <select 
                          className="form-select premium-input" 
                          required
                          value={formData.connection_type}
                          onChange={(e) => setFormData({...formData, connection_type: e.target.value})}
                          style={{ appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ff5722' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "16px 12px" }}
                        >
                          <option value="api" style={{ color: "black" }}>REST API</option>
                          <option value="sql" style={{ color: "black" }}>SQL Database</option>
                          <option value="google_sheets" style={{ color: "black" }}>Google Sheets</option>
                          <option value="airtable" style={{ color: "black" }}>Airtable</option>
                        </select>
                      </motion.div>
                    </div>
                  </div>

                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", delay: 0.3 } } }} className="mb-4">
                    <label className="premium-label">
                      <i className="bi bi-link-45deg"></i> 
                      {formData.connection_type === 'api' ? 'Endpoint URL' : 
                       formData.connection_type === 'sql' ? 'Connection String' :
                       formData.connection_type === 'google_sheets' ? 'Google Sheet URL' :
                       'Airtable Base ID'}
                    </label>
                    <input 
                      type="text" 
                      className="form-control premium-input" 
                      placeholder={
                        formData.connection_type === 'api' ? "https://api.example.com/v1/data" : 
                        formData.connection_type === 'sql' ? "sqlite:///dummy_test.db or postgresql://..." :
                        formData.connection_type === 'google_sheets' ? "https://docs.google.com/spreadsheets/d/.../edit" :
                        "appXXXXXXXXXXXXXX"
                      } 
                      required 
                      value={formData.endpoint}
                      onChange={(e) => setFormData({...formData, endpoint: e.target.value})}
                    />
                    {formData.connection_type === 'google_sheets' && (
                       <div className="form-text text-white-50 mt-2">
                         <i className="bi bi-info-circle me-1"></i> Make sure your Google Sheet is set to <strong>"Anyone with the link can view"</strong>.
                       </div>
                    )}
                  </motion.div>

                  {formData.connection_type === 'api' ? (
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", delay: 0.4 } } }} className="mb-5">
                      <label className="premium-label">
                        <i className="bi bi-shield-lock"></i> Authentication <span className="badge bg-secondary bg-opacity-25 text-white-50 ms-2 text-lowercase rounded-pill px-2" style={{fontSize: "0.7rem", letterSpacing: "0"}}>Optional</span>
                      </label>
                      <input 
                        type="password" 
                        className="form-control premium-input mb-3" 
                        placeholder="Bearer Token or API Key" 
                        value={formData.auth_token}
                        onChange={(e) => setFormData({...formData, auth_token: e.target.value})}
                      />
                      <div className="d-flex align-items-center gap-2 p-3 rounded-4" style={{ background: "rgba(255, 138, 101, 0.1)", border: "1px solid rgba(255, 138, 101, 0.2)" }}>
                        <i className="bi bi-info-circle text-warning fs-5"></i> 
                        <span className="text-white-50" style={{ fontSize: "0.9rem" }}>Leave blank to keep existing, or enter a new token to update securely.</span>
                      </div>
                    </motion.div>
                  ) : formData.connection_type === 'sql' ? (
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", delay: 0.4 } } }} className="mb-5">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="premium-label mb-0">
                          <i className="bi bi-code-slash"></i> SQL Query
                        </label>
                        <div className="d-flex p-1 rounded-pill" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 2px 5px rgba(0,0,0,0.2)" }}>
                          <button 
                            type="button" 
                            className="btn btn-sm border-0 rounded-pill px-3 fw-bold"
                            style={{ 
                              background: !aiMode ? "rgba(255,255,255,0.1)" : "transparent",
                              color: !aiMode ? "white" : "rgba(255,255,255,0.4)",
                              transition: "all 0.3s ease",
                              boxShadow: !aiMode ? "0 2px 10px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.2)" : "none"
                            }} 
                            onClick={() => setAiMode(false)}
                          >
                            Manual
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-sm border-0 rounded-pill px-3 fw-bold d-flex align-items-center gap-1" 
                            style={{ 
                              background: aiMode ? "linear-gradient(135deg, #ff5722 0%, #ff8a65 100%)" : "transparent",
                              color: aiMode ? "white" : "rgba(255,255,255,0.4)",
                              transition: "all 0.3s ease",
                              boxShadow: aiMode ? "0 4px 15px rgba(255, 87, 34, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)" : "none"
                            }}
                            onClick={() => setAiMode(true)}
                          >
                            <i className="bi bi-stars" style={{ color: aiMode ? "#ffccbc" : "inherit" }}></i> AI Assist
                          </button>
                        </div>
                      </div>

                      {aiMode ? (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, y: -10 }} 
                          animate={{ opacity: 1, height: "auto", y: 0 }} 
                          className="p-4 rounded-4 position-relative overflow-hidden mb-3" 
                          style={{ 
                            background: "linear-gradient(135deg, rgba(255, 87, 34, 0.1) 0%, rgba(255, 138, 101, 0.05) 100%)", 
                            border: "1px solid rgba(255, 87, 34, 0.3)",
                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.2)",
                            backdropFilter: "blur(10px)"
                          }}
                        >
                          <div className="position-relative z-1">
                            <label className="text-white fw-semibold mb-3 d-flex align-items-center gap-2" style={{ fontSize: "1rem", letterSpacing: "0.5px" }}>
                              <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "24px", height: "24px", background: "rgba(255, 87, 34, 0.2)", color: "#ffccbc" }}>
                                <i className="bi bi-chat-left-dots-fill" style={{ fontSize: "0.7rem" }}></i>
                              </div>
                              Describe the data you want to extract
                            </label>
                            <div className="d-flex flex-column gap-3">
                              <input 
                                type="text" 
                                className="form-control premium-input shadow-inner flex-grow-1" 
                                placeholder="e.g., Select all sales data ordered by highest revenue..." 
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                style={{ 
                                  background: "rgba(0,0,0,0.2)", 
                                  border: "1px solid rgba(255, 87, 34, 0.4)",
                                  color: "white"
                                }}
                              />
                              <motion.button 
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                type="button" 
                                className="btn text-white fw-bold shadow-sm px-4 py-2 d-flex align-items-center justify-content-center"
                                style={{ 
                                  background: "linear-gradient(135deg, #ff5722 0%, #ff8a65 100%)",
                                  border: "none",
                                  boxShadow: "0 4px 15px rgba(255, 87, 34, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)",
                                  whiteSpace: "nowrap"
                                }}
                                onClick={handleGenerateSql}
                                disabled={generatingSql}
                              >
                                {generatingSql ? (
                                  <><span className="spinner-border spinner-border-sm me-2"></span> Generating...</>
                                ) : (
                                  <><i className="bi bi-magic me-2"></i> Generate SQL</>
                                )}
                              </motion.button>
                            </div>
                            <div className="mt-3 text-white-50 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
                              <i className="bi bi-info-circle-fill text-info"></i> Ensure your Connection String is valid so the AI can analyze your schema.
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <textarea 
                          className="form-control premium-input" 
                          placeholder="SELECT * FROM sales LIMIT 100;" 
                          rows={4}
                          required 
                          value={formData.config?.query || ""}
                          onChange={(e) => setFormData({...formData, config: { ...formData.config, query: e.target.value }})}
                          style={{ fontFamily: 'monospace' }}
                        />
                      )}
                    </motion.div>
                  ) : formData.connection_type === 'airtable' ? (
                     <>
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", delay: 0.4 } } }} className="mb-4">
                          <label className="premium-label">
                            <i className="bi bi-table"></i> Table Name
                          </label>
                          <input 
                            type="text" 
                            className="form-control premium-input" 
                            placeholder="e.g., Grid view or Users" 
                            required 
                            value={formData.config?.table_name || ""}
                            onChange={(e) => setFormData({...formData, config: { ...formData.config, table_name: e.target.value }})}
                          />
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", delay: 0.5 } } }} className="mb-5">
                          <label className="premium-label">
                            <i className="bi bi-shield-lock"></i> Personal Access Token
                          </label>
                          <input 
                            type="password" 
                            className="form-control premium-input mb-3" 
                            placeholder="patXXXXXXXXXXXXXX" 
                            value={formData.auth_token}
                            onChange={(e) => setFormData({...formData, auth_token: e.target.value})}
                          />
                          <div className="d-flex align-items-center gap-2 p-3 rounded-4" style={{ background: "rgba(255, 138, 101, 0.1)", border: "1px solid rgba(255, 138, 101, 0.2)" }}>
                            <i className="bi bi-info-circle text-warning fs-5"></i> 
                            <span className="text-white-50" style={{ fontSize: "0.9rem" }}>Leave blank to keep existing, or enter a new token to update securely.</span>
                          </div>
                        </motion.div>
                     </>
                  ) : null}

                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", delay: 0.4 } } }} className="d-flex flex-column flex-md-row justify-content-md-end gap-3 pt-4 border-top border-secondary border-opacity-25">
                    <div className="btn-responsive-wrap">
                      <Link href="/DataSources" className="btn btn-responsive premium-cancel-btn px-4 py-3 text-decoration-none shadow-sm">
                        Cancel
                      </Link>
                    </div>
                    <div className="btn-responsive-wrap">
                      <button 
                        type="button" 
                        className="btn btn-responsive premium-test-btn px-4 py-3 shadow-sm gap-2"
                        onClick={handleTestConnection}
                        disabled={testingConnection || saving}
                      >
                        {testingConnection ? (
                           <><span className="spinner-border spinner-border-sm"></span> Testing...</>
                        ) : (
                           <><i className="bi bi-lightning-charge fs-5"></i> Test Connection</>
                        )}
                      </button>
                    </div>
                    <div className="btn-responsive-wrap">
                      <button 
                        type="submit" 
                        className="btn btn-responsive premium-submit-btn px-5 py-3 shadow gap-3"
                        disabled={saving}
                      >
                        {saving ? (
                           <><span className="spinner-border spinner-border-sm"></span> Saving...</>
                        ) : (
                           <><i className="bi bi-check2-circle fs-5"></i> Save Changes</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
  );
}
