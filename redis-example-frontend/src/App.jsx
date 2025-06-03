import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, RefreshCw, Search } from "lucide-react";

function App() {
  const [tests, setTests] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    testName: "",
    testExample: "",
  });

  const API_BASE = "http://localhost:8080/api/test";

  const fetchAllTests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      if (!text) {
        setTests({});
        return;
      }

      const data = JSON.parse(text);
      setTests(data || {});
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Testler yüklenirken hata oluştu: ${err.message}`);
      setTests({});
    } finally {
      setLoading(false);
    }
  };

  const getAllTestsForSearch = async () => {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    if (!text) {
      return {};
    }

    return JSON.parse(text) || {};
  };

  const searchSpecificTest = async (testName) => {
    setIsSearching(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE}/${encodeURIComponent(testName)}`
      );
      if (response.status === 404) {
        setTests({});
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      if (!text) {
        setTests({});
        return;
      }

      const test = JSON.parse(text);
      if (test) {
        setTests({ [`test:${testName}`]: test });
      } else {
        setTests({});
      }
    } catch (err) {
      console.error("Search specific test error:", err);
      setTests({});
    } finally {
      setIsSearching(false);
    }
  };

  const searchTests = async (query) => {
    if (!query.trim()) {
      fetchAllTests();
      return;
    }

    setIsSearching(true);
    setError("");
    try {
      const allTests = await getAllTestsForSearch();

      const filteredTests = {};
      const lowerQuery = query.toLowerCase().trim();

      Object.entries(allTests).forEach(([key, test]) => {
        if (
          test &&
          ((test.testName &&
            test.testName.toLowerCase().includes(lowerQuery)) ||
            (test.testExample &&
              test.testExample.toLowerCase().includes(lowerQuery)))
        ) {
          filteredTests[key] = test;
        }
      });

      setTests(filteredTests);
    } catch (err) {
      console.error("Search error:", err);
      setError(`Arama sırasında hata oluştu: ${err.message}`);
      setTests({});
    } finally {
      setIsSearching(false);
    }
  };

  const saveTest = async (testData) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...testData,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Test kaydedilirken hata oluştu");

      await fetchAllTests();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (testName) => {
    if (
      !window.confirm(
        `"${testName}" testini silmek istediğinizden emin misiniz?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE}/${encodeURIComponent(testName)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Test silinirken hata oluştu");

      await fetchAllTests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ testName: "", testExample: "" });
    setIsFormOpen(false);
    setEditingTest(null);
  };

  const handleSubmit = () => {
    if (!formData.testName.trim() || !formData.testExample.trim()) {
      setError("Lütfen tüm alanları doldurun");
      return;
    }
    saveTest(formData);
  };

  const startEdit = (test) => {
    setFormData({
      testName: test.testName,
      testExample: test.testExample,
    });
    setEditingTest(test.testName);
    setIsFormOpen(true);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const timeoutId = setTimeout(() => {
      searchTests(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchAllTests();
  };

  useEffect(() => {
    fetchAllTests();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchTests(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Test State Manager
          </h1>
          <p className="text-gray-600">
            Spring Boot Redis Backend ile Test Yönetimi
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <X className="w-5 h-5 mr-2" />
              {error}
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search
                className={`w-5 h-5 text-gray-400 ${
                  isSearching ? "animate-pulse" : ""
                }`}
              />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Test adı veya örneği ile ara..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="text-center mt-2">
              <span className="text-sm text-gray-600">
                "{searchQuery}" için {Object.keys(tests).length} sonuç bulundu
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <button
            onClick={() => setIsFormOpen(true)}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Test Ekle
          </button>

          <button
            onClick={fetchAllTests}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Tümünü Göster
          </button>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingTest ? "Test Düzenle" : "Yeni Test Ekle"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Adı
                    </label>
                    <input
                      type="text"
                      value={formData.testName}
                      onChange={(e) =>
                        setFormData({ ...formData, testName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Test adını girin"
                      disabled={editingTest}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Örneği
                    </label>
                    <textarea
                      value={formData.testExample}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          testExample: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                      placeholder="Test örneğini girin"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                    <button
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(tests).map(([key, test]) => (
            <div
              key={key}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 truncate">
                    {test.testName}
                  </h3>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => startEdit(test)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTest(test.testName)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Test Örneği:</p>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                      {test.testExample}
                    </p>
                  </div>

                  {test.createdAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Oluşturulma Tarihi:
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(test.createdAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(tests).length === 0 && !loading && !isSearching && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchQuery ? (
                <Search className="w-16 h-16 mx-auto" />
              ) : (
                <Plus className="w-16 h-16 mx-auto" />
              )}
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              {searchQuery
                ? "Arama sonucu bulunamadı"
                : "Henüz test bulunmuyor"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? `"${searchQuery}" için herhangi bir test bulunamadı`
                : "İlk testinizi eklemek için butonu kullanın"}
            </p>
            {searchQuery ? (
              <button
                onClick={clearSearch}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mr-4"
              >
                Aramayı Temizle
              </button>
            ) : (
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                İlk Testi Ekle
              </button>
            )}
          </div>
        )}

        {(loading || isSearching) && Object.keys(tests).length === 0 && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">
              {isSearching ? "Aranıyor..." : "Testler yükleniyor..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
