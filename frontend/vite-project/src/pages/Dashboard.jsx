import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("applied");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingJobId, setEditingJobId] = useState(null);

  const fetchJobs = async () => {
    try {
      setError("");
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Missing auth token. Please log in again.");
        return;
      }

      const response = await axios.get(`${apiBaseUrl}/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(response?.data?.jobs || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load jobs";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, []);

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setStatus("applied");
    setEditingJobId(null);
  };

  const handleCreateJob = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!title || !company) {
      setFormError("Title and company are required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setFormError("Missing auth token. Please log in again.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingJobId) {
        await axios.put(
          `${apiBaseUrl}/jobs/${editingJobId}`,
          {
            title,
            company,
            status,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${apiBaseUrl}/jobs`,
          {
            title,
            company,
            status,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      resetForm();
      await fetchJobs();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to create job";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditJob = (job) => {
    setTitle(job.title || "");
    setCompany(job.company || "");
    setStatus(job.status || "applied");
    setEditingJobId(job._id);
    setFormError("");
  };

  const handleDeleteJob = async (jobId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Missing auth token. Please log in again.");
      return;
    }

    try {
      await axios.delete(`${apiBaseUrl}/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      if (editingJobId === jobId) {
        resetForm();
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to delete job";
      setError(message);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || job.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-3xl">
        <div className="relative mb-10 flex flex-col items-center gap-4 text-center">
          <div className="flex flex-col items-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-50">Your Jobs</h1>
            <p className="mt-2 text-sm text-slate-400">
              Track your active applications and outcomes.
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="absolute right-0 top-0 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500"
          >
            Logout
          </button>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-slate-50">
            {editingJobId ? "Edit job" : "Add a job"}
          </h2>
          <form onSubmit={handleCreateJob} className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                placeholder="Frontend Developer"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300" htmlFor="company">
                Company
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                placeholder="Acme Inc."
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
                <option value="offer">Offer</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? editingJobId
                    ? "Updating..."
                    : "Adding..."
                  : editingJobId
                  ? "Update Job"
                  : "Add Job"}
              </button>
            </div>
          </form>

          {editingJobId ? (
            <button
              type="button"
              onClick={resetForm}
              className="mt-4 text-sm font-semibold text-slate-300 hover:text-slate-100"
            >
              Cancel edit
            </button>
          ) : null}

          {formError ? (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {formError}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200">
              Applied
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">
              {jobs.filter((j) => j.status === "applied").length}
            </h2>
          </div>

          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200">
              Interview
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">
              {jobs.filter((j) => j.status === "interview").length}
            </h2>
          </div>

          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
              Offers
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">
              {jobs.filter((j) => j.status === "offer").length}
            </h2>
          </div>

          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-200">
              Rejected
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">
              {jobs.filter((j) => j.status === "rejected").length}
            </h2>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
          >
            <option value="all">All</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
            <option value="offer">Offer</option>
          </select>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
            Loading jobs...
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {!isLoading && !error ? (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
                No jobs yet. Create your first job to get started.
              </div>
            ) : (
              filteredJobs.map((job) => (
                <article
                  key={job._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-50">
                        {job.title}
                      </h2>
                      <p className="text-sm text-slate-400">{job.company}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex w-fit items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
                        {job.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEditJob(job)}
                        className="text-xs font-semibold text-slate-200 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job._id)}
                        className="text-xs font-semibold text-red-300 hover:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Dashboard;
